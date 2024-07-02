package com.nebulamart.productservice.entity;

import lombok.Data;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

@Data
@DynamoDbBean
public class Customer extends User {

    private String id;
    private String name;
    private String email;
    private String contactNumber;
    private String address;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

}

