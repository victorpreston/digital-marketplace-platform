package com.nebulamart.orderservice.controller;

import com.nebulamart.orderservice.entity.Order;
import com.nebulamart.orderservice.service.OrderService;
import com.nebulamart.orderservice.template.PopulatedOrderDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("{id}")
    public ResponseEntity<PopulatedOrderDTO> getOrder(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id) {
        if (id == null || id.isEmpty()) {
            return ResponseEntity.status(400).body(null);
        }
        ResponseEntity<PopulatedOrderDTO> responseEntity = orderService.getOrder(accessToken, id);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

    @GetMapping("")
    public ResponseEntity<List<Order>> getOrders(@RequestHeader("Authorization") String accessToken) {
        ResponseEntity<List<Order>> responseEntity = orderService.getOrders(accessToken);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

}
