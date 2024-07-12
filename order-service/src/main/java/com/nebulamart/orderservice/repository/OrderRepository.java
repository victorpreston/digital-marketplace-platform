package com.nebulamart.orderservice.repository;

import com.nebulamart.orderservice.entity.Order;
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
public class OrderRepository {
    private final DynamoDbTable<Order> orderTable;
    private final DynamoDbIndex<Order> orderTableCustomerIndex;
    private final DynamoDbIndex<Order> orderTableSellerIndex;
    private final DynamoDbIndex<Order> orderTableCourierIndex;
    private final DynamoDbIndex<Order> orderTableProductIndex;

    @Autowired
    public OrderRepository(DynamoDbTable<Order> orderTable, DynamoDbIndex<Order> orderTableCustomerIndex, DynamoDbIndex<Order> orderTableSellerIndex, DynamoDbIndex<Order> orderTableCourierIndex, DynamoDbIndex<Order> orderTableProductIndex) {
        this.orderTable = orderTable;
        this.orderTableCustomerIndex = orderTableCustomerIndex;
        this.orderTableSellerIndex = orderTableSellerIndex;
        this.orderTableCourierIndex = orderTableCourierIndex;
        this.orderTableProductIndex = orderTableProductIndex;
    }

    public Order getOrderById(String orderId) {
        return orderTable.getItem(r -> r.key(Key.builder().partitionValue(orderId).build()));
    }

    public void createOrder(Order order) {
        orderTable.putItem(order);
    }

    public List<Order> getOrdersByCustomer(String customerId) {
        PageIterable<Order> ordersOfCustomer = (PageIterable<Order>) orderTableCustomerIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(customerId))));
        List<Order> orders = new ArrayList<>();
        for (Order order : ordersOfCustomer.items()) {
            orders.add(order);
        }
        return orders;
    }

    public List<Order> getOrdersBySeller(String sellerId) {
        PageIterable<Order> ordersOfSeller = (PageIterable<Order>) orderTableSellerIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(sellerId))));
        List<Order> orders = new ArrayList<>();
        for (Order order : ordersOfSeller.items()) {
            orders.add(order);
        }
        return orders;
    }

    public List<Order> getOrdersByCourier(String courierId) {
        PageIterable<Order> ordersOfCourier = (PageIterable<Order>) orderTableCourierIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(courierId))));
        List<Order> orders = new ArrayList<>();
        for (Order order : ordersOfCourier.items()) {
            orders.add(order);
        }
        return orders;
    }

    public List<Order> getOrdersByProduct(String productId) {
        PageIterable<Order> ordersOfProduct = (PageIterable<Order>) orderTableProductIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(productId))));
        List<Order> orders = new ArrayList<>();
        for (Order order : ordersOfProduct.items()) {
            orders.add(order);
        }
        return orders;
    }

    public Order setOrderStatus(Order order, String status, String updatedDate) {
        order.setStatus(status);
        if (status.equals("DELIVERED") && order.getDeliveryDate() == null) {
            order.setDeliveryDate(updatedDate);
        } else if (status.equals("DISPATCHED") && order.getDispatchDate() == null) {
            order.setDispatchDate(updatedDate);
        } else if (status.equals("CANCELLED")) {
            order.setDispatchDate(null);
            order.setDeliveryDate(null);
        }
        orderTable.putItem(order);
        return order;
    }

}
