package com.nebulamart.productservice.repository;


import com.nebulamart.productservice.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.*;

@Repository
public class ProductRepository {

    @Autowired
    private DynamoDbClient dynamoDbClient;

    public Product getProductById(String productId) {
        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
        try {
            DynamoDbTable<Product> productTable = enhancedClient.table("Product", TableSchema.fromBean(Product.class));
            Key key = Key.builder().partitionValue(productId).sortValue(0).build();
            System.out.println("Product found with id: " + productId);

            Product product = productTable.getItem(key);
            return product;
        } catch (Exception e) {
            System.out.println("Error getting product: " + e.getMessage());
            return null;
        }
    }

    public Product createProduct(Product product) {
        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
        try {
            DynamoDbTable<Product> productTable = enhancedClient.table("Product", TableSchema.fromBean(Product.class));
            String newId = java.util.UUID.randomUUID().toString();
            product.setId(newId);
            productTable.putItem(product);
            System.out.println("Product created with id: " + newId);
            return product;
        } catch (Exception e) {
            System.out.println("Error creating product: " + e.getMessage());
            return null;
        }
    }

    public Iterable<Product> searchProducts(String name) {
        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
        DynamoDbTable<Product> productTable = enhancedClient.table("Product", TableSchema.fromBean(Product.class));
        AttributeValue attVal = AttributeValue.builder()
                .s(name)
                .build();

        Map<String, AttributeValue> myMap = new HashMap<>();
        myMap.put(":val1", attVal);

        Map<String, String> myExMap = new HashMap<>();
        myExMap.put("#n", "name");

        Expression expression = Expression.builder()
                .expressionValues(myMap)
                .expressionNames(myExMap)
                .expression("contains(#n, :val1)")
                .build();

        ScanEnhancedRequest enhancedRequest = ScanEnhancedRequest.builder()
                .filterExpression(expression)
                .limit(15)
                .build();

        // Get items in the Issues table.
        Iterable<Product> resultProducts = productTable.scan(enhancedRequest).items();

        return resultProducts;
    }

//    public void deleteProduct(String productId) {
//        Product product = dynamoDBMapper.load(Product.class, productId);
//        dynamoDBMapper.delete(product);
//    }

//    public Product updateProduct(String productId, Product product) {
//        dynamoDBMapper.save(product,
//                new DynamoDBSaveExpression()
//                        .withExpectedEntry("id",
//                                new ExpectedAttributeValue(
//                                        new AttributeValue().withS(productId)
//                                )
//                        )
//                );
//        return product;
//    }
}
