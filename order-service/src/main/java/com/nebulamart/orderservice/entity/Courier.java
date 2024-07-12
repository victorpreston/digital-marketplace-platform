package com.nebulamart.orderservice.entity;

import lombok.Data;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

@Data
@DynamoDbBean
public class Courier extends User {

    private String id;
    private String name;
    private String email;
    private String contactNumber;
    private String logoUrl;
    private float rating;
    private int ratingCount;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }
}
