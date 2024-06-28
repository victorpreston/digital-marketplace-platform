package com.nebulamart.userservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

@Data
@AllArgsConstructor
@NoArgsConstructor
@DynamoDbBean
public class Courier extends User {

    private String id;
    private String name;
    private String email;
    private int contactNumber;
    private String logoUrl;
    private float rating;
    private int ratingCount;
    private float unitDeliveryCharge;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }
}
