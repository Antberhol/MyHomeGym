package com.myhomegym.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Error de la API con un código estable. El cliente traduce el código al idioma del usuario; el
 * mensaje en español queda como texto de respaldo y para los registros.
 */
public class ApiException extends ResponseStatusException {

    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(status, message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
