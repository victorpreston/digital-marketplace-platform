package com.nebulamart.productservice.template;

import com.nebulamart.productservice.entity.Contract;
import com.nebulamart.productservice.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourierRespondResponse {
    private Contract contract;
    private String message;
}
