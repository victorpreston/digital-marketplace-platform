package com.nebulamart.orderservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

@Data
@AllArgsConstructor
@NoArgsConstructor
@DynamoDbBean
public class Review {

    private String id;
    private String productId;
    private String sellerId;
    private String courierId;
    private String orderId;
    private String customerId;
    private String customerName;
    private String productReview;
    private String courierReview;
    private int productRating;
    private int courierRating;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

}
