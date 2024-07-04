package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.service.ContractService;
import com.nebulamart.productservice.template.CourierChange;
import com.nebulamart.productservice.template.CourierChangeResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contract/seller")
public class SellerContractController {

    private final ContractService contractService;

    @Autowired
    public SellerContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping("/add-courier")
    public ResponseEntity<CourierChangeResponse> addCourier(@RequestHeader("Authorization") String accessToken, @RequestBody CourierChange courierChange) {
        if (!courierChange.isValid()) {
            return ResponseEntity.status(400).body(new CourierChangeResponse(null, "Missing required fields"));
        }
        ResponseEntity<CourierChangeResponse> responseEntity = contractService.addCourier(accessToken, courierChange);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierChangeResponse(null, "Failed to add courier"));
        }
        return responseEntity;
    }

    @DeleteMapping ("/remove-courier/{productId}")
    public ResponseEntity<CourierChangeResponse> removeCourier(@RequestHeader("Authorization") String accessToken, @PathVariable("productId") String productId) {
        ResponseEntity<CourierChangeResponse> responseEntity = contractService.removeCourier(accessToken, productId);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierChangeResponse(null, "Failed to remove courier"));
        }
        return responseEntity;
    }

    @PostMapping("/change-courier")
    public ResponseEntity<CourierChangeResponse> changeCourier(@RequestHeader("Authorization") String accessToken, @RequestBody CourierChange courierChange) {
        if (!courierChange.isValid()) {
            return ResponseEntity.status(400).body(new CourierChangeResponse(null, "Missing required fields"));
        }
        ResponseEntity<CourierChangeResponse> responseEntity = contractService.changeCourier(accessToken, courierChange);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierChangeResponse(null, "Failed to change courier"));
        }
        return responseEntity;
    }

    @DeleteMapping("/delete-contract/{id}")
    public ResponseEntity<CourierChangeResponse> deleteContract(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id) {
        ResponseEntity<CourierChangeResponse> responseEntity = contractService.removeContract(accessToken, id);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierChangeResponse(null, "Failed to delete contract"));
        }
        return responseEntity;
    }

}
