package com.nebulamart.userservice.repository;

import com.nebulamart.userservice.entity.Courier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import java.util.ArrayList;
import java.util.List;

@Repository
public class CourierRepository {
    private final DynamoDbTable<Courier> courierTable;

    @Autowired
    public CourierRepository(DynamoDbTable<Courier> courierTable) {
        this.courierTable = courierTable;
    }

    public void saveCourier(Courier courier) {
        courierTable.putItem(courier);
    }

    public void updateCourier(Courier courier) {
        courierTable.updateItem(courier);
    }

    public Courier getCourierById(String id) {
        return courierTable.getItem(r -> r.key(Key.builder().partitionValue(id).build()));
    }

    public List<Courier> getAllCouriers() {
        List<Courier> courierList = new ArrayList<>();
        PageIterable<Courier> couriers = courierTable.scan();
        for (Courier courier : couriers.items()) {
            courierList.add(courier);
        }
        return courierList;
    }

}
