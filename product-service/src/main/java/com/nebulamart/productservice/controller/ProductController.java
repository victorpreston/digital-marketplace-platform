package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.entity.Product;
import com.nebulamart.productservice.service.ProductService;
import com.nebulamart.productservice.template.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/product")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/create")
    public ResponseEntity<ProductCreateResponse> createProduct(@RequestHeader("Authorization") String accessToken, @RequestBody ProductCreate productCreate) {
        if (!productCreate.isValid()) {
            return ResponseEntity.status(400).body(new ProductCreateResponse(null, "Missing required fields"));
        }
        ResponseEntity<ProductCreateResponse> responseEntity = productService.createProduct(accessToken, productCreate);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new ProductCreateResponse(null, "Product creation failed"));
        }
        return responseEntity;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable("id") String id) {
        Product product = productService.getProduct(id);
        if (product == null) {
            return ResponseEntity.status(404).body(null);
        }
        return ResponseEntity.ok(product);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductCreateResponse> updateProduct(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id, @RequestBody ProductUpdate productUpdate) {
        if (!productUpdate.isValid()) {
            return ResponseEntity.status(400).body(null);
        }
        ResponseEntity<ProductCreateResponse> responseEntity = productService.updateProduct(accessToken, id, productUpdate);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProductDeleteResponse> deleteProduct(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id) {
        ResponseEntity<ProductDeleteResponse> responseEntity = productService.deleteProduct(accessToken, id);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

}
