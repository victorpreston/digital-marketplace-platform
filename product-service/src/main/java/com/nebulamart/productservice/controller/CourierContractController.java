package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.entity.Contract;
import com.nebulamart.productservice.service.ContractService;
import com.nebulamart.productservice.template.CourierRespondResponse;
import com.nebulamart.productservice.template.RespondContractRequest;
import com.nebulamart.productservice.template.UpdateDeliveryCharge;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contracts/courier")
public class CourierContractController {

    private final ContractService contractService;

    @Autowired
    public CourierContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping("/respond")
    public ResponseEntity<CourierRespondResponse> respondContract(@RequestHeader("Authorization") String accessToken, @RequestBody RespondContractRequest respondContractRequest) {
        if (!respondContractRequest.isValid()) {
            return ResponseEntity.status(400).body(new CourierRespondResponse(null, "Missing required fields"));
        }
        if (respondContractRequest.isAccept()) {
            ResponseEntity<CourierRespondResponse> responseEntity = contractService.acceptContract(accessToken, respondContractRequest.getContractId(), respondContractRequest.getDeliveryCharge());
            if (responseEntity == null) {
                return ResponseEntity.status(400).body(new CourierRespondResponse(null, "Failed to respond to contract"));
            }
            return responseEntity;
        } else {
            ResponseEntity<CourierRespondResponse> responseEntity = contractService.rejectContract(accessToken, respondContractRequest.getContractId());
            if (responseEntity == null) {
                return ResponseEntity.status(400).body(new CourierRespondResponse(null, "Failed to respond to contract"));
            }
            return responseEntity;
        }
    }

    @GetMapping("/cancel-contract/{id}")
    public ResponseEntity<CourierRespondResponse> cancelContract(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id) {
        ResponseEntity<CourierRespondResponse> responseEntity = contractService.cancelContract(accessToken, id);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierRespondResponse(null, "Failed to cancel contract"));
        }
        return responseEntity;
    }

    @PatchMapping("/update-contract/{id}")
    public ResponseEntity<CourierRespondResponse> updateContract(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id, @RequestBody UpdateDeliveryCharge updateDeliveryCharge) {
        if (!updateDeliveryCharge.isValid()) {
            return ResponseEntity.status(400).body(new CourierRespondResponse(null, "Missing required fields"));
        }
        ResponseEntity<CourierRespondResponse> responseEntity = contractService.updateDeliveryCharge(accessToken, id, updateDeliveryCharge.getDeliveryCharge());
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierRespondResponse(null, "Failed to update contract"));
        }
        return responseEntity;
    }

}
