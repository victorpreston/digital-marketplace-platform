package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.entity.Product;
import com.nebulamart.productservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/product")
    public Product createProduct(@RequestBody Product product) {
        return productRepository.saveProduct(product);
    }

    @GetMapping("/product/{id}")
    public Product getProductById(@PathVariable("id") String id) {
        return productRepository.getProductById(id);
    }

    @DeleteMapping("/product/{id}")
    public void deleteProduct(@PathVariable("id") String id) {
        productRepository.deleteProduct(id);
    }
}
