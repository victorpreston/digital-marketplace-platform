package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.service.ImageUploadService;
import com.nebulamart.userservice.template.GetUrlResponse;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

@RestController
@RequestMapping("/open")
public class OpenController {

    private final ImageUploadService imageUploadService;

    @Autowired
    public OpenController(ImageUploadService imageUploadService) {
        this.imageUploadService = imageUploadService;
    }

    @GetMapping("/profile-image-upload-url")
    public ResponseEntity<GetUrlResponse> getPreSignedUrl(@PathParam("extension") String extension) {
        if (extension == null || extension.isEmpty()) {
            return ResponseEntity.status(400).body(new GetUrlResponse(null, "Missing or invalid extension"));
        }
        String preSignedUrl = imageUploadService.getPreSignedUrl("users" + "/" + UUID.randomUUID().toString() + "." + extension);
        if (preSignedUrl == null) {
            return ResponseEntity.status(400).body(new GetUrlResponse(null, "Failed to get pre-signed URL"));
        }
        return ResponseEntity.ok(new GetUrlResponse(preSignedUrl, "Pre-signed URL generated successfully"));
    }

}
