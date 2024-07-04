package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.entity.Product;
import com.nebulamart.productservice.service.ProductService;
import com.nebulamart.productservice.template.ProductCreate;
import com.nebulamart.productservice.template.ProductCreateResponse;
import com.nebulamart.productservice.template.ProductDeleteResponse;
import com.nebulamart.productservice.template.ProductUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductPublicController {
    private final ProductService productService;

    @Autowired
    public ProductPublicController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable("id") String id) {
        Product product = productService.getProduct(id);
        if (product == null) {
            return ResponseEntity.status(404).body(null);
        }
        return ResponseEntity.ok(product);
    }

}
