package com.myhomegym.backup;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.myhomegym.common.CurrentUser;

@RestController
@RequestMapping("/api/data")
public class BackupController {

    private final BackupService service;

    public BackupController(BackupService service) {
        this.service = service;
    }

    @GetMapping("/export")
    public BackupData export(@AuthenticationPrincipal Jwt jwt) {
        return service.export(CurrentUser.id(jwt));
    }

    @PostMapping("/import")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void importAll(@RequestBody BackupData data, @AuthenticationPrincipal Jwt jwt) {
        service.replaceAll(CurrentUser.id(jwt), data);
    }

    /** Añade lo que falta de una copia sin borrar nada. Devuelve cuántos registros ha añadido y saltado. */
    @PostMapping("/merge")
    public BackupService.MergeResult merge(@RequestBody BackupData data, @AuthenticationPrincipal Jwt jwt) {
        return service.merge(CurrentUser.id(jwt), data);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(@AuthenticationPrincipal Jwt jwt) {
        service.clearAll(CurrentUser.id(jwt));
    }
}
