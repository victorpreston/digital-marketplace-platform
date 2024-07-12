package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.service.ContractService;
import com.nebulamart.productservice.template.CourierRespondResponseDTO;
import com.nebulamart.productservice.template.RespondContractRequestDTO;
import com.nebulamart.productservice.template.UpdateDeliveryChargeDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contract/courier")
public class CourierContractController {

    private final ContractService contractService;

    @Autowired
    public CourierContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping("/respond")
    public ResponseEntity<CourierRespondResponseDTO> respondContract(@RequestHeader("Authorization") String accessToken, @RequestBody RespondContractRequestDTO respondContractRequestDTO) {
        if (!respondContractRequestDTO.isValid()) {
            return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, "Missing required fields"));
        }
        if (respondContractRequestDTO.isAccept()) {
            ResponseEntity<CourierRespondResponseDTO> responseEntity = contractService.acceptContract(accessToken, respondContractRequestDTO.getContractId(), respondContractRequestDTO.getDeliveryCharge());
            if (responseEntity == null) {
                return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, "Failed to respond to contract"));
            }
            return responseEntity;
        } else {
            ResponseEntity<CourierRespondResponseDTO> responseEntity = contractService.rejectContract(accessToken, respondContractRequestDTO.getContractId());
            if (responseEntity == null) {
                return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, "Failed to respond to contract"));
            }
            return responseEntity;
        }
    }

    @GetMapping("/cancel-contract/{id}")
    public ResponseEntity<CourierRespondResponseDTO> cancelContract(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id) {
        ResponseEntity<CourierRespondResponseDTO> responseEntity = contractService.cancelContract(accessToken, id);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, "Failed to cancel contract"));
        }
        return responseEntity;
    }

    @PatchMapping("/update-contract/{id}")
    public ResponseEntity<CourierRespondResponseDTO> updateContract(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id, @RequestBody UpdateDeliveryChargeDTO updateDeliveryChargeDTO) {
        if (!updateDeliveryChargeDTO.isValid()) {
            return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<CourierRespondResponseDTO> responseEntity = contractService.updateDeliveryCharge(accessToken, id, updateDeliveryChargeDTO.getDeliveryCharge());
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, "Failed to update contract"));
        }
        return responseEntity;
    }

}
