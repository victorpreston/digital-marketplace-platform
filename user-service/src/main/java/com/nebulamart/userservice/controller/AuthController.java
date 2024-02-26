package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.service.CustomerService;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final CustomerService customerService;

    @Autowired
    public AuthController(CustomerService customerService) {

        this.customerService = customerService;
    }

    @GetMapping("/sign-in/customer")
    public String signIn(@PathParam("username") String username, @PathParam("password") String password) {
        return customerService.signIn(username, password);
    }
}
