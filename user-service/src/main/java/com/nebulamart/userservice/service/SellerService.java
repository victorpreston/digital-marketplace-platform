package com.nebulamart.userservice.service;

import com.nebulamart.userservice.entity.Seller;
import com.nebulamart.userservice.template.SellerSignUp;
import com.nebulamart.userservice.template.SellerSignUpResponse;
import com.nebulamart.userservice.template.SellerUpdate;
import com.nebulamart.userservice.template.SellerUpdateResponse;
import com.nebulamart.userservice.util.AuthFacade;
import com.nebulamart.userservice.util.SecretHash;
import com.nebulamart.userservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import java.util.ArrayList;
import java.util.List;

@Service
public class SellerService {
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
    public SellerService(CognitoIdentityProviderClient cognitoClient, DynamoDbClient dynamoDbClient, AuthFacade authFacade) {
        this.cognitoClient = cognitoClient;
        this.dynamoDbClient = dynamoDbClient;
        this.authFacade = authFacade;
    }

    public ResponseEntity<SellerSignUpResponse> sellerSignUp(SellerSignUp sellerSignUp) {
        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();

        AttributeType attributeRole = AttributeType.builder()
                .name("custom:role")
                .value("SELLER")
                .build();

        List<AttributeType> attrs = new ArrayList<>();
        attrs.add(attributeRole);

        try {
            String secretVal = SecretHash.calculateSecretHash(clientId, clientSecret, sellerSignUp.getEmail());
            SignUpRequest signUpRequest = SignUpRequest.builder()
                    .clientId(clientId)
                    .username(sellerSignUp.getEmail())
                    .password(sellerSignUp.getPassword())
                    .secretHash(secretVal)
                    .userAttributes(attrs)
                    .build();

            SignUpResponse result = cognitoClient.signUp(signUpRequest);
            String userId = result.userSub();
            Seller seller = new Seller(userId, sellerSignUp.getName(), sellerSignUp.getEmail(), sellerSignUp.getContactNumber(), sellerSignUp.getAddress(), sellerSignUp.getLogoUrl());

            DynamoDbTable<Seller> sellerTable = enhancedClient.table("Seller", TableSchema.fromBean(Seller.class));
            sellerTable.putItem(seller);
            return ResponseEntity.ok(new SellerSignUpResponse(seller));

        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new SellerSignUpResponse(null, e.getMessage()));
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

    public ResponseEntity<SellerUpdateResponse> updateSellerDetails(String accessToken, SellerUpdate sellerUpdate) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            Seller seller = (Seller) authFacade.getUser(wrappedUser);
            if (seller != null) {
                if (sellerUpdate.getName() != null) {
                    seller.setName(sellerUpdate.getName());
                }
                if (sellerUpdate.getContactNumber() != null) {
                    seller.setContactNumber(sellerUpdate.getContactNumber());
                }
                if (sellerUpdate.getAddress() != null) {
                    seller.setAddress(sellerUpdate.getAddress());
                }
                if (sellerUpdate.getLogoUrl() != null) {
                    seller.setLogoUrl(sellerUpdate.getLogoUrl());
                }
                DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                        .dynamoDbClient(dynamoDbClient)
                        .build();
                DynamoDbTable<Seller> sellerTable = enhancedClient.table("Seller", TableSchema.fromBean(Seller.class));
                sellerTable.putItem(seller);
                return ResponseEntity.ok(new SellerUpdateResponse(seller));
            }
            return ResponseEntity.status(400).body(new SellerUpdateResponse(null, "Seller not found"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new SellerUpdateResponse(null, e.getMessage()));
        }
    }

    public Seller getSeller(String id) {
        try {
            DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                    .dynamoDbClient(dynamoDbClient)
                    .build();
            Key key = Key.builder()
                    .partitionValue(id)
                    .build();
            DynamoDbTable<Seller> sellerTable = enhancedClient.table("Seller", TableSchema.fromBean(Seller.class));
            return sellerTable.getItem(r -> r.key(key));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

}
