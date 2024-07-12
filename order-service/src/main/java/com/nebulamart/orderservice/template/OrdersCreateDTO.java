package com.nebulamart.orderservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class OrdersCreateDTO {
    private List<SingleOrderCreateDTO> orders;
    private String deliveryAddress;
    private String paymentId;
    private float amountPaid;

    public boolean isValid() {
        return orders != null && !orders.isEmpty() && orders.stream().allMatch(SingleOrderCreateDTO::isValid);
    }
}
