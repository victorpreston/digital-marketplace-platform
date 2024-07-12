package com.nebulamart.orderservice.controller;

import com.nebulamart.orderservice.service.OrderService;
import com.nebulamart.orderservice.template.OrderUpdateResponseDTO;
import com.nebulamart.orderservice.template.OrdersCreateDTO;
import com.nebulamart.orderservice.template.OrdersCreateResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order/customer")
public class CustomerOrderController {
    private final OrderService orderService;

    @Autowired
    public CustomerOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/create")
    public ResponseEntity<OrdersCreateResponseDTO> createOrders(@RequestHeader("Authorization") String accessToken, @RequestBody OrdersCreateDTO ordersCreateDTO) {
        if (!ordersCreateDTO.isValid()) {
            return ResponseEntity.status(400).body(new OrdersCreateResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<OrdersCreateResponseDTO> responseEntity = orderService.createOrders(accessToken, ordersCreateDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new OrdersCreateResponseDTO(null, "Order creation failed"));
        }
        return responseEntity;
    }

    @PatchMapping("cancel/{orderId}")
    public ResponseEntity<OrderUpdateResponseDTO> cancelOrder(@RequestHeader("Authorization") String accessToken, @PathVariable("orderId") String orderId) {
        ResponseEntity<OrderUpdateResponseDTO> responseEntity = orderService.setOrderCancelled(accessToken, orderId);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new OrderUpdateResponseDTO(null, "Failed to cancel order"));
        }
        return responseEntity;
    }
}
