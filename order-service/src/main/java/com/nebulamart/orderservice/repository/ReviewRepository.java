package com.nebulamart.orderservice.repository;

import com.nebulamart.orderservice.entity.Order;
import com.nebulamart.orderservice.entity.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import java.util.ArrayList;
import java.util.List;

import static software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional.keyEqualTo;

@Repository
public class ReviewRepository {
    private final DynamoDbTable<Review> reviewTable;
    private final DynamoDbIndex<Review> reviewTableProductIndex;
    private final DynamoDbIndex<Review> reviewTableSellerIndex;
    private final DynamoDbIndex<Review> reviewTableCourierIndex;

    @Autowired
    public ReviewRepository(DynamoDbTable<Review> reviewTable, DynamoDbIndex<Review> reviewTableProductIndex, DynamoDbIndex<Review> reviewTableSellerIndex, DynamoDbIndex<Review> reviewTableCourierIndex) {
        this.reviewTable = reviewTable;
        this.reviewTableProductIndex = reviewTableProductIndex;
        this.reviewTableSellerIndex = reviewTableSellerIndex;
        this.reviewTableCourierIndex = reviewTableCourierIndex;
    }

    public void createReview(Review review) {
        reviewTable.putItem(review);
    }

    public List<Review> getReviewsByProductId(String productId) {
        PageIterable<Review> reviewsByProduct = (PageIterable<Review>) reviewTableProductIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(productId))));
        List<Review> reviews = new ArrayList<>();
        for (Review review : reviewsByProduct.items()) {
            reviews.add(review);
        }
        return reviews;
    }

    public List<Review> getReviewsBySellerId(String sellerId) {
        PageIterable<Review> reviewsBySeller = (PageIterable<Review>) reviewTableSellerIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(sellerId))));
        List<Review> reviews = new ArrayList<>();
        for (Review review : reviewsBySeller.items()) {
            reviews.add(review);
        }
        return reviews;
    }

    public List<Review> getReviewsByCourierId(String courierId) {
        PageIterable<Review> reviewsByCourier = (PageIterable<Review>) reviewTableCourierIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(courierId))));
        List<Review> reviews = new ArrayList<>();
        for (Review review : reviewsByCourier.items()) {
            reviews.add(review);
        }
        return reviews;
    }

    public Review getReviewsById(String id) {
        return reviewTable.getItem(r -> r.key(Key.builder().partitionValue(id).build()));
    }
}
