package com.nebulamart.userservice.util;

import com.nebulamart.userservice.entity.User;

public class WrappedUser {
    private String cognitoUsername;
    private String email;
    private String role;
    private User user = null;

    public WrappedUser(String cognitoUsername, String email, String role) {
        this.cognitoUsername = cognitoUsername;
        this.email = email;
        this.role = role;
    }

    public String getCognitoUsername() {
        return cognitoUsername;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
