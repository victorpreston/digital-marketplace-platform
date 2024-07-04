package com.nebulamart.productservice.util;

public class WrappedUser {
    private String cognitoUsername;
    private String role;
    private String email;

    public WrappedUser(String cognitoUsername, String role, String email) {
        this.cognitoUsername = cognitoUsername;
        this.role = role;
        this.email = email;
    }

    public String getCognitoUsername() {
        return cognitoUsername;
    }

    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }

}
