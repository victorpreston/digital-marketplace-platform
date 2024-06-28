package com.nebulamart.userservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChangePassword {
        private String oldPassword;
        private String newPassword;

        public boolean isValid() {
                if (oldPassword != null && newPassword != null) {
                        return true;
                }
                return false;
        }
}
