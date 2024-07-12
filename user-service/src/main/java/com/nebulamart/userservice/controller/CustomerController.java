package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.service.CustomerService;
import com.nebulamart.userservice.template.CustomerUpdateDTO;
import com.nebulamart.userservice.template.CustomerUpdateResponseDTO;
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
    public ResponseEntity<CustomerUpdateResponseDTO> updateCustomerDetails(@RequestHeader("Authorization") String accessToken, @RequestBody CustomerUpdateDTO customerUpdateDTO) {
        if (!customerUpdateDTO.isValid()) {
            return ResponseEntity.status(400).body(new CustomerUpdateResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<CustomerUpdateResponseDTO> responseEntity = customerService.updateCustomerDetails(accessToken, customerUpdateDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CustomerUpdateResponseDTO(null, "Update failed"));
        }
        return responseEntity;
    }

}
