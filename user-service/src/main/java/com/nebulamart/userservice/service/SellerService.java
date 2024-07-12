package com.nebulamart.userservice.service;

import com.nebulamart.userservice.entity.Seller;
import com.nebulamart.userservice.repository.SellerRepository;
import com.nebulamart.userservice.template.SellerSignUpDTO;
import com.nebulamart.userservice.template.SellerSignUpResponseDTO;
import com.nebulamart.userservice.template.SellerUpdateDTO;
import com.nebulamart.userservice.template.SellerUpdateResponseDTO;
import com.nebulamart.userservice.util.AuthFacade;
import com.nebulamart.userservice.util.SecretHash;
import com.nebulamart.userservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class SellerService {
    private final CognitoIdentityProviderClient cognitoClient;
    private final SellerRepository sellerRepository;
    private final AuthFacade authFacade;

    @Value("${aws-cognito.user-pool-id}")
    private String userPoolId;

    @Value("${aws-cognito.user-pool-client-id}")
    private String clientId;

    @Value("${aws-cognito.user-pool-client-secret}")
    private String clientSecret;

    @Autowired
    public SellerService(CognitoIdentityProviderClient cognitoClient, SellerRepository sellerRepository, AuthFacade authFacade) {
        this.cognitoClient = cognitoClient;
        this.sellerRepository = sellerRepository;
        this.authFacade = authFacade;
    }

    public ResponseEntity<SellerSignUpResponseDTO> sellerSignUp(SellerSignUpDTO sellerSignUpDTO) {
        try {
            AttributeType attributeRole = AttributeType.builder().name("custom:role").value("SELLER").build();
            List<AttributeType> attrs = new ArrayList<>();
            attrs.add(attributeRole);
            String secretVal = SecretHash.calculateSecretHash(clientId, clientSecret, sellerSignUpDTO.getEmail());
            SignUpRequest signUpRequest = SignUpRequest.builder()
                    .clientId(clientId)
                    .username(sellerSignUpDTO.getEmail())
                    .password(sellerSignUpDTO.getPassword())
                    .secretHash(secretVal)
                    .userAttributes(attrs)
                    .build();
            SignUpResponse result = cognitoClient.signUp(signUpRequest);
            String userId = result.userSub();
            Seller seller = new Seller(userId, sellerSignUpDTO.getName(), sellerSignUpDTO.getEmail(), sellerSignUpDTO.getContactNumber(), sellerSignUpDTO.getAddress(), sellerSignUpDTO.getLogoUrl());
            sellerRepository.saveSeller(seller);
            return ResponseEntity.ok(new SellerSignUpResponseDTO(seller));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new SellerSignUpResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<Seller> getSellerDetails(String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            return ResponseEntity.ok((Seller) authFacade.getUser(wrappedUser));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<SellerUpdateResponseDTO> updateSellerDetails(String accessToken, SellerUpdateDTO sellerUpdateDTO) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            Seller seller = (Seller) authFacade.getUser(wrappedUser);
            if (seller != null) {
                if (sellerUpdateDTO.getName() != null) {
                    seller.setName(sellerUpdateDTO.getName());
                }
                if (sellerUpdateDTO.getContactNumber() != null) {
                    seller.setContactNumber(sellerUpdateDTO.getContactNumber());
                }
                if (sellerUpdateDTO.getAddress() != null) {
                    seller.setAddress(sellerUpdateDTO.getAddress());
                }
                if (sellerUpdateDTO.getLogoUrl() != null) {
                    seller.setLogoUrl(sellerUpdateDTO.getLogoUrl());
                }
                sellerRepository.updateSeller(seller);
                return ResponseEntity.ok(new SellerUpdateResponseDTO(seller));
            }
            return ResponseEntity.status(400).body(new SellerUpdateResponseDTO(null, "Seller not found"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new SellerUpdateResponseDTO(null, e.getMessage()));
        }
    }

    public Seller getSeller(String id) {
        try {
            return sellerRepository.getSellerById(id);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

}
