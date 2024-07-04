package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.entity.Contract;
import com.nebulamart.productservice.service.ContractService;
import com.nebulamart.productservice.template.CourierRespondResponse;
import com.nebulamart.productservice.template.PopulatedContract;
import com.nebulamart.productservice.template.RespondContractRequest;
import com.nebulamart.productservice.template.UpdateDeliveryCharge;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contracts")
public class ContractController {

    private final ContractService contractService;

    @Autowired
    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @GetMapping("")
    public ResponseEntity<List<Contract>> getContracts(@RequestHeader("Authorization") String accessToken) {
        ResponseEntity<List<Contract>> responseEntity = contractService.getContracts(accessToken);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

    @GetMapping("/{contractId}")
    public ResponseEntity<PopulatedContract> getContract(@RequestHeader("Authorization") String accessToken, @PathVariable String contractId) {
        ResponseEntity<PopulatedContract> responseEntity = contractService.getContract(contractId, accessToken);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }


}
