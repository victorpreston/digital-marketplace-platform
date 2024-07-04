package com.nebulamart.productservice.template;

import com.nebulamart.productservice.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourierChangeResponse {
    private Product product;
    private String message;
}
