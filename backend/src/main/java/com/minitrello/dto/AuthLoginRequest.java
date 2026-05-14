package com.minitrello.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Login request payload.
 */
@Getter
@Setter
public class AuthLoginRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;
}

