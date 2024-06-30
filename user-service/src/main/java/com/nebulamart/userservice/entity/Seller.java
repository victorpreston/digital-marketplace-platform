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
