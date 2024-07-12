package com.nebulamart.orderservice.util;

import com.nebulamart.orderservice.entity.User;

public class WrappedUser {
    private String cognitoUsername;
    private String role;
    private String email;
    private User user = null;

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
