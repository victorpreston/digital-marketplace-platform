package com.nebulamart.userservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChangePasswordResponse {
        private boolean success;
        private String message;

        public ChangePasswordResponse(boolean success) {
            this.success = success;
            this.message = success ? "Password changed successfully" : "Failed to change password";
        }
}
