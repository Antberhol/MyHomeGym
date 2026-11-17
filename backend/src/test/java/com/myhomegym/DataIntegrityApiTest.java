package com.myhomegym;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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

import com.fasterxml.jackson.databind.ObjectMapper;

/** Borrados en cascada, vaciado de campos, validación y fusión de copias (RN-2.06, RN-5.12, RN-6.03, RNF-1.08). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DataIntegrityApiTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    private String register() throws Exception {
        String username = "integridad-" + UUID.randomUUID().toString().substring(0, 8);
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + username + "\",\"password\":\"contrasena-segura\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + mapper.readTree(body).get("accessToken").asText();
    }

    private ResultActions send(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request,
            String token, String json) throws Exception {
        return mvc.perform(request.header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    @Test
    void deletingAFolderKeepsItsRoutinesWithoutFolder() throws Exception {
        String user = register();
        send(put("/api/routine-folders/f1-" + user.hashCode()), user, "{\"nombre\":\"Fuerza\"}")
                .andExpect(status().isOk());
        String folderId = "f1-" + user.hashCode();
        String routineId = UUID.randomUUID().toString();
        send(put("/api/routines/" + routineId), user,
                "{\"nombre\":\"Empuje\",\"folderId\":\"" + folderId + "\"}").andExpect(status().isOk());

        mvc.perform(delete("/api/routine-folders/" + folderId).header("Authorization", user))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/routines/" + routineId).header("Authorization", user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Empuje"))
                .andExpect(jsonPath("$.folderId").doesNotExist());
    }

    @Test
    void patchingAFieldToNullClearsIt() throws Exception {
        String user = register();
        String routineId = UUID.randomUUID().toString();
        send(put("/api/routines/" + routineId), user, "{\"nombre\":\"Tirón\",\"folderId\":\"carpeta-x\"}")
                .andExpect(status().isOk());

        send(patch("/api/routines/" + routineId), user, "{\"folderId\":null}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.folderId").doesNotExist())
                .andExpect(jsonPath("$.nombre").value("Tirón"));
        // Un campo obligatorio no se puede vaciar.
        send(patch("/api/routines/" + routineId), user, "{\"nombre\":null}").andExpect(status().isBadRequest());
    }

    @Test
    void deletingACustomExerciseRemovesItFromRoutinesAndKeepsHistory() throws Exception {
        String user = register();
        String exerciseId = UUID.randomUUID().toString();
        String routineId = UUID.randomUUID().toString();
        String trainingId = UUID.randomUUID().toString();
        send(put("/api/custom-exercises/" + exerciseId), user,
                "{\"nombre\":\"Remo en TRX\",\"grupoMuscularPrimario\":\"espalda\"}").andExpect(status().isOk());
        send(put("/api/routines/" + routineId), user, "{\"nombre\":\"Espalda\"}").andExpect(status().isOk());
        send(put("/api/routine-exercises/" + UUID.randomUUID()), user, "{\"rutinaId\":\"" + routineId
                + "\",\"ejercicioId\":\"" + exerciseId + "\",\"orden\":1,\"series\":3,\"repeticiones\":\"8-12\"}")
                .andExpect(status().isOk());
        send(put("/api/routine-exercises/" + UUID.randomUUID()), user, "{\"rutinaId\":\"" + routineId
                + "\",\"ejercicioId\":\"Pullups\",\"orden\":2,\"series\":3,\"repeticiones\":\"5\"}")
                .andExpect(status().isOk());
        send(put("/api/exercise-notes/" + UUID.randomUUID()), user,
                "{\"ejercicioId\":\"" + exerciseId + "\",\"texto\":\"Codos pegados\"}").andExpect(status().isOk());
        send(post("/api/trainings/complete"), user, "{\"training\":{\"id\":\"" + trainingId
                + "\",\"fecha\":\"2026-11-16T10:00:00Z\",\"duracionMinutos\":30,\"completado\":true,\"volumenTotal\":400},"
                + "\"sets\":[{\"id\":\"" + UUID.randomUUID() + "\",\"entrenamientoId\":\"" + trainingId
                + "\",\"ejercicioId\":\"" + exerciseId + "\",\"serieNumero\":1,\"repeticionesRealizadas\":10,"
                + "\"pesoUtilizado\":40,\"type\":\"normal\",\"fecha\":\"2026-11-16T10:00:00Z\"}]}")
                .andExpect(status().isCreated());

        mvc.perform(delete("/api/custom-exercises/" + exerciseId).header("Authorization", user))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/routine-exercises").header("Authorization", user))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].ejercicioId").value("Pullups"));
        mvc.perform(get("/api/exercise-notes").header("Authorization", user))
                .andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/performed-sets").header("Authorization", user))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void invalidValuesAreRejected() throws Exception {
        String user = register();
        String base = "\"rutinaId\":\"r1\",\"ejercicioId\":\"Pullups\",\"orden\":1,\"repeticiones\":\"8-12\"";
        send(put("/api/routine-exercises/" + UUID.randomUUID()), user, "{" + base + ",\"series\":0}")
                .andExpect(status().isBadRequest());
        send(put("/api/routine-exercises/" + UUID.randomUUID()), user, "{" + base + ",\"series\":21}")
                .andExpect(status().isBadRequest());
        send(put("/api/routine-exercises/" + UUID.randomUUID()), user,
                "{" + base + ",\"series\":3,\"descansoSegundos\":-5}").andExpect(status().isBadRequest());

        String set = "\"entrenamientoId\":\"t1\",\"ejercicioId\":\"Pullups\",\"serieNumero\":1,"
                + "\"repeticionesRealizadas\":8,\"pesoUtilizado\":0,\"fecha\":\"2026-11-16T10:00:00Z\"";
        send(put("/api/performed-sets/" + UUID.randomUUID()), user, "{" + set + ",\"type\":\"normal\",\"rpe\":11}")
                .andExpect(status().isBadRequest());
        send(put("/api/performed-sets/" + UUID.randomUUID()), user, "{" + set + ",\"type\":\"inventado\"}")
                .andExpect(status().isBadRequest());
        send(put("/api/performed-sets/" + UUID.randomUUID()), user, "{" + set + ",\"type\":\"dropset\",\"rpe\":9.5}")
                .andExpect(status().isOk());

        send(put("/api/personal-records/" + UUID.randomUUID()), user,
                "{\"ejercicioId\":\"Pullups\",\"tipo\":\"otro\",\"valor\":10,\"fecha\":\"2026-11-16T10:00:00Z\"}")
                .andExpect(status().isBadRequest());
        send(put("/api/settings/notifications"), user, "{\"streakWarningHour\":24}")
                .andExpect(status().isBadRequest());
    }

    @Test
    void mergeAddsWhatIsMissingWithoutDeletingAndIsAtomic() throws Exception {
        String user = register();
        String existing = UUID.randomUUID().toString();
        String added = UUID.randomUUID().toString();
        send(put("/api/routines/" + existing), user, "{\"nombre\":\"La que ya tenía\"}").andExpect(status().isOk());

        String backup = "{\"rutinas\":[{\"id\":\"" + existing + "\",\"nombre\":\"Versión de la copia\"},"
                + "{\"id\":\"" + added + "\",\"nombre\":\"Nueva\"}],"
                + "\"rutinaCarpetas\":[{\"id\":\"" + UUID.randomUUID() + "\",\"nombre\":\"Fuerza\"}],"
                + "\"ejerciciosCatalogo\":[{\"id\":\"Pullups\",\"nombre\":\"Dominadas\",\"grupoMuscularPrimario\":\"espalda\"}]}";
        send(post("/api/data/merge"), user, backup)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imported").value(2))
                .andExpect(jsonPath("$.skipped").value(2));

        mvc.perform(get("/api/routines").header("Authorization", user))
                .andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/api/routines/" + existing).header("Authorization", user))
                .andExpect(jsonPath("$.nombre").value("La que ya tenía"));
        mvc.perform(get("/api/custom-exercises").header("Authorization", user))
                .andExpect(jsonPath("$.length()").value(0));

        // Un registro no válido anula toda la fusión: la rutina correcta que iba delante tampoco se guarda.
        String broken = "{\"rutinas\":[{\"id\":\"" + UUID.randomUUID() + "\",\"nombre\":\"Correcta\"},"
                + "{\"id\":\"" + UUID.randomUUID() + "\",\"nombre\":\"\"}]}";
        send(post("/api/data/merge"), user, broken).andExpect(status().isBadRequest());
        mvc.perform(get("/api/routines").header("Authorization", user))
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void mergeNeverTakesAnotherUsersRecords() throws Exception {
        String ana = register();
        String bruno = register();
        String id = UUID.randomUUID().toString();
        send(put("/api/routines/" + id), ana, "{\"nombre\":\"De Ana\"}").andExpect(status().isOk());

        send(post("/api/data/merge"), bruno, "{\"rutinas\":[{\"id\":\"" + id + "\",\"nombre\":\"Robada\"}]}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imported").value(0));
        mvc.perform(get("/api/routines/" + id).header("Authorization", ana))
                .andExpect(jsonPath("$.nombre").value("De Ana"));
        mvc.perform(get("/api/routines").header("Authorization", bruno))
                .andExpect(jsonPath("$.length()").value(0));
    }
}
