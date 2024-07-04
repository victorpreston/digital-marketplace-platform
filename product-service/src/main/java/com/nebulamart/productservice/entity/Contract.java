package com.nebulamart.productservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

@Data
@AllArgsConstructor
@NoArgsConstructor
@DynamoDbBean
public class Contract {

    private String id;
    private String productId;
    private String sellerId;
    private String courierId;
    private float deliveryCharge;
    private String status;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = { "courier-index" })
    public String getCourierId() {
        return courierId;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = { "seller-index" })
    public String getSellerId() {
        return sellerId;
    }
}

