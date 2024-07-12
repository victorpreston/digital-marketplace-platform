package com.nebulamart.orderservice.repository;

import com.nebulamart.orderservice.entity.Customer;
import com.nebulamart.orderservice.entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;

@Repository
public class CustomerRepository {
    private final DynamoDbTable<Customer> customerTable;

    @Autowired
    public CustomerRepository(DynamoDbTable<Customer> customerTable) {
        this.customerTable = customerTable;
    }

    public Customer getCustomerById(String customerId) {
        return customerTable.getItem(r -> r.key(Key.builder().partitionValue(customerId).build()));
    }

}
