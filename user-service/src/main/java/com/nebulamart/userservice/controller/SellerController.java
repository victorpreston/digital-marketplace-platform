package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Seller;
import com.nebulamart.userservice.service.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sellers")
public class SellerController {
    private final SellerService sellerService;

    @Autowired
    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @GetMapping("/account-details")
    public ResponseEntity<Seller> getSellerDetails(@RequestHeader("Authorization") String accessToken) {
        try {
            Seller seller = sellerService.getSellerDetails(accessToken);
            if (seller == null) {
                return ResponseEntity.status(404).build();
            }
            return ResponseEntity.ok(seller);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).build();
        }
    }

}
