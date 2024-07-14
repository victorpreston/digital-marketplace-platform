package com.nebulamart.productservice.controller;

import com.nebulamart.productservice.service.ProductService;
import com.nebulamart.productservice.template.*;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nebulamart.productservice.service.ImageUploadService;
import com.nebulamart.productservice.template.GetUrlResponseDTO;
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
    public ResponseEntity<GetUrlResponseDTO> getPreSignedUrl(@PathParam("extension") String extension) {
        if (extension == null || extension.isEmpty()) {
            return ResponseEntity.status(400).body(new GetUrlResponseDTO(null, "Missing or invalid extension"));
        } else if (!extension.equals("jpg") && !extension.equals("jpeg") && !extension.equals("png")) {
            return ResponseEntity.status(400).body(new GetUrlResponseDTO(null, "Invalid extension"));
        }
        String preSignedUrl = imageUploadService.getPreSignedUrl("products" + "/" + UUID.randomUUID().toString() + "." + extension);
        if (preSignedUrl == null) {
            return ResponseEntity.status(400).body(new GetUrlResponseDTO(null, "Failed to get pre-signed URL"));
        }
        return ResponseEntity.ok(new GetUrlResponseDTO(preSignedUrl, "Pre-signed URL generated successfully"));
    }

    @PostMapping("/create")
    public ResponseEntity<ProductCreateResponseDTO> createProduct(@RequestHeader("Authorization") String accessToken, @RequestBody ProductCreateDTO productCreateDTO) {
        if (!productCreateDTO.isValid()) {
            return ResponseEntity.status(400).body(new ProductCreateResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<ProductCreateResponseDTO> responseEntity = productService.createProduct(accessToken, productCreateDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new ProductCreateResponseDTO(null, "Product creation failed"));
        }
        return responseEntity;
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductCreateResponseDTO> updateProduct(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id, @RequestBody ProductUpdateDTO productUpdateDTO) {
        if (!productUpdateDTO.isValid()) {
            return ResponseEntity.status(400).body(null);
        }
        ResponseEntity<ProductCreateResponseDTO> responseEntity = productService.updateProduct(accessToken, id, productUpdateDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProductDeleteResponseDTO> deleteProduct(@RequestHeader("Authorization") String accessToken, @PathVariable("id") String id) {
        ResponseEntity<ProductDeleteResponseDTO> responseEntity = productService.deleteProduct(accessToken, id);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractPopulatedProductDTO> getProduct(@PathVariable("id") String id, @RequestHeader("Authorization") String accessToken) {
        ResponseEntity<ContractPopulatedProductDTO> responseEntity = productService.getProductAsSeller(id, accessToken);
        if (responseEntity == null) {
            return ResponseEntity.status(404).body(null);
        }
        return responseEntity;
    }

}
