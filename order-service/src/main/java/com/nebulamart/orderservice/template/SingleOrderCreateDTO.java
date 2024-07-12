package com.nebulamart.orderservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SingleOrderCreateDTO {
    private String productId;
    private int quantity;

    public boolean isValid() {
        return productId != null && !productId.isEmpty() && quantity > 0;
    }

}
