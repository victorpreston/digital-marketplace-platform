package com.nebulamart.orderservice.repository;

import com.nebulamart.orderservice.entity.Order;
import com.nebulamart.orderservice.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;

@Repository
public class ProductRepository {
    private final DynamoDbTable<Product> productTable;

    @Autowired
    public ProductRepository(DynamoDbTable<Product> productTable) {
        this.productTable = productTable;
    }

    public boolean decreaseStock(String productId, int quantity) {
        Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(productId).build()));
        if (product == null) {
            return false;
        }
        product.setStock(product.getStock() - quantity);
        productTable.updateItem(product);
        return true;
    }

    public boolean increaseStock(String productId, int quantity) {
        Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(productId).build()));
        if (product == null) {
            return false;
        }
        product.setStock(product.getStock() + quantity);
        productTable.updateItem(product);
        return true;
    }

    public void updateProductRating(String productId, int productRating) {
        Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(productId).build()));
        if (product == null) {
            return;
        }
        float currentRating = product.getRating();
        int currentRatingCount = product.getRatingCount();
        float newRating = (currentRating * currentRatingCount + productRating) / (currentRatingCount + 1);
        product.setRating(newRating);
        product.setRatingCount(currentRatingCount + 1);
        productTable.updateItem(product);
    }

}
