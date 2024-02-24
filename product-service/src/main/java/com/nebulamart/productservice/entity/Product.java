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
public class Product {

    private String id;
    private String name;
    private String description;
    private String brand;
    private String imageUrl;
    private String category;

    private int stock;
    private float price;
    private float rating;
    private int ratingCount;

    private String sellerId;
    private String sellerName;
    private String courierId;
    private String courierName;
    private String status;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

    @DynamoDbSortKey
    public int getRatingCount() {
        return ratingCount;
    }

}
