package com.nebulamart.productservice.service;

import com.nebulamart.productservice.entity.Contract;
import com.nebulamart.productservice.entity.Courier;
import com.nebulamart.productservice.entity.Product;
import com.nebulamart.productservice.entity.Seller;
import com.nebulamart.productservice.template.*;
import com.nebulamart.productservice.util.AuthFacade;
import com.nebulamart.productservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class ProductService {
    private final DynamoDbTable<Product> productTable;
    private final DynamoDbTable<Contract> contractTable;
    private final AuthFacade authFacade;
    private final RestTemplate restTemplate;
    private final int productsPerPage = 3; // Number of products to be displayed per page

    @Autowired
    public ProductService(AuthFacade authFacade, DynamoDbTable<Product> productTable, DynamoDbTable<Contract> contractTable, RestTemplate restTemplate) {
        this.productTable = productTable;
        this.contractTable = contractTable;
        this.authFacade = authFacade;
        this.restTemplate = restTemplate;
    }

    private int getProductsCount() {
        return (int) productTable.scan().items().stream().count();
    }

    private PopulatedProduct populateProduct(Product product) {
        try {
            Courier courier = restTemplate.getForObject("http://USER-SERVICE/api/couriers/" + product.getCourierId(), Courier.class);
            Seller seller = restTemplate.getForObject("http://USER-SERVICE/api/sellers/" + product.getSellerId(), Seller.class);
            Contract contract = contractTable.getItem(r -> r.key(Key.builder().partitionValue(product.getContractId()).build()));
            return new PopulatedProduct(product.getId(), product.getName(), product.getDescription(), product.getBrand(), product.getImageUrls(), product.getCategory(), product.getStock(), product.getBasePrice(), product.getDiscount(), product.getRating(), product.getRatingCount(), seller, courier, contract.getDeliveryCharge(), product.getStatus(), product.getCreatedDate(), product.getLastUpdatedDate());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    private FullyPopulatedProduct fullyPopulateProduct(Product product) {
        try {
            Courier courier = restTemplate.getForObject("http://USER-SERVICE/api/couriers/" + product.getCourierId(), Courier.class);
            Seller seller = restTemplate.getForObject("http://USER-SERVICE/api/sellers/" + product.getSellerId(), Seller.class);
            Contract contract = contractTable.getItem(r -> r.key(Key.builder().partitionValue(product.getContractId()).build()));
            return new FullyPopulatedProduct(product.getId(), product.getName(), product.getDescription(), product.getBrand(), product.getImageUrls(), product.getCategory(), product.getStock(), product.getBasePrice(), product.getDiscount(), product.getRating(), product.getRatingCount(), seller, courier, contract, product.getStatus(), product.getCreatedDate(), product.getLastUpdatedDate());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public ResponseEntity<ProductCreateResponse> createProduct(String accessToken, ProductCreate productCreate) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            String createdAt = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            int searchIndex = getProductsCount() + 1;
            Product product = new Product(UUID.randomUUID().toString(), productCreate.getName(), productCreate.getDescription(), productCreate.getBrand(), productCreate.getImageUrls(), productCreate.getCategory(), productCreate.getStock(), productCreate.getBasePrice(), productCreate.getDiscount(), 0, 0, sellerId, null, null, "COURIER_UNASSIGNED", createdAt, createdAt, searchIndex);
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
            product.setLastUpdatedDate(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
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

    public ResponseEntity<List<Product>> searchProducts(HashMap<String, Object> searchParams, Integer page) {
        try {
            List<Product> products = productTable.scan().items().stream().filter(product -> {
                boolean match = true;
                if (!product.getStatus().equals("ACTIVE")) { return false; }
                for (Map.Entry<String, Object> entry : searchParams.entrySet()) {
                    String key = entry.getKey();
                    Object value = entry.getValue();
                    if (key.equals("category")) {
                        match = match && product.getCategory().equals(value);
                    } else if (key.equals("text")) {
                        match = match && (product.getName().contains((String) value) || product.getDescription().contains((String) value));
                    } else if (key.equals("minPrice")) {
                        match = match && product.getBasePrice() >= (Double) value;
                    } else if (key.equals("maxPrice")) {
                        match = match && product.getBasePrice() <= (Double) value;
                    }
                }
                return match;
            }).skip((page - 1) * productsPerPage).limit(productsPerPage).toList();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<List<Product>> getProducts(Integer page) {
        try {
            List<Product> products = productTable.scan().items().stream().filter(product ->
                product.getStatus().equals("ACTIVE")).skip((page - 1) * productsPerPage).limit(productsPerPage).toList();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<PopulatedProduct> getProduct(String id) {
        try {
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(id).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(null);
            }
            if (product.getStatus().equals("INACTIVE")) {
                return ResponseEntity.status(404).body(null);
            }
            return ResponseEntity.ok(populateProduct(product));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<FullyPopulatedProduct> getProductAsAdmin(String id, String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(id).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(null);
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(null);
            }
            return ResponseEntity.ok(fullyPopulateProduct(product));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<Product> getRawProduct(String id) {
        try {
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(id).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(null);
            }
            if (product.getStatus().equals("INACTIVE")) {
                return ResponseEntity.status(404).body(null);
            }
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

}
