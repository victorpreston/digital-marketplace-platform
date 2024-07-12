package com.nebulamart.orderservice.template;

import com.nebulamart.orderservice.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class OrdersCreateResponseDTO {
    private List<Order> orders;
    private String message;

    public OrdersCreateResponseDTO(List<Order> order) {
        this.orders = order;
        this.message = "Order created successfully";
    }
}
