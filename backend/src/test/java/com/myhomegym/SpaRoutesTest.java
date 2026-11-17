package com.myhomegym;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Cada ruta de React debe devolver index.html al recargar la página o abrir un enlace directo. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SpaRoutesTest {

    @Autowired
    MockMvc mvc;

    @ParameterizedTest
    @ValueSource(strings = { "/", "/entrenar", "/rutinas", "/rutinas/abc-123", "/catalogo", "/catalogo/Barbell_Squat",
            "/progreso", "/diagrama-corporal", "/perfil", "/configuracion" })
    void reactRoutesForwardToIndex(String path) throws Exception {
        mvc.perform(get(path)).andExpect(forwardedUrl("/index.html"));
    }
}
