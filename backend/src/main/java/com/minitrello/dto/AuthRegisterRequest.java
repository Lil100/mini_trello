package com.minitrello.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Registration request payload.
 */
@Getter
@Setter
public class AuthRegisterRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;
}

