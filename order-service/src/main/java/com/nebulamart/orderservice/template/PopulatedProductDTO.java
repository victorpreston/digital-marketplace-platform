package com.nebulamart.orderservice.template;

import com.nebulamart.orderservice.entity.Courier;
import com.nebulamart.orderservice.entity.Seller;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PopulatedProductDTO {

    private String id;
    private String name;
    private String description;
    private String brand;
    private List<String> imageUrls;
    private String category;

    private int stock;
    private float basePrice;
    private float discount;
    private float rating;
    private int ratingCount;
    private Seller seller;
    private Courier courier;
    private float deliveryCharge;
    private String status;
    private String createdDate;
    private String lastUpdatedDate;

}
