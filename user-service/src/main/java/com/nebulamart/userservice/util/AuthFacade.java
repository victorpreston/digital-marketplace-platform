package com.nebulamart.userservice.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.nebulamart.userservice.entity.Courier;
import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.entity.Seller;
import com.nebulamart.userservice.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Component
public class AuthFacade {

    @Autowired
    private DynamoDbClient dynamoDbClient;

    public WrappedUser getWrappedUser(String accessToken) throws JsonProcessingException {
        JwtParser jwtParser = new JwtParser(accessToken);
        jwtParser.parseJwt();
        return new WrappedUser(jwtParser.getCognitoUsername(), jwtParser.getRole(), jwtParser.getEmail());
    }

    public String getRole(WrappedUser wrappedUser) {
        return wrappedUser.getRole();
    }

    public User getUser(WrappedUser wrappedUser) {
        if (wrappedUser.getUser() != null) {
            return wrappedUser.getUser();
        }
        else {
            DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                    .dynamoDbClient(dynamoDbClient)
                    .build();
            User responseUser = null;
            if (wrappedUser.getRole().equals("CUSTOMER")) {
                DynamoDbTable<Customer> customerTable = enhancedClient.table("Customer", TableSchema.fromBean(Customer.class));
                Key key = Key.builder()
                        .partitionValue(wrappedUser.getCognitoUsername())
                        .build();
                responseUser = customerTable.getItem(r -> r.key(key));
            } else if (wrappedUser.getRole().equals("SELLER")) {
                DynamoDbTable<Seller> sellerTable = enhancedClient.table("Seller", TableSchema.fromBean(Seller.class));
                Key key = Key.builder()
                        .partitionValue(wrappedUser.getCognitoUsername())
                        .build();
                responseUser = sellerTable.getItem(r -> r.key(key));
            } else if (wrappedUser.getRole().equals("COURIER")) {
                DynamoDbTable<Courier> courierTable = enhancedClient.table("Courier", TableSchema.fromBean(Courier.class));
                Key key = Key.builder()
                        .partitionValue(wrappedUser.getCognitoUsername())
                        .build();
                responseUser = courierTable.getItem(r -> r.key(key));
            }
            if (responseUser != null) {
                wrappedUser.setUser(responseUser);
            }
            return responseUser;
        }
    }
}
