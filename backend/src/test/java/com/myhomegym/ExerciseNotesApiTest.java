package com.myhomegym;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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

import com.fasterxml.jackson.databind.ObjectMapper;

/** Las notas personales de cada ejercicio se guardan en el servidor, son privadas y entran en la copia. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ExerciseNotesApiTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    private String register(String username) throws Exception {
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + username + "\",\"password\":\"contrasena-segura\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + mapper.readTree(body).get("accessToken").asText();
    }

    @Test
    void notesArePrivateAndTravelWithTheBackup() throws Exception {
        String ana = register("notas-ana");
        String bruno = register("notas-bruno");
        String id = UUID.randomUUID().toString();
        String note = "{\"ejercicioId\":\"Barbell_Squat\",\"texto\":\"Pies a la anchura de hombros\"}";

        mvc.perform(put("/api/exercise-notes/" + id).header("Authorization", ana)
                .contentType(MediaType.APPLICATION_JSON).content(note))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ownerId").doesNotExist());

        mvc.perform(get("/api/exercise-notes").header("Authorization", ana))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].ejercicioId").value("Barbell_Squat"))
                .andExpect(jsonPath("$[0].texto").value("Pies a la anchura de hombros"));
        mvc.perform(get("/api/exercise-notes").header("Authorization", bruno))
                .andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/exercise-notes/" + id).header("Authorization", bruno))
                .andExpect(status().isNotFound());

        String exported = mvc.perform(get("/api/data/export").header("Authorization", ana))
                .andExpect(jsonPath("$.notasEjercicios.length()").value(1))
                .andReturn().getResponse().getContentAsString();

        mvc.perform(delete("/api/data").header("Authorization", ana)).andExpect(status().isNoContent());
        mvc.perform(get("/api/exercise-notes").header("Authorization", ana))
                .andExpect(jsonPath("$.length()").value(0));

        mvc.perform(post("/api/data/import").header("Authorization", ana)
                .contentType(MediaType.APPLICATION_JSON).content(exported))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/exercise-notes").header("Authorization", ana))
                .andExpect(jsonPath("$[0].texto").value("Pies a la anchura de hombros"));
    }

    @Test
    void noteWithoutExerciseIsRejected() throws Exception {
        String user = register("notas-vacia");
        mvc.perform(put("/api/exercise-notes/" + UUID.randomUUID()).header("Authorization", user)
                .contentType(MediaType.APPLICATION_JSON).content("{\"texto\":\"Sin ejercicio\"}"))
                .andExpect(status().isBadRequest());
    }
}
