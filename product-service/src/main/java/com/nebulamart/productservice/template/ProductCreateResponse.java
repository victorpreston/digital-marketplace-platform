package com.nebulamart.productservice.template;

import com.nebulamart.productservice.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductCreateResponse {
    private Product product;
    private String message;

    public ProductCreateResponse(Product product) {
        this.product = product;
        this.message = "Product created successfully";
    }
}
