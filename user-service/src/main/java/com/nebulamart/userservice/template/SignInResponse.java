package com.nebulamart.userservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SignInResponse {
    private String idToken;
    private String accessToken;
    private String message;

    public SignInResponse(String idToken, String accessToken) {
        this.idToken = idToken;
        this.accessToken = accessToken;
        this.message = "Sign in successful";
    }
}
