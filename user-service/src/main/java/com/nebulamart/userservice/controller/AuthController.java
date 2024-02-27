package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.service.CustomerService;
import com.nebulamart.userservice.template.CustomerSignUp;
import com.nebulamart.userservice.template.SignInResponse;
import com.nebulamart.userservice.template.StatusResponse;
import com.nebulamart.userservice.template.UserSignIn;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final CustomerService customerService;

    @Autowired
    public AuthController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/sign-up/customer")
    public Customer CustomerSignUp(@RequestBody CustomerSignUp customerSignUp) {
        return customerService.customerSignUp(customerSignUp);
    }

    @GetMapping("/verify-account")
    public StatusResponse confirmSignUp(@PathParam("email") String email, @PathParam("code") String code) {
        return customerService.confirmSignUp(email, code);
    }

    @PostMapping("/sign-in/customer")
    public SignInResponse signIn(@RequestBody UserSignIn userSignIn) {
        return customerService.signIn(userSignIn);
    }



    @GetMapping("/test")
    public String test() {
        return "test";
    }

    @PostMapping("/test2")
    public String test2() {
        return "test2";
    }


}
