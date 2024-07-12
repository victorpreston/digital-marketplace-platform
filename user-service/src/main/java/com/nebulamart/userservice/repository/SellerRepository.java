package com.nebulamart.userservice.repository;

import com.nebulamart.userservice.entity.Seller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;

@Repository
public class SellerRepository {
    private final DynamoDbTable<Seller> sellerTable;

    @Autowired
    public SellerRepository(DynamoDbTable<Seller> sellerTable) {
        this.sellerTable = sellerTable;
    }

    public void saveSeller(Seller seller) {
        sellerTable.putItem(seller);
    }

    public void updateSeller(Seller seller) {
        sellerTable.updateItem(seller);
    }

    public Seller getSellerById(String id) {
        return sellerTable.getItem(r -> r.key(Key.builder().partitionValue(id).build()));
    }

}
