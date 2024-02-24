package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.entity.Product;
import com.nebulamart.productservice.repository.ProductRepository;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable("id") String id) {
        return productRepository.getProductById(id);
    }

    @PostMapping("")
    public Product createProduct(@RequestBody Product product) {
        return productRepository.createProduct(product);
    }

    @GetMapping("")
    public Iterable<Product> searchProducts(@PathParam("name") String name) {
        return productRepository.searchProducts(name);
    }

//    @DeleteMapping("/product/{id}")
//    public void deleteProduct(@PathVariable("id") String id) {
//        productRepository.deleteProduct(id);
//    }
//
//    @PutMapping("/product/{id}")
//    public Product updateProduct(@PathVariable("id") String id, @RequestBody Product product) {
//        return productRepository.updateProduct(id, product);
//    }
}
