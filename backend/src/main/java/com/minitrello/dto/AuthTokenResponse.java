package com.minitrello.dto;

import lombok.Getter;

/**
 * Token response payload returned after successful login/registration.
 */
@Getter
public class AuthTokenResponse {
    private final String tokenType;
    private final String accessToken;
    private final String username;

    public AuthTokenResponse(String accessToken, String username) {
        this.tokenType = "Bearer";
        this.accessToken = accessToken;
        this.username = username;
    }
}
