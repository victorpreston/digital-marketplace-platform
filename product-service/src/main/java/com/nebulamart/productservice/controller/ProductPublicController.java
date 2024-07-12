package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.entity.Product;
import com.nebulamart.productservice.service.ProductService;
import com.nebulamart.productservice.template.*;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductPublicController {
    private final ProductService productService;

    @Autowired
    public ProductPublicController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("search")
    public ResponseEntity<List<Product>> getProducts(@PathParam("page") Integer page, @PathParam("category") String category, @PathParam("text") String text, @PathParam("minPrice") Double minPrice, @PathParam("maxPrice") Double maxPrice) {
        HashMap<String, Object> filters = new HashMap<>();
        if (category != null) { filters.put("category", category); }
        if (text != null) { filters.put("text", text); }
        if (minPrice != null) { filters.put("minPrice", minPrice); }
        if (maxPrice != null) { filters.put("maxPrice", maxPrice); }
        ResponseEntity<List<Product>> responseEntity = productService.searchProducts(filters, page == null ? 1 : page);
        if (responseEntity.getBody() == null) {
            return ResponseEntity.status(404).body(null);
        }
        return responseEntity;
    }

    @GetMapping("")
    public ResponseEntity<List<Product>> getProducts(@PathParam("page") Integer page) {
        ResponseEntity<List<Product>> responseEntity = productService.getProducts(page == null ? 1 : page);
        if (responseEntity.getBody() == null) {
            return ResponseEntity.status(404).body(null);
        }
        return responseEntity;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PopulatedProduct> getProduct(@PathVariable("id") String id) {
        ResponseEntity<PopulatedProduct> responseEntity = productService.getProduct(id);
        if (responseEntity.getBody() == null) {
            return ResponseEntity.status(404).body(null);
        }
        return responseEntity;
    }

    @GetMapping("/{id}/unmodified")
    public ResponseEntity<Product> getUnmodifiedProduct(@PathVariable("id") String id) {
        ResponseEntity<Product> responseEntity = productService.getRawProduct(id);
        if (responseEntity.getBody() == null) {
            return ResponseEntity.status(404).body(null);
        }
        return responseEntity;
    }

}
