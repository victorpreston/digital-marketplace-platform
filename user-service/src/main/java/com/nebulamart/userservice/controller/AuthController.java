package com.nebulamart.userservice.controller;

import com.nebulamart.userservice.entity.Courier;
import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.entity.Seller;
import com.nebulamart.userservice.service.*;
import com.nebulamart.userservice.template.*;
import org.springframework.http.ResponseEntity;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final CustomerService customerService;
    private final SellerService sellerService;
    private final CourierService courierService;
    private final UserService userService;

    @Autowired
    public AuthController(CustomerService customerService, SellerService sellerService, CourierService courierService, UserService userService) {
        this.customerService = customerService;
        this.sellerService = sellerService;
        this.courierService = courierService;
        this.userService = userService;
    }

    @PostMapping("/sign-up/customer")
    public ResponseEntity<CustomerSignUpResponse> CustomerSignUp(@RequestBody CustomerSignUp customerSignUp) {
        if (!customerSignUp.isValid()) {
            return ResponseEntity.status(400).body(new CustomerSignUpResponse(null, "Missing required fields"));
        }
        ResponseEntity<CustomerSignUpResponse> responseEntity = customerService.customerSignUp(customerSignUp);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CustomerSignUpResponse(null, "Sign up failed"));
        }
        return responseEntity;
    }

    @PostMapping("/sign-up/seller")
    public ResponseEntity<SellerSignUpResponse> SellerSignUp(@RequestBody SellerSignUp sellerSignUp) {
        if (!sellerSignUp.isValid()) {
            return ResponseEntity.status(400).body(new SellerSignUpResponse(null, "Missing required fields"));
        }
        ResponseEntity<SellerSignUpResponse> responseEntity = sellerService.sellerSignUp(sellerSignUp);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new SellerSignUpResponse(null, "Sign up failed"));
        }
        return responseEntity;
    }

    @PostMapping("/sign-up/courier")
    public ResponseEntity<CourierSignUpResponse> CourierSignUp(@RequestBody CourierSignUp courierSignUp) {
        if (!courierSignUp.isValid()) {
            return ResponseEntity.status(400).body(new CourierSignUpResponse(null, "Missing required fields"));
        }
        ResponseEntity<CourierSignUpResponse> responseEntity = courierService.courierSignUp(courierSignUp);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierSignUpResponse(null, "Sign up failed"));
        }
        return responseEntity;
    }

    @GetMapping("/verify-account")
    public ResponseEntity<VerifyAccountResponse> confirmSignUp(@PathParam("email") String email, @PathParam("code") String code) {
        if (email == null || code == null) {
            return ResponseEntity.status(400).body(new VerifyAccountResponse(false, "Missing email or code"));
        }
        ResponseEntity<VerifyAccountResponse> responseEntity = userService.confirmSignUp(email, code);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new VerifyAccountResponse(false, "Account verification failed"));
        }
        return responseEntity;
    }

    @PostMapping("/sign-in")
    public ResponseEntity<SignInResponse> signIn(@RequestBody UserSignIn userSignIn) {
        if (!userSignIn.isValid()) {
            return ResponseEntity.status(400).body(new SignInResponse(null, null, "Missing email or password"));
        }
        ResponseEntity<SignInResponse> responseEntity = userService.signIn(userSignIn);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new SignInResponse(null, null, "Sign in failed"));
        }
        return responseEntity;
    }

}
