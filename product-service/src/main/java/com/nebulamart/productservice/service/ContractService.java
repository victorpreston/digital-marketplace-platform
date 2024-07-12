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
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import java.util.*;
import static software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional.keyEqualTo;

@Service
public class ContractService {
    private final DynamoDbTable<Product> productTable;
    private final DynamoDbTable<Contract> contractTable;
    private final DynamoDbIndex<Contract> contractTableCourierIndex;
    private final DynamoDbIndex<Contract> contractTableSellerIndex;
    private final AuthFacade authFacade;
    private final RestTemplate restTemplate;

    @Autowired
    public ContractService(DynamoDbTable<Product> productTable, DynamoDbTable<Contract> contractTable, DynamoDbIndex<Contract> contractTableCourierIndex, DynamoDbIndex<Contract> contractTableSellerIndex, AuthFacade authFacade, RestTemplate restTemplate) {
        this.productTable = productTable;
        this.contractTable = contractTable;
        this.contractTableCourierIndex = contractTableCourierIndex;
        this.contractTableSellerIndex = contractTableSellerIndex;
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
            Courier courier = restTemplate.getForObject("http://USER-SERVICE/api/couriers/" + courierChange.getCourierId(), Courier.class);
            if (courier == null) {
                return ResponseEntity.status(400).body(new CourierChangeResponse(null, "Courier not found"));
            }
            Contract contract = new Contract(UUID.randomUUID().toString(), product.getId(), sellerId, courier.getId(), 0, "COURIER_ACCEPTANCE_PENDING");
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
            String contractId = product.getContractId();
            product.setContractId(null);
            product.setStatus("COURIER_UNASSIGNED");
            contractTable.deleteItem(r -> r.key(Key.builder().partitionValue(contractId).build()));
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
            Courier courier = restTemplate.getForObject("http://USER-SERVICE/api/couriers/" + courierChange.getCourierId(), Courier.class);
            if (courier == null) {
                return ResponseEntity.status(400).body(new CourierChangeResponse(null, "Courier not found"));
            }
            Contract newContract = new Contract(UUID.randomUUID().toString(), product.getId(), sellerId, courier.getId(), 0, "COURIER_ACCEPTANCE_PENDING");
            product.setCourierId(courier.getId());
            String oldContractId = product.getContractId();
            product.setContractId(newContract.getId());
            product.setStatus("COURIER_UNASSIGNED");
            contractTable.deleteItem(r -> r.key(Key.builder().partitionValue(oldContractId).build()));
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
            if (!product.getStatus().equals("COURIER_UNASSIGNED") || !contract.getStatus().equals("COURIER_ACCEPTANCE_PENDING")) {
                return ResponseEntity.status(400).body(new CourierRespondResponse(null, "Product is not in acceptance pending state"));
            }
            contract.setDeliveryCharge(deliveryCharge);
            contract.setStatus("ACTIVE");
            product.setStatus("ACTIVE");
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
            if (!product.getStatus().equals("COURIER_UNASSIGNED") || !contract.getStatus().equals("COURIER_ACCEPTANCE_PENDING")) {
                return ResponseEntity.status(400).body(new CourierRespondResponse(null, "Product is not in acceptance pending state"));
            }
            contract.setStatus("COURIER_REJECTED");
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
            if (!product.getStatus().equals("ACTIVE") || !contract.getStatus().equals("ACTIVE")) {
                return ResponseEntity.status(400).body(null);
            }
            contract.setStatus("COURIER_CANCELLED");
            product.setStatus("COURIER_UNASSIGNED");
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
                product.setStatus("COURIER_UNASSIGNED");
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

    public ResponseEntity<List<Contract>> getContracts(String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String userRole = authFacade.getRole(wrappedUser);
            if (userRole.equals("SELLER")) {
                String sellerId = authFacade.getCognitoUsername(wrappedUser);
                PageIterable<Contract> contractsOfSeller = (PageIterable<Contract>) contractTableSellerIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(sellerId))));
                List<Contract> contracts = new ArrayList<>();
                for (Contract contract : contractsOfSeller.items()) {
                    contracts.add(contract);
                }
                return ResponseEntity.ok(contracts);
            } else if (userRole.equals("COURIER")) {
                String courierId = authFacade.getCognitoUsername(wrappedUser);
                PageIterable<Contract> contractsOfCourier = (PageIterable<Contract>) contractTableCourierIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(courierId))));
                List<Contract> contracts = new ArrayList<>();
                for (Contract contract : contractsOfCourier.items()) {
                    contracts.add(contract);
                }
                return ResponseEntity.ok(contracts);
            } else {
                return ResponseEntity.status(403).body(null);
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }

    }

    private PopulatedContract getPopulatedContract(Contract contract) {
        Product product = productTable.getItem(r -> r.key(Key.builder().partitionValue(contract.getProductId()).build()));
        Courier courier = restTemplate.getForObject("http://USER-SERVICE/api/couriers/" + contract.getCourierId(), Courier.class);
        Seller seller = restTemplate.getForObject("http://USER-SERVICE/api/sellers/" + contract.getSellerId(), Seller.class);
        return new PopulatedContract(contract.getId(), product, seller, courier, contract.getDeliveryCharge(), contract.getStatus());
    }

    public ResponseEntity<PopulatedContract> getContract(String contractId, String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String userRole = authFacade.getRole(wrappedUser);
            if (userRole.equals("SELLER")) {
                String sellerId = authFacade.getCognitoUsername(wrappedUser);
                Contract contract = contractTable.getItem(r -> r.key(Key.builder().partitionValue(contractId.toString()).build()));
                if (contract == null) {
                    return ResponseEntity.status(404).body(null);
                }
                if (!contract.getSellerId().equals(sellerId)) {
                    return ResponseEntity.status(403).body(null);
                }
                return ResponseEntity.ok(getPopulatedContract(contract));
            } else if (userRole.equals("COURIER")) {
                String courierId = authFacade.getCognitoUsername(wrappedUser);
                Contract contract = contractTable.getItem(r -> r.key(Key.builder().partitionValue(contractId.toString()).build()));
                if (contract == null) {
                    return ResponseEntity.status(404).body(null);
                }
                if (!contract.getCourierId().equals(courierId)) {
                    return ResponseEntity.status(403).body(null);
                }
                return ResponseEntity.ok(getPopulatedContract(contract));
            } else {
                return ResponseEntity.status(403).body(null);
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

}
