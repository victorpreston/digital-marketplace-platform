package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerSignUpResponseDTO {
    private Customer customer;
    private String message;

    public CustomerSignUpResponseDTO(Customer customer) {
        this.customer = customer;
        this.message = "Sign up successful";
    }
}
