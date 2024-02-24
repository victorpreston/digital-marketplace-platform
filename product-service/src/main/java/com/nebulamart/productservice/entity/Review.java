package com.nebulamart.productservice.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@Data
@AllArgsConstructor
@NoArgsConstructor
@DynamoDbBean
public class Review {

    private String id;
    private String productId;
    private String productName;
    private String orderId;
    private String customerId;
    private String customerName;
    private String description;
    private int productRating;
    private int courierRating;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

    @DynamoDbSortKey
    public String productId() {
        return productId;
    }

}
