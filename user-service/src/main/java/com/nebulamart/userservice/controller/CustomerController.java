package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.service.CustomerService;
import com.nebulamart.userservice.template.CustomerUpdate;
import com.nebulamart.userservice.template.CustomerUpdateResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer")
public class CustomerController {
    private final CustomerService customerService;

    @Autowired
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/account")
    public ResponseEntity<Customer> getCustomerDetails(@RequestHeader("Authorization") String accessToken) {
        ResponseEntity<Customer> responseEntity = customerService.getCustomerDetails(accessToken);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

    @PatchMapping("/account")
    public ResponseEntity<CustomerUpdateResponse> updateCustomerDetails(@RequestHeader("Authorization") String accessToken, @RequestBody CustomerUpdate customerUpdate) {
        if (!customerUpdate.isValid()) {
            return ResponseEntity.status(400).body(new CustomerUpdateResponse(null, "Missing required fields"));
        }
        ResponseEntity<CustomerUpdateResponse> responseEntity = customerService.updateCustomerDetails(accessToken, customerUpdate);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CustomerUpdateResponse(null, "Update failed"));
        }
        return responseEntity;
    }

}
