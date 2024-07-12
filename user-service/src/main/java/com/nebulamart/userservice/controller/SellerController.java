package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Courier;
import com.nebulamart.userservice.entity.Seller;
import com.nebulamart.userservice.service.CourierService;
import com.nebulamart.userservice.service.SellerService;
import com.nebulamart.userservice.template.SellerUpdateDTO;
import com.nebulamart.userservice.template.SellerUpdateResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/seller")
public class SellerController {
    private final SellerService sellerService;
    private final CourierService courierService;

    @Autowired
    public SellerController(SellerService sellerService, CourierService courierService) {
        this.sellerService = sellerService;
        this.courierService = courierService;
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
    public ResponseEntity<SellerUpdateResponseDTO> updateSellerDetails(@RequestHeader("Authorization") String accessToken, @RequestBody SellerUpdateDTO sellerUpdateDTO) {
        if (!sellerUpdateDTO.isValid()) {
            return ResponseEntity.status(400).body(new SellerUpdateResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<SellerUpdateResponseDTO> responseEntity = sellerService.updateSellerDetails(accessToken, sellerUpdateDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new SellerUpdateResponseDTO(null, "Update failed"));
        }
        return responseEntity;
    }

    @GetMapping("/couriers-list")
    public ResponseEntity<List<Courier>> searchCouriers() {
        ResponseEntity<List<Courier>> responseEntity = courierService.getCouriers();
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

}
