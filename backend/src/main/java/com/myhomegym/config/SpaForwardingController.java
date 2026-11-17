package com.myhomegym.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Cuando el frontend compilado se sirve desde el propio backend, las rutas de React
 * (por ejemplo /rutinas) deben devolver index.html para que las resuelva el router del cliente.
 */
@Controller
public class SpaForwardingController {

    @GetMapping({ "/", "/entrenar", "/rutinas", "/rutinas/{id}", "/catalogo", "/catalogo/{id}", "/progreso",
            "/diagrama-corporal", "/perfil", "/configuracion", "/login" })
    public String forward() {
        return "forward:/index.html";
    }
}
