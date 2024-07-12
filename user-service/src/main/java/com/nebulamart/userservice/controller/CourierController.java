package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Courier;
import com.nebulamart.userservice.service.CourierService;
import com.nebulamart.userservice.template.CourierUpdateDTO;
import com.nebulamart.userservice.template.CourierUpdateResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courier")
public class CourierController {
    private final CourierService courierService;

    @Autowired
    public CourierController(CourierService courierService) {
        this.courierService = courierService;
    }

    @GetMapping("/account")
    public ResponseEntity<Courier> getCourierDetails(@RequestHeader("Authorization") String accessToken) {
        ResponseEntity<Courier> responseEntity = courierService.getCourierDetails(accessToken);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

    @PatchMapping("/account")
    public ResponseEntity<CourierUpdateResponseDTO> updateCourierDetails(@RequestHeader("Authorization") String accessToken, @RequestBody CourierUpdateDTO courierUpdateDTO) {
        if (!courierUpdateDTO.isValid()) {
            return ResponseEntity.status(400).body(new CourierUpdateResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<CourierUpdateResponseDTO> responseEntity = courierService.updateCourierDetails(accessToken, courierUpdateDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierUpdateResponseDTO(null, "Update failed"));
        }
        return responseEntity;
    }

}
