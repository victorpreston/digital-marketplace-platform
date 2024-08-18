package com.nebulamart.productservice.service;

import com.nebulamart.productservice.Repository.ContractRepository;
import com.nebulamart.productservice.Repository.ProductRepository;
import com.nebulamart.productservice.entity.Contract;
import com.nebulamart.productservice.entity.Courier;
import com.nebulamart.productservice.entity.Product;
import com.nebulamart.productservice.entity.Seller;
import com.nebulamart.productservice.template.*;
import com.nebulamart.productservice.util.AuthFacade;
import com.nebulamart.productservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class ProductService {
    private final AuthFacade authFacade;
    private final RestTemplate restTemplate;
    private final ProductRepository productRepository;
    private final ContractRepository contractRepository;
    private final int productsPerPage = 3; // Number of products to be displayed per page

    @Value("${microservices.user-service-endpoint}")
    private String userService;

    @Autowired
    public ProductService(AuthFacade authFacade, RestTemplate restTemplate, ProductRepository productRepository, ContractRepository contractRepository) {
        this.authFacade = authFacade;
        this.restTemplate = restTemplate;
        this.productRepository = productRepository;
        this.contractRepository = contractRepository;
    }

    private int getProductsCount() {
        return productRepository.getProductsCount();
    }

    private PopulatedProductDTO populateProduct(Product product) {
        Courier courier = restTemplate.getForObject(userService + "/api/couriers/" + product.getCourierId(), Courier.class);
        Seller seller = restTemplate.getForObject(userService + "/api/sellers/" + product.getSellerId(), Seller.class);
        Contract contract = contractRepository.getContractById(product.getContractId());
        return new PopulatedProductDTO(product.getId(), product.getName(), product.getDescription(), product.getBrand(), product.getImageUrls(), product.getCategory(), product.getStock(), product.getBasePrice(), product.getDiscount(), product.getRating(), product.getRatingCount(), seller, courier, contract.getDeliveryCharge(), product.getStatus(), product.getCreatedDate(), product.getLastUpdatedDate());
    }

    private ContractPopulatedProductDTO ContractPopulatedProduct(Product product) {
        if (product.getContractId() == null) {
            return new ContractPopulatedProductDTO(product.getId(), product.getName(), product.getDescription(), product.getBrand(), product.getImageUrls(), product.getCategory(), product.getStock(), product.getBasePrice(), product.getDiscount(), product.getRating(), product.getRatingCount(), null, null, product.getStatus(), product.getCreatedDate(), product.getLastUpdatedDate());
        }
        Courier courier = restTemplate.getForObject(userService + "/api/couriers/" + product.getCourierId(), Courier.class);
        Contract contract = contractRepository.getContractById(product.getContractId());
        return new ContractPopulatedProductDTO(product.getId(), product.getName(), product.getDescription(), product.getBrand(), product.getImageUrls(), product.getCategory(), product.getStock(), product.getBasePrice(), product.getDiscount(), product.getRating(), product.getRatingCount(), courier, contract, product.getStatus(), product.getCreatedDate(), product.getLastUpdatedDate());
    }

    public ResponseEntity<ProductCreateResponseDTO> createProduct(String accessToken, ProductCreateDTO productCreateDTO) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            String createdAt = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            int searchIndex = getProductsCount() + 1;
            Product product = new Product(UUID.randomUUID().toString(), productCreateDTO.getName(), productCreateDTO.getDescription(), productCreateDTO.getBrand(), productCreateDTO.getImageUrls(), productCreateDTO.getCategory(), productCreateDTO.getStock(), productCreateDTO.getBasePrice(), productCreateDTO.getDiscount(), 0, 0, sellerId, null, null, "COURIER_UNASSIGNED", createdAt, createdAt, searchIndex);
            productRepository.saveProduct(product);
            return ResponseEntity.status(201).body(new ProductCreateResponseDTO(product, "Product created successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new ProductCreateResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<ProductCreateResponseDTO> updateProduct(String accessToken, String id, ProductUpdateDTO productUpdateDTO) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = productRepository.getProductById(id);
            if (product == null) {
                return ResponseEntity.status(404).body(new ProductCreateResponseDTO(null, "Product not found"));
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new ProductCreateResponseDTO(null, "Unauthorized"));
            }
            if (productUpdateDTO.getName() != null) {
                product.setName(productUpdateDTO.getName());
            }
            if (productUpdateDTO.getDescription() != null) {
                product.setDescription(productUpdateDTO.getDescription());
            }
            if (productUpdateDTO.getBrand() != null) {
                product.setBrand(productUpdateDTO.getBrand());
            }
            if (productUpdateDTO.getImageUrls() != null) {
                product.setImageUrls(productUpdateDTO.getImageUrls());
            }
            if (productUpdateDTO.getCategory() != null) {
                product.setCategory(productUpdateDTO.getCategory());
            }
            if (productUpdateDTO.getStock() >= 0) {
                product.setStock(productUpdateDTO.getStock());
            }
            if (productUpdateDTO.getBasePrice() > 0) {
                product.setBasePrice(productUpdateDTO.getBasePrice());
            }
            if (productUpdateDTO.getDiscount() >= 0) {
                product.setDiscount(productUpdateDTO.getDiscount());
            }
            product.setLastUpdatedDate(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            productRepository.updateProduct(product);
            return ResponseEntity.ok(new ProductCreateResponseDTO(product, "Product updated successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new ProductCreateResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<ProductDeleteResponseDTO> deleteProduct(String accessToken, String id) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Key productKey = Key.builder().partitionValue(id).build();
            Product product = productRepository.getProductById(id);
            if (product == null) {
                return ResponseEntity.status(404).body(new ProductDeleteResponseDTO(false, "Product not found"));
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new ProductDeleteResponseDTO(false, "Unauthorized"));
            }
            if (product.getContractId() != null) {
                contractRepository.deleteContract(product.getContractId());
            }
            productRepository.deleteProduct(productKey);
            return ResponseEntity.status(204).body(new ProductDeleteResponseDTO(true, "Product deleted successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new ProductDeleteResponseDTO(false, e.getMessage()));
        }
    }

    public ResponseEntity<List<Product>> searchProducts(HashMap<String, Object> searchParams, Integer page) {
        try {
            List<Product> products = productRepository.searchProducts(searchParams, page, productsPerPage);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<List<Product>> getProducts(Integer page) {
        try {
            List<Product> products = productRepository.getProductsByPage(page, productsPerPage);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<PopulatedProductDTO> getProduct(String id) {
        try {
            Product product = productRepository.getProductById(id);
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

    public ResponseEntity<ContractPopulatedProductDTO> getProductAsSeller(String id, String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = productRepository.getProductById(id);
            if (product == null) {
                return ResponseEntity.status(404).body(null);
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(null);
            }
            return ResponseEntity.ok(ContractPopulatedProduct(product));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<Product> getRawProduct(String id) {
        try {
            Product product = productRepository.getProductById(id);
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
