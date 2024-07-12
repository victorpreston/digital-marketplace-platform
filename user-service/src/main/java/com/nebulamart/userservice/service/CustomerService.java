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
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
import java.util.*;

@Service
public class CustomerService {
    private final CognitoIdentityProviderClient cognitoClient;
    private final DynamoDbTable<Customer> customerTable;
    private final AuthFacade authFacade;

    @Value("${aws-cognito.user-pool-client-id}")
    private String clientId;

    @Value("${aws-cognito.user-pool-client-secret}")
    private String clientSecret;

    @Autowired
    public CustomerService(CognitoIdentityProviderClient cognitoClient, DynamoDbTable<Customer> customerTable, AuthFacade authFacade) {
        this.cognitoClient = cognitoClient;
        this.customerTable = customerTable;
        this.authFacade = authFacade;
    }

    public ResponseEntity<CustomerSignUpResponseDTO> customerSignUp(CustomerSignUpDTO customerSignUpDTO) {
        try {
            List<AttributeType> attrs = new ArrayList<>();
            AttributeType attributeRole = AttributeType.builder().name("custom:role").value("CUSTOMER").build();
            attrs.add(attributeRole);
            String secretVal = SecretHash.calculateSecretHash(clientId, clientSecret, customerSignUpDTO.getEmail());
            SignUpRequest signUpRequest = SignUpRequest.builder().userAttributes(attrs)
                    .clientId(clientId)
                    .secretHash(secretVal)
                    .username(customerSignUpDTO.getEmail())
                    .password(customerSignUpDTO.getPassword())
                    .build();
            SignUpResponse result = cognitoClient.signUp(signUpRequest);
            String userId = result.userSub();
            Customer customer = new Customer(userId, customerSignUpDTO.getName(), customerSignUpDTO.getEmail(), customerSignUpDTO.getContactNumber(), customerSignUpDTO.getAddress());
            customerTable.putItem(customer);
            return ResponseEntity.ok(new CustomerSignUpResponseDTO(customer));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CustomerSignUpResponseDTO(null, e.getMessage()));
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

    public ResponseEntity<CustomerUpdateResponseDTO> updateCustomerDetails(String accessToken, CustomerUpdateDTO customerUpdateDTO) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            Customer customer = (Customer) authFacade.getUser(wrappedUser);
            if (customer != null) {
                if (customerUpdateDTO.getName() != null) {
                    customer.setName(customerUpdateDTO.getName());
                }
                if (customerUpdateDTO.getContactNumber() != null) {
                    customer.setContactNumber(customerUpdateDTO.getContactNumber());
                }
                if (customerUpdateDTO.getAddress() != null) {
                    customer.setAddress(customerUpdateDTO.getAddress());
                }
                customerTable.putItem(customer);
                return ResponseEntity.ok(new CustomerUpdateResponseDTO(customer));
            }
            return ResponseEntity.status(400).body(new CustomerUpdateResponseDTO(null, "Customer not found"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CustomerUpdateResponseDTO(null, e.getMessage()));
        }
    }

}
