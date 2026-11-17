package com.myhomegym.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 40)
            @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "solo letras, números, punto, guion y guion bajo")
            String username,
            @NotBlank @Size(min = 8, max = 128) String password,
            @Size(max = 80) String displayName) {
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    public record UserDto(Long id, String username, String displayName) {

        static UserDto from(UserAccount user) {
            return new UserDto(user.getId(), user.getUsername(), user.getDisplayName());
        }
    }

    public record AuthResponse(String accessToken, long expiresIn, UserDto user) {
    }
}
