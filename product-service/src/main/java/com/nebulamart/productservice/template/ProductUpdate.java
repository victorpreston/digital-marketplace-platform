package com.nebulamart.productservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

import static com.nebulamart.productservice.entity.Constants.productCategoryList;

@Data
@AllArgsConstructor
public class ProductUpdate {
    private String name;
    private String description;
    private String brand;
    private List<String> imageUrls;
    private String category;

    private int stock;
    private float basePrice;
    private float discount;

    public boolean isValid() {
        return name != null || description != null || brand != null || imageUrls != null || (category != null && productCategoryList.contains(category)) || stock >= 0 || basePrice > 0 || (discount >= 0 && discount <= 100);
    }

}
