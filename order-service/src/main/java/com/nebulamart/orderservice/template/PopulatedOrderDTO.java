package com.nebulamart.orderservice.template;

import com.nebulamart.orderservice.entity.Courier;
import com.nebulamart.orderservice.entity.Customer;
import com.nebulamart.orderservice.entity.Product;
import com.nebulamart.orderservice.entity.Seller;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PopulatedOrderDTO {
    private String id;
    private Product product;
    private Seller seller;
    private Courier courier;
    private Customer customer;

    private int quantity;
    private float finalPrice;
    private String deliveryAddress;
    private String dispatchDate;
    private String deliveryDate;
    private String status;
    private String createdDate;
}
