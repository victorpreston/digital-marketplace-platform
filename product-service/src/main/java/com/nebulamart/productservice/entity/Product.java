package com.nebulamart.productservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

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
    private Category category;

    private int stock;
    private float basePrice;
    private float discount;
    private float rating;
    private int ratingCount;

    private String sellerId;
    private String courierId;
    private String contractId;
    private ProductStatus status;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

}

