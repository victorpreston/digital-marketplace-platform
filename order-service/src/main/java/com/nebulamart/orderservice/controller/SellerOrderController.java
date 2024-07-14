package com.nebulamart.orderservice.controller;

import com.nebulamart.orderservice.entity.Order;
import com.nebulamart.orderservice.service.OrderService;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order/seller")
public class SellerOrderController {
    private final OrderService orderService;

    @Autowired
    public SellerOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("orders")
    public ResponseEntity<List<Order>> getOrders(@RequestHeader("Authorization") String accessToken, @PathParam("productId") String productId) {
        ResponseEntity<List<Order>> responseEntity = orderService.getOrdersByProduct(accessToken, productId);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

}
