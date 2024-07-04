package com.nebulamart.productservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateDeliveryCharge {
    private float deliveryCharge;
    private String updateNote;

    public boolean isValid() {
        return deliveryCharge >= 0;
    }

}
