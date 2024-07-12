package com.nebulamart.orderservice.template;

import com.nebulamart.orderservice.entity.*;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewWithCustomerDTO {
    private Review review;
    private String customerName;
}
