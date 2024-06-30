package com.nebulamart.productservice.entity;

import lombok.Data;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

@Data
@DynamoDbBean
public class Seller extends User {

    private String id;
    private String name;
    private String email;
    private String contactNumber;
    private String address;
    private String logoUrl;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

}
