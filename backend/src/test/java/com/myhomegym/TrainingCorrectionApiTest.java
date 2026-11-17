package com.myhomegym;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;

/** Corrección de una sesión pasada: series, volumen y récords en una sola transacción (FR-3.19, RN-4.15). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TrainingCorrectionApiTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    private String register() throws Exception {
        String username = "correccion-" + UUID.randomUUID().toString().substring(0, 8);
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + username + "\",\"password\":\"contrasena-segura\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + mapper.readTree(body).get("accessToken").asText();
    }

    private ResultActions send(MockHttpServletRequestBuilder request, String token, String json) throws Exception {
        return mvc.perform(request.header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    /** Guarda un entreno con una serie de 100 kg × 5 y un récord de peso máximo; devuelve {training, set, record}. */
    private String[] trainingWithRecord(String user) throws Exception {
        String training = UUID.randomUUID().toString();
        String set = UUID.randomUUID().toString();
        String record = UUID.randomUUID().toString();
        send(post("/api/trainings/complete"), user, """
                {"training":{"id":"%s","fecha":"2026-11-10T10:00:00.000Z","completado":true,"volumenTotal":500},
                 "sets":[{"id":"%s","entrenamientoId":"x","ejercicioId":"Barbell_Squat","serieNumero":1,
                  "repeticionesRealizadas":5,"pesoUtilizado":100,"type":"normal","fecha":"2026-11-10T10:00:00.000Z"}]}
                """.formatted(training, set)).andExpect(status().isCreated());
        send(put("/api/personal-records/" + record), user, """
                {"ejercicioId":"Barbell_Squat","tipo":"peso_maximo","valor":100,"fecha":"2026-11-10T10:00:00.000Z",
                 "detalle":"100kg x 5 reps"}
                """).andExpect(status().isOk());
        return new String[] { training, set, record };
    }

    @Test
    void correctingASessionUpdatesSetsVolumeAndRecordsTogether() throws Exception {
        String user = register();
        String[] ids = trainingWithRecord(user);
        String newRecord = UUID.randomUUID().toString();

        send(post("/api/trainings/" + ids[0] + "/correction"), user, """
                {"sets":[{"id":"%s","repeticionesRealizadas":5,"pesoUtilizado":60}],"volumenTotal":300,
                 "updatedAt":"2026-11-17T08:00:00.000Z",
                 "records":{"remove":["%s"],"add":[{"id":"%s","ejercicioId":"Barbell_Squat","tipo":"peso_maximo",
                  "valor":60,"fecha":"2026-11-10T10:00:00.000Z","detalle":"60kg x 5 reps"}]}}
                """.formatted(ids[1], ids[2], newRecord))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.volumenTotal").value(300));

        mvc.perform(get("/api/performed-sets/" + ids[1]).header("Authorization", user))
                .andExpect(jsonPath("$.pesoUtilizado").value(60));
        mvc.perform(get("/api/personal-records").header("Authorization", user))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(newRecord))
                .andExpect(jsonPath("$[0].valor").value(60));
    }

    @Test
    void anInvalidCorrectionChangesNothing() throws Exception {
        String user = register();
        String[] ids = trainingWithRecord(user);

        // El récord nuevo tiene un tipo desconocido: se rechaza todo, también el cambio de la serie.
        send(post("/api/trainings/" + ids[0] + "/correction"), user, """
                {"sets":[{"id":"%s","repeticionesRealizadas":5,"pesoUtilizado":60}],"volumenTotal":300,
                 "records":{"remove":["%s"],"add":[{"id":"%s","ejercicioId":"Barbell_Squat","tipo":"inventado",
                  "valor":60,"fecha":"2026-11-10T10:00:00.000Z"}]}}
                """.formatted(ids[1], ids[2], UUID.randomUUID()))
                .andExpect(status().isBadRequest());

        // Un récord nuevo con el id de otro récord ya guardado falla al final, cuando la serie ya se ha
        // cambiado y el récord antiguo ya se ha borrado: la transacción lo deshace todo.
        String taken = UUID.randomUUID().toString();
        send(put("/api/personal-records/" + taken), user, """
                {"ejercicioId":"GLOBAL","tipo":"volumen_total","valor":500,"fecha":"2026-11-10T10:00:00.000Z"}
                """).andExpect(status().isOk());
        send(post("/api/trainings/" + ids[0] + "/correction"), user, """
                {"sets":[{"id":"%s","repeticionesRealizadas":5,"pesoUtilizado":60}],"volumenTotal":300,
                 "records":{"remove":["%s"],"add":[{"id":"%s","ejercicioId":"Barbell_Squat","tipo":"peso_maximo",
                  "valor":60,"fecha":"2026-11-10T10:00:00.000Z"}]}}
                """.formatted(ids[1], ids[2], taken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DUPLICATE_ID"));

        // Una serie de otro usuario se trata como inexistente.
        String other = register();
        String[] foreign = trainingWithRecord(other);
        send(post("/api/trainings/" + ids[0] + "/correction"), user, """
                {"sets":[{"id":"%s","repeticionesRealizadas":1,"pesoUtilizado":1}],"volumenTotal":1,
                 "records":{"remove":["%s"],"add":[]}}
                """.formatted(foreign[1], ids[2]))
                .andExpect(status().isNotFound());

        mvc.perform(get("/api/performed-sets/" + ids[1]).header("Authorization", user))
                .andExpect(jsonPath("$.pesoUtilizado").value(100));
        mvc.perform(get("/api/trainings/" + ids[0]).header("Authorization", user))
                .andExpect(jsonPath("$.volumenTotal").value(500));
        mvc.perform(get("/api/personal-records/" + ids[2]).header("Authorization", user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valor").value(100));
        mvc.perform(get("/api/personal-records").header("Authorization", user))
                .andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/api/performed-sets/" + foreign[1]).header("Authorization", other))
                .andExpect(jsonPath("$.pesoUtilizado").value(100));
    }
}
