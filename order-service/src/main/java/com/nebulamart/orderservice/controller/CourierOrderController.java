package com.nebulamart.orderservice.controller;

import com.nebulamart.orderservice.service.OrderService;
import com.nebulamart.orderservice.template.OrderUpdateResponseDTO;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order/courier")
public class CourierOrderController {
    private final OrderService orderService;

    @Autowired
    public CourierOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PatchMapping("update-dispatched/{orderId}")
    public ResponseEntity<OrderUpdateResponseDTO> getDispatchedOrder(@RequestHeader("Authorization") String accessToken, @PathVariable("orderId") String orderId) {
        ResponseEntity<OrderUpdateResponseDTO> responseEntity = orderService.setOrderDispatched(accessToken, orderId);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new OrderUpdateResponseDTO(null, "Failed to set order as dispatched"));
        }
        return responseEntity;
    }

    @PatchMapping("update-delivered/{orderId}")
    public ResponseEntity<OrderUpdateResponseDTO> getDeliveredOrder(@RequestHeader("Authorization") String accessToken, @PathVariable("orderId") String orderId) {
        ResponseEntity<OrderUpdateResponseDTO> responseEntity = orderService.setOrderDelivered(accessToken, orderId);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new OrderUpdateResponseDTO(null, "Failed to set order as delivered"));
        }
        return responseEntity;
    }

}
