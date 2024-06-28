package com.nebulamart.userservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChangePassword {

        private String email;
        private String oldPassword;
        private String newPassword;

        public boolean isValid() {
            return email != null && oldPassword != null && newPassword != null;
        }
}
