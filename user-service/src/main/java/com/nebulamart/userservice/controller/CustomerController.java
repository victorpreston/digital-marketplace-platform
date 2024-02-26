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
@PreAuthorize("isAuthenticated()")
public class CustomerController {

    private final CustomerService customerService;

    @Autowired
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("")
    public Customer createCustomer(@RequestBody Customer customer) {
        return customerService.createNewCustomer(customer);
    }

    @GetMapping("/confirm")
    public String confirmSignUp() {
        customerService.confirmSignUp();
        return "confirmed";
    }

    @GetMapping("/sign-in")
    public String signIn(@PathParam("username") String username, @PathParam("password") String password) {
        customerService.signIn(username, password);
        return "Signed Up";
    }

    @GetMapping("/sign-up")
    public String signUp() {
        customerService.signUp();
        return "Signed Up";
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
    @PreAuthorize("hasAuthority('GROUP_admin')")
    public String test2() {
        return "Test";
    }

}
