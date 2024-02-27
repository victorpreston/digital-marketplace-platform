package com.nebulamart.userservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@DynamoDbBean
public class Customer {

    private String id;
    private String name;
    private String email;
    private String contactNumber;
    private List<Float> location;
    private String address;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

}

