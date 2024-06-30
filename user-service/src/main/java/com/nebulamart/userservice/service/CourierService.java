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
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import java.util.ArrayList;
import java.util.List;

import static software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional.keyEqualTo;

@Service
public class CourierService {
    private final CognitoIdentityProviderClient cognitoClient;
    private final DynamoDbClient dynamoDbClient;
    private final AuthFacade authFacade;

    @Value("${aws-cognito.user-pool-id}")
    private String userPoolId;

    @Value("${aws-cognito.user-pool-client-id}")
    private String clientId;

    @Value("${aws-cognito.user-pool-client-secret}")
    private String clientSecret;

    @Autowired
    public CourierService(CognitoIdentityProviderClient cognitoClient, DynamoDbClient dynamoDbClient, AuthFacade authFacade) {
        this.cognitoClient = cognitoClient;
        this.dynamoDbClient = dynamoDbClient;
        this.authFacade = authFacade;
    }

    public ResponseEntity<CourierSignUpResponse> courierSignUp(CourierSignUp courierSignUp) {

        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();

        AttributeType attributeRole = AttributeType.builder()
                .name("custom:role")
                .value("COURIER")
                .build();

        List<AttributeType> attrs = new ArrayList<>();
        attrs.add(attributeRole);

        try {
            String secretVal = SecretHash.calculateSecretHash(clientId, clientSecret, courierSignUp.getEmail());
            SignUpRequest signUpRequest = SignUpRequest.builder()
                    .userAttributes(attrs)
                    .username(courierSignUp.getEmail())
                    .clientId(clientId)
                    .password(courierSignUp.getPassword())
                    .secretHash(secretVal)
                    .build();

            SignUpResponse result = cognitoClient.signUp(signUpRequest);
            String userId = result.userSub();
            Courier courier = new Courier(userId, courierSignUp.getName(), courierSignUp.getEmail(), courierSignUp.getContactNumber(), courierSignUp.getLogoUrl(), 0, 0);

            DynamoDbTable<Courier> courierTable = enhancedClient.table("Courier", TableSchema.fromBean(Courier.class));
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
                DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                        .dynamoDbClient(dynamoDbClient)
                        .build();
                DynamoDbTable<Courier> courierTable = enhancedClient.table("Courier", TableSchema.fromBean(Courier.class));
                courierTable.putItem(courier);
                return ResponseEntity.ok(new CourierUpdateResponse(courier));
            }
            return ResponseEntity.status(400).body(new CourierUpdateResponse(null, "Courier not found"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierUpdateResponse(null, e.getMessage()));
        }
    }

    public Courier getCourier(String id) {
        try {
            DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                    .dynamoDbClient(dynamoDbClient)
                    .build();
            Key key = Key.builder()
                    .partitionValue(id)
                    .build();
            DynamoDbTable<Courier> courierTable = enhancedClient.table("Courier", TableSchema.fromBean(Courier.class));
            return courierTable.getItem(r -> r.key(key));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public ResponseEntity<List<Courier>> getCouriers() {
        try {
            DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                    .dynamoDbClient(dynamoDbClient)
                    .build();
            DynamoDbTable<Courier> courierTable = enhancedClient.table("Courier", TableSchema.fromBean(Courier.class));
            PageIterable<Courier> couriers = courierTable.scan();
            List<Courier> courierList = new ArrayList<>();
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
