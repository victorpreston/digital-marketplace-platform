package com.nebulamart.productservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourierChange {
    private String productId;
    private String courierId;

    public boolean isValid() {
        return productId != null && courierId != null;
    }
}
