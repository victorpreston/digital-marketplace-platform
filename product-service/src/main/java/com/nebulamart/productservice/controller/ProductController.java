package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.service.ProductService;
import com.nebulamart.productservice.template.*;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nebulamart.productservice.service.ImageUploadService;
import com.nebulamart.productservice.template.GetUrlResponse;
import java.util.UUID;

@RestController
@RequestMapping("/product")
public class ProductController {
    private final ImageUploadService imageUploadService;
    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService, ImageUploadService imageUploadService) {
        this.productService = productService;
        this.imageUploadService = imageUploadService;
    }

    @GetMapping("/upload-url")
    public ResponseEntity<GetUrlResponse> getPreSignedUrl(@PathParam("extension") String extension) {
        if (extension == null || extension.isEmpty()) {
            return ResponseEntity.status(400).body(new GetUrlResponse(null, "Missing or invalid extension"));
        }
        String preSignedUrl = imageUploadService.getPreSignedUrl("products" + "/" + UUID.randomUUID().toString() + "." + extension);
        if (preSignedUrl == null) {
            return ResponseEntity.status(400).body(new GetUrlResponse(null, "Failed to get pre-signed URL"));
        }
        return ResponseEntity.ok(new GetUrlResponse(preSignedUrl, "Pre-signed URL generated successfully"));
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

    @GetMapping("/{id}")
    public ResponseEntity<FullyPopulatedProduct> getProduct(@PathVariable("id") String id, @RequestHeader("Authorization") String accessToken) {
        ResponseEntity<FullyPopulatedProduct> responseEntity = productService.getProductAsAdmin(id, accessToken);
        if (responseEntity.getBody() == null) {
            return ResponseEntity.status(404).body(null);
        }
        return responseEntity;
    }

}
