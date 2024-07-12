package com.nebulamart.productservice.template;

import com.nebulamart.productservice.entity.Courier;
import com.nebulamart.productservice.entity.Product;
import com.nebulamart.productservice.entity.Seller;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PopulatedContractDTO {
    private String id;
    private Product product;
    private Seller seller;
    private Courier courier;
    private float deliveryCharge;
    private String status;
}
