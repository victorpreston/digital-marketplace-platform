package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Seller;
import com.nebulamart.userservice.service.SellerService;
import com.nebulamart.userservice.template.SellerUpdate;
import com.nebulamart.userservice.template.SellerUpdateResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/seller")
public class SellerController {
    private final SellerService sellerService;

    @Autowired
    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @GetMapping("/account")
    public ResponseEntity<Seller> getSellerDetails(@RequestHeader("Authorization") String accessToken) {
        ResponseEntity<Seller> responseEntity = sellerService.getSellerDetails(accessToken);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

    @PatchMapping("/account")
    public ResponseEntity<SellerUpdateResponse> updateSellerDetails(@RequestHeader("Authorization") String accessToken, @RequestBody SellerUpdate sellerUpdate) {
        if (!sellerUpdate.isValid()) {
            return ResponseEntity.status(400).body(new SellerUpdateResponse(null, "Missing required fields"));
        }
        ResponseEntity<SellerUpdateResponse> responseEntity = sellerService.updateSellerDetails(accessToken, sellerUpdate);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new SellerUpdateResponse(null, "Update failed"));
        }
        return responseEntity;
    }

}
