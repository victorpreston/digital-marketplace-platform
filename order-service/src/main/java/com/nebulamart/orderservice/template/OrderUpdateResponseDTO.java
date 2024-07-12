package com.nebulamart.orderservice.template;

import com.nebulamart.orderservice.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrderUpdateResponseDTO {
    private Order order;
    private String message;

    public OrderUpdateResponseDTO(Order order) {
        this.order = order;
        this.message = "Order updated successfully";
    }

}
