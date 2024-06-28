package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    @Autowired
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/account-details")
    public ResponseEntity<Customer> getCustomerDetails(@RequestHeader("Authorization") String accessToken) {
        try {
            Customer customer = customerService.getCustomerDetails(accessToken);
            if (customer == null) {
                return ResponseEntity.status(404).build();
            }
            return ResponseEntity.ok(customer);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).build();
        }
    }
}
