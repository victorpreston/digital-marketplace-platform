package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerUpdateResponse {
    private Customer customer;
    private String message;

    public CustomerUpdateResponse(Customer customer) {
        this.customer = customer;
        this.message = "Account update successful";
    }
}
