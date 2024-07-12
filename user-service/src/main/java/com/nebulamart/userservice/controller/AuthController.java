package com.nebulamart.userservice.controller;

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
    public ResponseEntity<CustomerSignUpResponseDTO> CustomerSignUp(@RequestBody CustomerSignUpDTO customerSignUpDTO) {
        if (!customerSignUpDTO.isValid()) {
            return ResponseEntity.status(400).body(new CustomerSignUpResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<CustomerSignUpResponseDTO> responseEntity = customerService.customerSignUp(customerSignUpDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CustomerSignUpResponseDTO(null, "Sign up failed"));
        }
        return responseEntity;
    }

    @PostMapping("/sign-up/seller")
    public ResponseEntity<SellerSignUpResponseDTO> SellerSignUp(@RequestBody SellerSignUpDTO sellerSignUpDTO) {
        if (!sellerSignUpDTO.isValid()) {
            return ResponseEntity.status(400).body(new SellerSignUpResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<SellerSignUpResponseDTO> responseEntity = sellerService.sellerSignUp(sellerSignUpDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new SellerSignUpResponseDTO(null, "Sign up failed"));
        }
        return responseEntity;
    }

    @PostMapping("/sign-up/courier")
    public ResponseEntity<CourierSignUpResponseDTO> CourierSignUp(@RequestBody CourierSignUpDTO courierSignUpDTO) {
        if (!courierSignUpDTO.isValid()) {
            return ResponseEntity.status(400).body(new CourierSignUpResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<CourierSignUpResponseDTO> responseEntity = courierService.courierSignUp(courierSignUpDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new CourierSignUpResponseDTO(null, "Sign up failed"));
        }
        return responseEntity;
    }

    @GetMapping("/verify-account")
    public ResponseEntity<VerifyAccountResponseDTO> confirmSignUp(@PathParam("email") String email, @PathParam("code") String code) {
        if (email == null || code == null) {
            return ResponseEntity.status(400).body(new VerifyAccountResponseDTO(false, "Missing email or code"));
        }
        ResponseEntity<VerifyAccountResponseDTO> responseEntity = userService.confirmSignUp(email, code);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new VerifyAccountResponseDTO(false, "Account verification failed"));
        }
        return responseEntity;
    }

    @PostMapping("/sign-in")
    public ResponseEntity<SignInResponseDTO> signIn(@RequestBody UserSignInDTO userSignInDTO) {
        if (!userSignInDTO.isValid()) {
            return ResponseEntity.status(400).body(new SignInResponseDTO(null, null, "Missing email or password"));
        }
        ResponseEntity<SignInResponseDTO> responseEntity = userService.signIn(userSignInDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new SignInResponseDTO(null, null, "Sign in failed"));
        }
        return responseEntity;
    }

}
