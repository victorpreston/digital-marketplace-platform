package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerSignUpResponse {
    private Customer customer;
    private String message;

    public CustomerSignUpResponse(Customer customer) {
        this.customer = customer;
        this.message = "Sign up successful";
    }
}
