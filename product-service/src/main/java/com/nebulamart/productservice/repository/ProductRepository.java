package com.nebulamart.productservice.repository;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.nebulamart.productservice.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class ProductRepository {

    @Autowired
    private DynamoDBMapper dynamoDBMapper;

    public Product saveProduct(Product product) {
        dynamoDBMapper.save(product);
        return product;
    }

    public Product getProductById(String productId) {
        return dynamoDBMapper.load(Product.class, productId);
    }

    public void deleteProduct(String productId) {
        Product product = dynamoDBMapper.load(Product.class, productId);
        dynamoDBMapper.delete(product);
    }
}
