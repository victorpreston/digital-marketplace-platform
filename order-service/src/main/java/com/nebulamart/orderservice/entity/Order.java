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
public class Order {

    private String id;
    private String productId;
    private String productName;
    private String sellerId;
    private String sellerName;
    private String sellerLogoUrl;
    private String courierId;
    private String courierName;
    private String courierLogoUrl;
    private String customerId;
    private String customerName;
    private String customerContactNumber;

    private float finalPrice;
    private String deliveryAddress;
    private String dispatchDate;
    private String deliveryDate;
    private OrderStatus status;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

}

