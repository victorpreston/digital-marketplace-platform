package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.service.ImageUploadService;
import com.nebulamart.userservice.template.*;
import org.springframework.http.ResponseEntity;
import com.nebulamart.userservice.service.CustomerService;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final ImageUploadService imageUploadService;
    private final CustomerService customerService;

    @Autowired
    public AuthController(CustomerService customerService, ImageUploadService imageUploadService) {
        this.imageUploadService = imageUploadService;
        this.customerService = customerService;
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

    @PostMapping("/sign-up/customer")
    public ResponseEntity<CustomerSignUpResponse> CustomerSignUp(@RequestBody CustomerSignUp customerSignUp) {
        if (!customerSignUp.isValid()) {
            return ResponseEntity.status(400).body(new CustomerSignUpResponse(null, "Missing required fields"));
        }
        Customer customer = customerService.customerSignUp(customerSignUp);
        if (customer == null) {
            return ResponseEntity.status(400).body(new CustomerSignUpResponse(null, "Sign up failed"));
        }
        return ResponseEntity.ok(new CustomerSignUpResponse(customer));
    }

    @GetMapping("/verify-account")
    public ResponseEntity<VerifyAccountResponse> confirmSignUp(@PathParam("email") String email, @PathParam("code") String code) {
        if (email == null || code == null) {
            return ResponseEntity.status(400).body(new VerifyAccountResponse(false, "Missing email or code"));
        }
        VerifyAccountResponse response = customerService.confirmSignUp(email, code);
        if (!response.getSuccess()) {
            return ResponseEntity.status(400).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sign-in/customer")
    public ResponseEntity<SignInResponse> signIn(@RequestBody UserSignIn userSignIn) {
        if (!userSignIn.isValid()) {
            return ResponseEntity.status(400).body(new SignInResponse(null, null, "Missing email or password"));
        }
        SignInResponse response = customerService.signIn(userSignIn);
        if (response.getAccessToken() == null) {
            return ResponseEntity.status(400).body(response);
        }
        return ResponseEntity.ok(response);
    }

}
