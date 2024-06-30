package com.nebulamart.userservice.service;

import com.nebulamart.userservice.template.*;
import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.util.AuthFacade;
import com.nebulamart.userservice.util.SecretHash;
import com.nebulamart.userservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import java.util.*;

@Service
public class CustomerService {

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
    public CustomerService(CognitoIdentityProviderClient cognitoClient, DynamoDbClient dynamoDbClient, AuthFacade authFacade) {
        this.cognitoClient = cognitoClient;
        this.dynamoDbClient = dynamoDbClient;
        this.authFacade = authFacade;
    }

    public ResponseEntity<CustomerSignUpResponse> customerSignUp(CustomerSignUp customerSignUp) {

        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();

        AttributeType attributeRole = AttributeType.builder()
                .name("custom:role")
                .value("CUSTOMER")
                .build();

        List<AttributeType> attrs = new ArrayList<>();
        attrs.add(attributeRole);

        try {
            String secretVal = SecretHash.calculateSecretHash(clientId, clientSecret, customerSignUp.getEmail());
            SignUpRequest signUpRequest = SignUpRequest.builder()
                    .userAttributes(attrs)
                    .username(customerSignUp.getEmail())
                    .clientId(clientId)
                    .password(customerSignUp.getPassword())
                    .secretHash(secretVal)
                    .build();

            SignUpResponse result = cognitoClient.signUp(signUpRequest);
            String userId = result.userSub();
            Customer customer = new Customer(userId, customerSignUp.getName(), customerSignUp.getEmail(), customerSignUp.getContactNumber(), customerSignUp.getAddress());

            DynamoDbTable<Customer> customerTable = enhancedClient.table("Customer", TableSchema.fromBean(Customer.class));
            customerTable.putItem(customer);
            return ResponseEntity.ok(new CustomerSignUpResponse(customer));

        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CustomerSignUpResponse(null, e.getMessage()));
        }
    }

    public ResponseEntity<Customer> getCustomerDetails(String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            return ResponseEntity.ok((Customer) authFacade.getUser(wrappedUser));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<CustomerUpdateResponse> updateCustomerDetails(String accessToken, CustomerUpdate customerUpdate) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            Customer customer = (Customer) authFacade.getUser(wrappedUser);
            if (customer != null) {
                if (customerUpdate.getName() != null) {
                    customer.setName(customerUpdate.getName());
                }
                if (customerUpdate.getContactNumber() != null) {
                    customer.setContactNumber(customerUpdate.getContactNumber());
                }
                if (customerUpdate.getAddress() != null) {
                    customer.setAddress(customerUpdate.getAddress());
                }
                DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                        .dynamoDbClient(dynamoDbClient)
                        .build();
                DynamoDbTable<Customer> customerTable = enhancedClient.table("Customer", TableSchema.fromBean(Customer.class));
                customerTable.putItem(customer);
                return ResponseEntity.ok(new CustomerUpdateResponse(customer));
            }
            return ResponseEntity.status(400).body(new CustomerUpdateResponse(null, "Customer not found"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CustomerUpdateResponse(null, e.getMessage()));
        }
    }

}
