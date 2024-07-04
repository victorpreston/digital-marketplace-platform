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
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import java.util.UUID;
import static com.nebulamart.productservice.entity.Constants.contractStatusList;
import static com.nebulamart.productservice.entity.Constants.productStatusList;

@Service
public class ContractService {
    private final DynamoDbTable<Product> productTable;
    private final DynamoDbTable<Contract> contractTable;
    private final AuthFacade authFacade;
    private final RestTemplate restTemplate;

    @Autowired
    public ContractService(DynamoDbTable<Product> productTable, DynamoDbTable<Contract> contractTable, AuthFacade authFacade, RestTemplate restTemplate) {
        this.productTable = productTable;
        this.contractTable = contractTable;
        this.authFacade = authFacade;
        this.restTemplate = restTemplate;
    }

    public ResponseEntity<CourierChangeResponse> addCourier(String accessToken, CourierChange courierChange) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(courierChange.getProductId()).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierChangeResponse(null, "Product not found"));
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new CourierChangeResponse(null, "Unauthorized"));
            }
            Courier courier = restTemplate.getForObject("http://USER-SERVICE/api/user-service/open/couriers/" + courierChange.getCourierId(), Courier.class);
            if (courier == null) {
                return ResponseEntity.status(400).body(new CourierChangeResponse(null, "Courier not found"));
            }
            Contract contract = new Contract(UUID.randomUUID().toString(), product.getId(), sellerId, courier.getId(), 0, contractStatusList.get(0));
            contractTable.putItem(contract);
            product.setCourierId(courier.getId());
            product.setContractId(contract.getId());
            productTable.updateItem(product);
            return ResponseEntity.ok(new CourierChangeResponse(product, "Courier added successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierChangeResponse(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierChangeResponse> removeCourier(String accessToken, String productId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(productId).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierChangeResponse(null, "Product not found"));
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new CourierChangeResponse(null, "Unauthorized"));
            }
            if (product.getContractId() == null) {
                return ResponseEntity.status(400).body(new CourierChangeResponse(null, "No contract found"));
            }
            product.setCourierId(null);
            product.setContractId(null);
            product.setStatus(productStatusList.get(0));
            contractTable.deleteItem(r -> r.key(Key.builder().partitionValue(product.getContractId()).build()));
            productTable.updateItem(product);
            return ResponseEntity.status(204).body(new CourierChangeResponse(product, "Courier removed successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierChangeResponse(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierChangeResponse> changeCourier(String accessToken, CourierChange courierChange) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(courierChange.getProductId()).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierChangeResponse(null, "Product not found"));
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new CourierChangeResponse(null, "Unauthorized"));
            }
            if (product.getContractId() == null) {
                return ResponseEntity.status(400).body(new CourierChangeResponse(null, "No contract found"));
            }
            Courier courier = restTemplate.getForObject("http://USER-SERVICE/api/user-service/open/couriers/" + courierChange.getCourierId(), Courier.class);
            if (courier == null) {
                return ResponseEntity.status(400).body(new CourierChangeResponse(null, "Courier not found"));
            }
            Contract newContract = new Contract(UUID.randomUUID().toString(), product.getId(), sellerId, courier.getId(), 0, contractStatusList.get(0));
            product.setCourierId(courier.getId());
            product.setContractId(newContract.getId());
            product.setStatus(productStatusList.get(0));
            contractTable.deleteItem(r -> r.key(Key.builder().partitionValue(product.getContractId()).build()));
            contractTable.putItem(newContract);
            productTable.updateItem(product);
            return ResponseEntity.ok(new CourierChangeResponse(product, "Courier changed successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierChangeResponse(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierRespondResponse> acceptContract(String accessToken, String contractId, float deliveryCharge) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String courierId = authFacade.getCognitoUsername(wrappedUser);
            Contract contract = contractTable.getItem(r -> r.key(Key.builder().partitionValue(contractId).build()));
            if (contract == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponse(null, "Contract not found"));
            }
            if (!contract.getCourierId().equals(courierId)) {
                return ResponseEntity.status(403).body(new CourierRespondResponse(null, "Unauthorized"));
            }
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(contract.getProductId()).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponse(null, "Product not found"));
            }
            if (!product.getStatus().equals(productStatusList.get(0)) || !contract.getStatus().equals(contractStatusList.get(0))) {
                return ResponseEntity.status(400).body(new CourierRespondResponse(null, "Product is not in acceptance pending state"));
            }
            contract.setDeliveryCharge(deliveryCharge);
            contract.setStatus(contractStatusList.get(2));
            product.setStatus(productStatusList.get(1));
            contractTable.updateItem(contract);
            productTable.updateItem(product);
            return ResponseEntity.ok(new CourierRespondResponse(contract, "Contract accepted successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierRespondResponse(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierRespondResponse> rejectContract(String accessToken, String contractId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String courierId = authFacade.getCognitoUsername(wrappedUser);
            Contract contract = contractTable.getItem(r -> r.key(Key.builder().partitionValue(contractId).build()));
            if (contract == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponse(null, "Contract not found"));
            }
            if (!contract.getCourierId().equals(courierId)) {
                return ResponseEntity.status(403).body(new CourierRespondResponse(null, "Unauthorized"));
            }
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(contract.getProductId()).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponse(null, "Product not found"));
            }
            if (!product.getStatus().equals(productStatusList.get(0)) || !contract.getStatus().equals(contractStatusList.get(0))) {
                return ResponseEntity.status(400).body(new CourierRespondResponse(null, "Product is not in acceptance pending state"));
            }
            contract.setStatus(contractStatusList.get(1));
            contractTable.updateItem(contract);
            return ResponseEntity.ok(new CourierRespondResponse(contract, "Contract rejected successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierRespondResponse(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierRespondResponse> cancelContract(String accessToken, String contractId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String courierId = authFacade.getCognitoUsername(wrappedUser);
            Contract contract = contractTable.getItem(r -> r.key(Key.builder().partitionValue(contractId).build()));
            if (contract == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponse(null, "Contract not found"));
            }
            if (!contract.getCourierId().equals(courierId)) {
                return ResponseEntity.status(403).body(new CourierRespondResponse(null, "Unauthorized"));
            }
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(contract.getProductId()).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponse(null, "Product not found"));
            }
            if (!product.getStatus().equals(productStatusList.get(1)) || !contract.getStatus().equals(contractStatusList.get(2))) {
                return ResponseEntity.status(400).body(null);
            }
            contract.setStatus(contractStatusList.get(3));
            product.setStatus(productStatusList.get(0));
            contractTable.updateItem(contract);
            productTable.updateItem(product);
            return ResponseEntity.ok(new CourierRespondResponse(contract, "Contract cancelled successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierRespondResponse(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierChangeResponse> removeContract(String accessToken, String contractId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Contract contract = contractTable.getItem(r -> r.key(Key.builder().partitionValue(contractId).build()));
            if (contract == null) {
                return ResponseEntity.status(404).body(new CourierChangeResponse(null, "Contract not found"));
            }
            if (!contract.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new CourierChangeResponse(null, "Unauthorized"));
            }
            Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(contract.getProductId()).build()));
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierChangeResponse(null, "Product not found"));
            }
            if (product.getContractId() != null && product.getContractId().equals(contractId)) {
                product.setCourierId(null);
                product.setContractId(null);
                product.setStatus(productStatusList.get(0));
                productTable.updateItem(product);
            }
            contractTable.deleteItem(r -> r.key(Key.builder().partitionValue(contractId).build()));
            return ResponseEntity.status(204).body(new CourierChangeResponse(product, "Contract removed successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierChangeResponse(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierRespondResponse> updateDeliveryCharge(String accessToken, String contractId, float deliveryCharge) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String courierId = authFacade.getCognitoUsername(wrappedUser);
            Contract contract = contractTable.getItem(r -> r.key(Key.builder().partitionValue(contractId).build()));
            if (contract == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponse(null, "Contract not found"));
            }
            if (!contract.getCourierId().equals(courierId)) {
                return ResponseEntity.status(403).body(new CourierRespondResponse(null, "Unauthorized"));
            }
            contract.setDeliveryCharge(deliveryCharge);
            contractTable.updateItem(contract);
            return ResponseEntity.ok(new CourierRespondResponse(contract, "Delivery charge updated successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierRespondResponse(null, e.getMessage()));
        }
    }

}
