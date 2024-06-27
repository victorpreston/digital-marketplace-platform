package com.nebulamart.userservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSignIn {
    private String email;
    private String password;

    public boolean isValid() {
        return email != null && password != null;
    }
}
