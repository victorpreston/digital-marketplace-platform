package com.nebulamart.userservice.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.nebulamart.userservice.entity.Courier;
import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.entity.Seller;
import com.nebulamart.userservice.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;

@Component
public class AuthFacade {
    private final DynamoDbTable<Customer> customerTable;
    private final DynamoDbTable<Seller> sellerTable;
    private final DynamoDbTable<Courier> courierTable;

    @Autowired
    public AuthFacade(DynamoDbTable<Customer> customerTable, DynamoDbTable<Seller> sellerTable, DynamoDbTable<Courier> courierTable) {
        this.customerTable = customerTable;
        this.sellerTable = sellerTable;
        this.courierTable = courierTable;
    }

    public WrappedUser getWrappedUser(String accessToken) throws JsonProcessingException {
        JwtParser jwtParser = new JwtParser(accessToken);
        jwtParser.parseJwt();
        return new WrappedUser(jwtParser.getCognitoUsername(), jwtParser.getRole(), jwtParser.getEmail());
    }

    public String getCognitoUsername(WrappedUser wrappedUser) {
        return wrappedUser.getCognitoUsername();
    }

    public String getRole(WrappedUser wrappedUser) {
        return wrappedUser.getRole();
    }

    public String getEmail(WrappedUser wrappedUser) {
        return wrappedUser.getEmail();
    }

    public User getUser(WrappedUser wrappedUser) {
        if (wrappedUser.getUser() != null) {
            return wrappedUser.getUser();
        }
        else {
            User responseUser = null;
            Key userKey = Key.builder().partitionValue(wrappedUser.getCognitoUsername()).build();
            if (wrappedUser.getRole().equals("CUSTOMER")) {
                responseUser = customerTable.getItem(r -> r.key(userKey));
            } else if (wrappedUser.getRole().equals("SELLER")) {
                responseUser = sellerTable.getItem(r -> r.key(userKey));
            } else if (wrappedUser.getRole().equals("COURIER")) {
                responseUser = courierTable.getItem(r -> r.key(userKey));
            }
            if (responseUser != null) {
                wrappedUser.setUser(responseUser);
            }
            return responseUser;
        }
    }
}
