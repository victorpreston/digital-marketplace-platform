package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.service.UserService;
import com.nebulamart.userservice.template.ChangePasswordDTO;
import com.nebulamart.userservice.template.ChangePasswordResponseDTO;
import com.nebulamart.userservice.template.StatusResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/sign-out")
    public ResponseEntity<StatusResponseDTO> signOut(@RequestHeader("Authorization") String bearerHeader) {
        return userService.signOut(bearerHeader);
    }

    @PostMapping("/change-password")
    public ResponseEntity<ChangePasswordResponseDTO> changePassword(@RequestHeader("Authorization") String accessToken, @RequestBody ChangePasswordDTO changePasswordDTO) {
        if (!changePasswordDTO.isValid()) {
            return ResponseEntity.status(400).body(new ChangePasswordResponseDTO(false, "Missing old or new password"));
        }
        ResponseEntity<ChangePasswordResponseDTO> responseEntity = userService.changeTempPassword(accessToken, changePasswordDTO.getOldPassword(), changePasswordDTO.getNewPassword());
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new ChangePasswordResponseDTO(false, "Failed to change password"));
        }
        return responseEntity;
    }

}
