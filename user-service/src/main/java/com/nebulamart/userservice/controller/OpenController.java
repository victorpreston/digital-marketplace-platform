package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Courier;
import com.nebulamart.userservice.entity.Seller;
import com.nebulamart.userservice.service.CourierService;
import com.nebulamart.userservice.service.ImageUploadService;
import com.nebulamart.userservice.service.SellerService;
import com.nebulamart.userservice.template.GetUrlResponseDTO;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

@RestController
@RequestMapping("")
public class OpenController {
    private final ImageUploadService imageUploadService;
    private final SellerService sellerService;
    private final CourierService courierService;

    @Autowired
    public OpenController(ImageUploadService imageUploadService, SellerService sellerService, CourierService courierService) {
        this.imageUploadService = imageUploadService;
        this.sellerService = sellerService;
        this.courierService = courierService;
    }

    @GetMapping("/upload-url")
    public ResponseEntity<GetUrlResponseDTO> getPreSignedUrl(@PathParam("extension") String extension) {
        if (extension == null || extension.isEmpty()) {
            return ResponseEntity.status(400).body(new GetUrlResponseDTO(null, "Missing or invalid extension"));
        } else if (!extension.equals("jpg") && !extension.equals("jpeg") && !extension.equals("png")) {
            return ResponseEntity.status(400).body(new GetUrlResponseDTO(null, "Invalid extension"));
        }
        String preSignedUrl = imageUploadService.getPreSignedUrl("users" + "/" + UUID.randomUUID().toString() + "." + extension);
        if (preSignedUrl == null) {
            return ResponseEntity.status(400).body(new GetUrlResponseDTO(null, "Failed to get pre-signed URL"));
        }
        return ResponseEntity.ok(new GetUrlResponseDTO(preSignedUrl, "Pre-signed URL generated successfully"));
    }

    @RequestMapping("/sellers/{id}")
    public ResponseEntity<Seller> getSellerDetails(@PathVariable("id") String id) {
        if (id == null) {
            return ResponseEntity.status(400).body(null);
        }
        Seller seller = sellerService.getSeller(id);
        if (seller == null) {
            return ResponseEntity.status(404).body(null);
        }
        return ResponseEntity.ok(seller);
    }

    @RequestMapping("/couriers/{id}")
    public ResponseEntity<Courier> getCourierDetails(@PathVariable("id") String id) {
        if (id == null) {
            return ResponseEntity.status(400).body(null);
        }
        Courier courier = courierService.getCourier(id);
        if (courier == null) {
            return ResponseEntity.status(404).body(null);
        }
        return ResponseEntity.ok(courier);
    }

}
