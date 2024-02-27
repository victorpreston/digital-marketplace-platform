package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.service.CustomerService;
import jakarta.annotation.security.PermitAll;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
//@PreAuthorize("isAuthenticated()")
public class CustomerController {

    private final CustomerService customerService;

    @Autowired
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/pw")
    public String pw() {
        customerService.changeTempPassword();
        return "changed";
    }

    @GetMapping("/sign-out")
    public String signOut() {
        customerService.signOut();
        return "Signed Out";
    }

    @GetMapping("/test")
    public String test() {
        return "Test";
    }

    @GetMapping("/test2")
//    @PreAuthorize("hasAuthority('GROUP_admin')")
    public String test2() {
        return "Test";
    }

}
