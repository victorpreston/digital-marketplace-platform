package com.nebulamart.userservice.service;

import com.nebulamart.userservice.entity.Courier;
import com.nebulamart.userservice.repository.CourierRepository;
import com.nebulamart.userservice.template.CourierSignUpDTO;
import com.nebulamart.userservice.template.CourierSignUpResponseDTO;
import com.nebulamart.userservice.template.CourierUpdateDTO;
import com.nebulamart.userservice.template.CourierUpdateResponseDTO;
import com.nebulamart.userservice.util.AuthFacade;
import com.nebulamart.userservice.util.SecretHash;
import com.nebulamart.userservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpResponse;
import java.util.ArrayList;
import java.util.List;

@Service
public class CourierService {
    private final CognitoIdentityProviderClient cognitoClient;
    private final CourierRepository courierRepository;
    private final AuthFacade authFacade;

    @Value("${aws-cognito.user-pool-client-id}")
    private String clientId;

    @Value("${aws-cognito.user-pool-client-secret}")
    private String clientSecret;

    @Autowired
    public CourierService(CognitoIdentityProviderClient cognitoClient, CourierRepository courierRepository, AuthFacade authFacade) {
        this.cognitoClient = cognitoClient;
        this.courierRepository = courierRepository;
        this.authFacade = authFacade;
    }

    public ResponseEntity<CourierSignUpResponseDTO> courierSignUp(CourierSignUpDTO courierSignUpDTO) {
        try {
            List<AttributeType> attrs = new ArrayList<>();
            AttributeType attributeRole = AttributeType.builder().name("custom:role").value("COURIER").build();
            attrs.add(attributeRole);
            String secretVal = SecretHash.calculateSecretHash(clientId, clientSecret, courierSignUpDTO.getEmail());
            SignUpRequest signUpRequest = SignUpRequest.builder().userAttributes(attrs)
                    .clientId(clientId)
                    .secretHash(secretVal)
                    .username(courierSignUpDTO.getEmail())
                    .password(courierSignUpDTO.getPassword())
                    .build();
            SignUpResponse result = cognitoClient.signUp(signUpRequest);
            String userId = result.userSub();
            Courier courier = new Courier(userId, courierSignUpDTO.getName(), courierSignUpDTO.getEmail(), courierSignUpDTO.getContactNumber(), courierSignUpDTO.getLogoUrl(), 0, 0);
            courierRepository.saveCourier(courier);
            return ResponseEntity.ok(new CourierSignUpResponseDTO(courier));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierSignUpResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<Courier> getCourierDetails(String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            return ResponseEntity.ok((Courier) authFacade.getUser(wrappedUser));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<CourierUpdateResponseDTO> updateCourierDetails(String accessToken, CourierUpdateDTO courierUpdateDTO) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            Courier courier = (Courier) authFacade.getUser(wrappedUser);
            if (courier != null) {
                if (courierUpdateDTO.getName() != null) {
                    courier.setName(courierUpdateDTO.getName());
                }
                if (courierUpdateDTO.getContactNumber() != null) {
                    courier.setContactNumber(courierUpdateDTO.getContactNumber());
                }
                if (courierUpdateDTO.getLogoUrl() != null) {
                    courier.setLogoUrl(courierUpdateDTO.getLogoUrl());
                }
                courierRepository.updateCourier(courier);
                return ResponseEntity.ok(new CourierUpdateResponseDTO(courier));
            }
            return ResponseEntity.status(401).body(new CourierUpdateResponseDTO(null, "Unauthorized"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierUpdateResponseDTO(null, e.getMessage()));
        }
    }

    public Courier getCourier(String id) {
        try {
            return courierRepository.getCourierById(id);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public ResponseEntity<List<Courier>> getCouriers() {
        try {
            List<Courier> courierList = courierRepository.getAllCouriers();
            return ResponseEntity.ok(courierList);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

}
