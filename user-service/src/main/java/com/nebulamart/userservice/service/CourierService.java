package com.nebulamart.userservice.service;

import com.nebulamart.userservice.entity.Courier;
import com.nebulamart.userservice.template.CourierSignUp;
import com.nebulamart.userservice.template.CourierSignUpResponse;
import com.nebulamart.userservice.template.CourierUpdate;
import com.nebulamart.userservice.template.CourierUpdateResponse;
import com.nebulamart.userservice.util.AuthFacade;
import com.nebulamart.userservice.util.SecretHash;
import com.nebulamart.userservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpResponse;
import java.util.ArrayList;
import java.util.List;

@Service
public class CourierService {
    private final CognitoIdentityProviderClient cognitoClient;
    private final DynamoDbTable<Courier> courierTable;
    private final AuthFacade authFacade;

    @Value("${aws-cognito.user-pool-client-id}")
    private String clientId;

    @Value("${aws-cognito.user-pool-client-secret}")
    private String clientSecret;

    @Autowired
    public CourierService(CognitoIdentityProviderClient cognitoClient, DynamoDbTable<Courier> courierTable, AuthFacade authFacade) {
        this.cognitoClient = cognitoClient;
        this.courierTable = courierTable;
        this.authFacade = authFacade;
    }

    public ResponseEntity<CourierSignUpResponse> courierSignUp(CourierSignUp courierSignUp) {
        try {
            List<AttributeType> attrs = new ArrayList<>();
            AttributeType attributeRole = AttributeType.builder().name("custom:role").value("COURIER").build();
            attrs.add(attributeRole);
            String secretVal = SecretHash.calculateSecretHash(clientId, clientSecret, courierSignUp.getEmail());
            SignUpRequest signUpRequest = SignUpRequest.builder().userAttributes(attrs)
                    .clientId(clientId)
                    .secretHash(secretVal)
                    .username(courierSignUp.getEmail())
                    .password(courierSignUp.getPassword())
                    .build();
            SignUpResponse result = cognitoClient.signUp(signUpRequest);
            String userId = result.userSub();
            Courier courier = new Courier(userId, courierSignUp.getName(), courierSignUp.getEmail(), courierSignUp.getContactNumber(), courierSignUp.getLogoUrl(), 0, 0);
            courierTable.putItem(courier);
            return ResponseEntity.ok(new CourierSignUpResponse(courier));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierSignUpResponse(null, e.getMessage()));
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

    public ResponseEntity<CourierUpdateResponse> updateCourierDetails(String accessToken, CourierUpdate courierUpdate) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            Courier courier = (Courier) authFacade.getUser(wrappedUser);
            if (courier != null) {
                if (courierUpdate.getName() != null) {
                    courier.setName(courierUpdate.getName());
                }
                if (courierUpdate.getContactNumber() != null) {
                    courier.setContactNumber(courierUpdate.getContactNumber());
                }
                if (courierUpdate.getLogoUrl() != null) {
                    courier.setLogoUrl(courierUpdate.getLogoUrl());
                }
                courierTable.putItem(courier);
                return ResponseEntity.ok(new CourierUpdateResponse(courier));
            }
            return ResponseEntity.status(401).body(new CourierUpdateResponse(null, "Unauthorized"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierUpdateResponse(null, e.getMessage()));
        }
    }

    public Courier getCourier(String id) {
        try {
            Key key = Key.builder().partitionValue(id).build();
            return courierTable.getItem(r -> r.key(key));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public ResponseEntity<List<Courier>> getCouriers() {
        try {
            List<Courier> courierList = new ArrayList<>();
            PageIterable<Courier> couriers = courierTable.scan();
            for (Courier courier : couriers.items()) {
                courierList.add(courier);
            }
            return ResponseEntity.ok(courierList);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

}
