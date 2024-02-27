package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.service.UserService;
import com.nebulamart.userservice.template.StatusResponse;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/sign-out")
    public StatusResponse signOut(@PathParam("accessToken") String accessToken) {
        return userService.signOut(accessToken);
    }

}
