package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.service.ContractService;
import com.nebulamart.productservice.template.CourierChangeDTO;
import com.nebulamart.productservice.template.CourierChangeResponseDTO;
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
    public ResponseEntity<CourierChangeResponseDTO> addCourier(@RequestHeader("Authorization") String accessToken, @RequestBody CourierChangeDTO courierChangeDTO) {
        if (!courierChangeDTO.isValid()) {
            return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<CourierChangeResponseDTO> responseEntity = contractService.addCourier(accessToken, courierChangeDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, "Failed to add courier"));
        }
        return responseEntity;
    }

    @DeleteMapping ("/remove-courier/{productId}")
    public ResponseEntity<CourierChangeResponseDTO> removeCourier(@RequestHeader("Authorization") String accessToken, @PathVariable("productId") String productId) {
        ResponseEntity<CourierChangeResponseDTO> responseEntity = contractService.removeCourier(accessToken, productId);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, "Failed to remove courier"));
        }
        return responseEntity;
    }

    @PostMapping("/change-courier")
    public ResponseEntity<CourierChangeResponseDTO> changeCourier(@RequestHeader("Authorization") String accessToken, @RequestBody CourierChangeDTO courierChangeDTO) {
        if (!courierChangeDTO.isValid()) {
            return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<CourierChangeResponseDTO> responseEntity = contractService.changeCourier(accessToken, courierChangeDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, "Failed to change courier"));
        }
        return responseEntity;
    }

    @DeleteMapping("/delete-contract/{id}")
    public ResponseEntity<CourierChangeResponseDTO> deleteContract(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id) {
        ResponseEntity<CourierChangeResponseDTO> responseEntity = contractService.removeContract(accessToken, id);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, "Failed to delete contract"));
        }
        return responseEntity;
    }

}
