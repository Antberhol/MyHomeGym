package com.myhomegym.domain;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myhomegym.common.CurrentUser;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/settings/notifications")
public class NotificationSettingsController {

    private final NotificationSettingsRepository repository;

    public NotificationSettingsController(NotificationSettingsRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<NotificationSettings> get(@AuthenticationPrincipal Jwt jwt) {
        return repository.findById(CurrentUser.id(jwt))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping
    public NotificationSettings save(@Valid @RequestBody NotificationSettings body, @AuthenticationPrincipal Jwt jwt) {
        body.setOwnerId(CurrentUser.id(jwt));
        return repository.save(body);
    }
}
