package com.myhomegym;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
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
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    private record Login(String token, Cookie refresh) {
    }

    private Login register(String username) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + username + "\",\"password\":\"contrasena-segura\"}"))
                .andExpect(status().isCreated())
                .andExpect(cookie().httpOnly("mhg_refresh", true))
                .andReturn();
        JsonNode body = mapper.readTree(result.getResponse().getContentAsString());
        return new Login(body.get("accessToken").asText(), result.getResponse().getCookie("mhg_refresh"));
    }

    private static String bearer(Login login) {
        return "Bearer " + login.token();
    }

    @Test
    void protectedEndpointsRequireToken() throws Exception {
        mvc.perform(get("/api/routines")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/routines").header("Authorization", "Bearer no-es-un-jwt"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/health")).andExpect(status().isOk());
    }

    @Test
    void registerRejectsDuplicatesAndWeakPasswords() throws Exception {
        register("duplicado");
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"DUPLICADO\",\"password\":\"contrasena-segura\"}"))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"corto\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginFailsWithWrongPasswordAndLocksAfterRepeatedFailures() throws Exception {
        register("bloqueo");
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"username\":\"bloqueo\",\"password\":\"incorrecta\"}"))
                    .andExpect(status().isUnauthorized());
        }
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"bloqueo\",\"password\":\"contrasena-segura\"}"))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void refreshTokenRotatesAndReuseRevokesSession() throws Exception {
        Login login = register("rotacion");

        MvcResult refreshed = mvc.perform(post("/api/auth/refresh").cookie(login.refresh()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();
        Cookie rotated = refreshed.getResponse().getCookie("mhg_refresh");
        assertThat(rotated.getValue()).isNotEqualTo(login.refresh().getValue());

        // Reutilizar el token antiguo se trata como robo: se rechaza y se revocan todas las sesiones.
        mvc.perform(post("/api/auth/refresh").cookie(login.refresh())).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/refresh").cookie(rotated)).andExpect(status().isUnauthorized());
    }

    @Test
    void usersCannotSeeOrOverwriteEachOthersData() throws Exception {
        Login ana = register("ana");
        Login bruno = register("bruno");
        String id = UUID.randomUUID().toString();
        String routine = "{\"nombre\":\"Pierna\",\"diasSemana\":[\"lunes\"],\"activa\":true,\"color\":\"#E5383B\"}";

        mvc.perform(put("/api/routines/" + id).header("Authorization", bearer(ana))
                .contentType(MediaType.APPLICATION_JSON).content(routine))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ownerId").doesNotExist());

        mvc.perform(get("/api/routines/" + id).header("Authorization", bearer(bruno)))
                .andExpect(status().isNotFound());
        mvc.perform(put("/api/routines/" + id).header("Authorization", bearer(bruno))
                .contentType(MediaType.APPLICATION_JSON).content(routine))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/routines/" + id).header("Authorization", bearer(bruno)))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/routines").header("Authorization", bearer(bruno)))
                .andExpect(jsonPath("$.length()").value(0));

        mvc.perform(patch("/api/routines/" + id).header("Authorization", bearer(ana))
                .contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Pierna pesada\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Pierna pesada"))
                .andExpect(jsonPath("$.diasSemana[0]").value("lunes"));
    }

    @Test
    void completedTrainingIsSavedWithItsSetsAndDeletedTogether() throws Exception {
        Login user = register("entreno");
        String trainingId = UUID.randomUUID().toString();
        String body = """
                {"training":{"id":"%s","fecha":"2026-11-12T10:00:00.000Z","duracionMinutos":45,
                  "completado":true,"volumenTotal":1200},
                 "sets":[{"id":"%s","entrenamientoId":"x","ejercicioId":"Barbell_Squat","serieNumero":1,
                  "repeticionesRealizadas":5,"pesoUtilizado":100,"type":"normal","fecha":"2026-11-12T10:05:00.000Z"},
                  {"id":"%s","entrenamientoId":"x","ejercicioId":"Barbell_Squat","serieNumero":2,
                  "repeticionesRealizadas":5,"pesoUtilizado":140,"type":"normal","fecha":"2026-11-12T10:08:00.000Z"}]}
                """.formatted(trainingId, UUID.randomUUID(), UUID.randomUUID());

        mvc.perform(post("/api/trainings/complete").header("Authorization", bearer(user))
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/performed-sets").header("Authorization", bearer(user)))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].entrenamientoId").value(trainingId));

        mvc.perform(delete("/api/trainings/" + trainingId).header("Authorization", bearer(user)))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/performed-sets").header("Authorization", bearer(user)))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void backupExportsAndRestoresUserData() throws Exception {
        Login user = register("copia");
        String id = UUID.randomUUID().toString();
        mvc.perform(put("/api/body-measurements/" + id).header("Authorization", bearer(user))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"pesoCorporal\":80,\"imc\":24.7,\"fechaRegistro\":\"2026-11-01T08:00:00.000Z\"}"))
                .andExpect(status().isOk());

        String exported = mvc.perform(get("/api/data/export").header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.medidasCorporalesHistorico.length()").value(1))
                .andReturn().getResponse().getContentAsString();

        mvc.perform(delete("/api/data").header("Authorization", bearer(user))).andExpect(status().isNoContent());
        mvc.perform(get("/api/body-measurements").header("Authorization", bearer(user)))
                .andExpect(jsonPath("$.length()").value(0));

        mvc.perform(post("/api/data/import").header("Authorization", bearer(user))
                .contentType(MediaType.APPLICATION_JSON).content(exported))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/body-measurements").header("Authorization", bearer(user)))
                .andExpect(jsonPath("$[0].pesoCorporal").value(80.0));
    }

    @Test
    void catalogIsPublicAndTranslated() throws Exception {
        mvc.perform(get("/api/catalog/exercises"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(876));
        mvc.perform(get("/api/catalog/exercises/Barbell_Squat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Sentadilla con barra"))
                .andExpect(jsonPath("$.grupoMuscularPrimario").value("piernas"))
                .andExpect(jsonPath("$.equipoNecesario").value("barra"))
                .andExpect(jsonPath("$.imagenes.length()").value(2));
        mvc.perform(get("/api/catalog/exercises/Barbell_Squat?lang=en"))
                .andExpect(jsonPath("$.nombre").value("Barbell Squat"));
        mvc.perform(get("/api/catalog/exercises/No_Existe")).andExpect(status().isNotFound());
    }
}
