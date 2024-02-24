package com.nebulamart.orderservice.entity;

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
public class Order {

    private String id;
    private String productId;
    private String productName;
    private String customerId;
    private String customerName;
    private String sellerId;
    private String sellerName;
    private String courierId;
    private String courierName;

    private List<Float> dispatchLocation;
    private List<Float> deliveryLocation;
    private String dispatchDate;
    private String deliveryDate;
    private String status;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

}
