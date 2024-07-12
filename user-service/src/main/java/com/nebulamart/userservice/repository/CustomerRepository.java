package com.nebulamart.userservice.repository;

import com.nebulamart.userservice.entity.Customer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

@Repository
public class CustomerRepository {
    private final DynamoDbTable<Customer> customerTable;

    @Autowired
    public CustomerRepository(DynamoDbTable<Customer> customerTable) {
        this.customerTable = customerTable;
    }

    public void saveCustomer(Customer customer) {
        customerTable.putItem(customer);
    }

    public void updateCustomer(Customer customer) {
        customerTable.updateItem(customer);
    }
}
