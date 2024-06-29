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
        Customer customer = customerService.customerSignUp(customerSignUp);
        if (customer == null) {
            return ResponseEntity.status(400).body(new CustomerSignUpResponse(null, "Sign up failed"));
        }
        return ResponseEntity.ok(new CustomerSignUpResponse(customer));
    }

    @PostMapping("/sign-up/seller")
    public ResponseEntity<SellerSignUpResponse> SellerSignUp(@RequestBody SellerSignUp sellerSignUp) {
        if (!sellerSignUp.isValid()) {
            return ResponseEntity.status(400).body(new SellerSignUpResponse(null, "Missing required fields"));
        }
        Seller seller = sellerService.sellerSignUp(sellerSignUp);
        if (seller == null) {
            return ResponseEntity.status(400).body(new SellerSignUpResponse(null, "Sign up failed"));
        }
        return ResponseEntity.ok(new SellerSignUpResponse(seller));
    }

    @PostMapping("/sign-up/courier")
    public ResponseEntity<CourierSignUpResponse> CourierSignUp(@RequestBody CourierSignUp courierSignUp) {
        if (!courierSignUp.isValid()) {
            return ResponseEntity.status(400).body(new CourierSignUpResponse(null, "Missing required fields"));
        }
        Courier courier = courierService.courierSignUp(courierSignUp);
        if (courier == null) {
            return ResponseEntity.status(400).body(new CourierSignUpResponse(null, "Sign up failed"));
        }
        return ResponseEntity.ok(new CourierSignUpResponse(courier));
    }

    @GetMapping("/verify-account")
    public ResponseEntity<VerifyAccountResponse> confirmSignUp(@PathParam("email") String email, @PathParam("code") String code) {
        if (email == null || code == null) {
            return ResponseEntity.status(400).body(new VerifyAccountResponse(false, "Missing email or code"));
        }
        VerifyAccountResponse response = userService.confirmSignUp(email, code);
        if (!response.getSuccess()) {
            return ResponseEntity.status(400).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sign-in")
    public ResponseEntity<SignInResponse> signIn(@RequestBody UserSignIn userSignIn) {
        if (!userSignIn.isValid()) {
            return ResponseEntity.status(400).body(new SignInResponse(null, null, "Missing email or password"));
        }
        SignInResponse response = userService.signIn(userSignIn);
        if (response.getAccessToken() == null) {
            return ResponseEntity.status(400).body(response);
        }
        return ResponseEntity.ok(response);
    }

}
