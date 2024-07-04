package com.nebulamart.productservice.service;

import com.nebulamart.productservice.entity.Contract;
import com.nebulamart.productservice.entity.Product;
import com.nebulamart.productservice.entity.Seller;
import com.nebulamart.productservice.template.*;
import com.nebulamart.productservice.util.AuthFacade;
import com.nebulamart.productservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import java.util.UUID;
import org.springframework.web.client.RestTemplate;
import static com.nebulamart.productservice.entity.Constants.productStatusList;

@Service
public class ProductService {
    private final DynamoDbTable<Product> productTable;
    private final DynamoDbTable<Contract> contractTable;
    private final AuthFacade authFacade;

    @Autowired
    public ProductService(AuthFacade authFacade, DynamoDbTable<Product> productTable, DynamoDbTable<Contract> contractTable) {
        this.productTable = productTable;
        this.contractTable = contractTable;
        this.authFacade = authFacade;
    }

    public ResponseEntity<ProductCreateResponse> createProduct(String accessToken, ProductCreate productCreate) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = new Product(UUID.randomUUID().toString(), productCreate.getName(), productCreate.getDescription(), productCreate.getBrand(), productCreate.getImageUrls(), productCreate.getCategory(), productCreate.getStock(), productCreate.getBasePrice(), productCreate.getDiscount(), 0, 0, sellerId, null, null, productStatusList.get(0));
            productTable.putItem(product);
            return ResponseEntity.status(201).body(new ProductCreateResponse(product, "Product created successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new ProductCreateResponse(null, e.getMessage()));
        }
    }

    public ResponseEntity<ProductCreateResponse> updateProduct(String accessToken, String id, ProductUpdate productUpdate) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(id).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(new ProductCreateResponse(null, "Product not found"));
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new ProductCreateResponse(null, "Unauthorized"));
            }
            if (productUpdate.getName() != null) {
                product.setName(productUpdate.getName());
            }
            if (productUpdate.getDescription() != null) {
                product.setDescription(productUpdate.getDescription());
            }
            if (productUpdate.getBrand() != null) {
                product.setBrand(productUpdate.getBrand());
            }
            if (productUpdate.getImageUrls() != null) {
                product.setImageUrls(productUpdate.getImageUrls());
            }
            if (productUpdate.getCategory() != null) {
                product.setCategory(productUpdate.getCategory());
            }
            if (productUpdate.getStock() >= 0) {
                product.setStock(productUpdate.getStock());
            }
            if (productUpdate.getBasePrice() > 0) {
                product.setBasePrice(productUpdate.getBasePrice());
            }
            if (productUpdate.getDiscount() >= 0) {
                product.setDiscount(productUpdate.getDiscount());
            }
            productTable.updateItem(product);
            return ResponseEntity.ok(new ProductCreateResponse(product, "Product updated successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new ProductCreateResponse(null, e.getMessage()));
        }
    }

    public ResponseEntity<ProductDeleteResponse> deleteProduct(String accessToken, String id) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Key productKey = Key.builder().partitionValue(id).build();
            Product product = productTable.getItem(r -> r.key(productKey));
            if (product == null) {
                return ResponseEntity.status(404).body(new ProductDeleteResponse(false, "Product not found"));
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new ProductDeleteResponse(false, "Unauthorized"));
            }
            if (product.getContractId() != null) {
                contractTable.deleteItem(r -> r.key(Key.builder().partitionValue(product.getContractId()).build()));
            }
            productTable.deleteItem(r -> r.key(productKey));
            return ResponseEntity.status(204).body(new ProductDeleteResponse(true, "Product deleted successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new ProductDeleteResponse(false, e.getMessage()));
        }
    }

    public Product getProduct(String id) {
        try {
            return productTable.getItem(r -> r.key(Key.builder().partitionValue(id).build()));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }


}
