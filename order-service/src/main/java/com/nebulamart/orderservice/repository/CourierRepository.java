package com.nebulamart.orderservice.repository;

import com.nebulamart.orderservice.entity.Courier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;

@Repository
public class CourierRepository {
    private final DynamoDbTable<Courier> courierTable;

    @Autowired
    public CourierRepository(DynamoDbTable<Courier> courierTable) {
        this.courierTable = courierTable;
    }


    public void updateCourierRating(String courierId, int courierRating) {
        Courier courier = courierTable.getItem(r -> r.key(Key.builder().partitionValue(courierId).build()));
        if (courier == null) {
            return;
        }
        float currentRating = courier.getRating();
        int currentRatingCount = courier.getRatingCount();
        float newRating = (currentRating * currentRatingCount + courierRating) / (currentRatingCount + 1);
        courier.setRating(newRating);
        courier.setRatingCount(currentRatingCount + 1);
        courierTable.updateItem(courier);
    }
}
