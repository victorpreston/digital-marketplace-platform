package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.entity.Product;
import com.nebulamart.productservice.entity.Seller;
import com.nebulamart.productservice.entity.User;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/user")
    public Seller getUser() {
        Seller seller = restTemplate.getForObject("http://localhost:9002/api/user-service/open/sellers/a4c8c4e8-9071-7028-779e-6c84a274539a", Seller.class);
        return seller;
    }

}
