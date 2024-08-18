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
import java.util.*;

@Service
public class ContractService {

    private final ProductRepository productRepository;
    private final ContractRepository contractRepository;
    private final AuthFacade authFacade;
    private final RestTemplate restTemplate;

    @Value("${microservices.user-service-endpoint}")
    private String userService;

    @Autowired
    public ContractService(ProductRepository productRepository, ContractRepository contractRepository, AuthFacade authFacade, RestTemplate restTemplate) {
        this.productRepository = productRepository;
        this.contractRepository = contractRepository;
        this.authFacade = authFacade;
        this.restTemplate = restTemplate;
    }

    public ResponseEntity<CourierChangeResponseDTO> addCourier(String accessToken, CourierChangeDTO courierChangeDTO) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = productRepository.getProductById(courierChangeDTO.getProductId());
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierChangeResponseDTO(null, "Product not found"));
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new CourierChangeResponseDTO(null, "Unauthorized"));
            }
            Courier courier = restTemplate.getForObject(userService + "/api/couriers/" + courierChangeDTO.getCourierId(), Courier.class);
            if (courier == null) {
                return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, "Courier not found"));
            }
            Contract contract = new Contract(UUID.randomUUID().toString(), product.getId(), sellerId, courier.getId(), 0, "COURIER_ACCEPTANCE_PENDING");
            contractRepository.saveContract(contract);
            product.setCourierId(courier.getId());
            product.setContractId(contract.getId());
            productRepository.updateProduct(product);
            return ResponseEntity.ok(new CourierChangeResponseDTO(product, "Courier added successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierChangeResponseDTO> removeCourier(String accessToken, String productId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = productRepository.getProductById(productId);
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierChangeResponseDTO(null, "Product not found"));
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new CourierChangeResponseDTO(null, "Unauthorized"));
            }
            if (product.getContractId() == null) {
                return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, "No contract found"));
            }
            product.setCourierId(null);
            String contractId = product.getContractId();
            product.setContractId(null);
            product.setStatus("COURIER_UNASSIGNED");
            contractRepository.deleteContract(contractId);
            productRepository.updateProduct(product);
            return ResponseEntity.status(204).body(new CourierChangeResponseDTO(product, "Courier removed successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierChangeResponseDTO> changeCourier(String accessToken, CourierChangeDTO courierChangeDTO) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Product product = productRepository.getProductById(courierChangeDTO.getProductId());
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierChangeResponseDTO(null, "Product not found"));
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new CourierChangeResponseDTO(null, "Unauthorized"));
            }
            if (product.getContractId() == null) {
                return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, "No contract found"));
            }
            Courier courier = restTemplate.getForObject(userService + "/api/couriers/" + courierChangeDTO.getCourierId(), Courier.class);
            if (courier == null) {
                return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, "Courier not found"));
            }
            Contract newContract = new Contract(UUID.randomUUID().toString(), product.getId(), sellerId, courier.getId(), 0, "COURIER_ACCEPTANCE_PENDING");
            product.setCourierId(courier.getId());
            String oldContractId = product.getContractId();
            product.setContractId(newContract.getId());
            product.setStatus("COURIER_UNASSIGNED");
            contractRepository.deleteContract(oldContractId);
            contractRepository.saveContract(newContract);
            productRepository.updateProduct(product);
            return ResponseEntity.ok(new CourierChangeResponseDTO(product, "Courier changed successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierRespondResponseDTO> acceptContract(String accessToken, String contractId, float deliveryCharge) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String courierId = authFacade.getCognitoUsername(wrappedUser);
            Contract contract = contractRepository.getContractById(contractId);
            if (contract == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponseDTO(null, "Contract not found"));
            }
            if (!contract.getCourierId().equals(courierId)) {
                return ResponseEntity.status(403).body(new CourierRespondResponseDTO(null, "Unauthorized"));
            }
            Product product = productRepository.getProductById(contract.getProductId());
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponseDTO(null, "Product not found"));
            }
            if (!product.getStatus().equals("COURIER_UNASSIGNED") || !contract.getStatus().equals("COURIER_ACCEPTANCE_PENDING")) {
                return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, "Product is not in acceptance pending state"));
            }
            contract.setDeliveryCharge(deliveryCharge);
            contract.setStatus("ACTIVE");
            product.setStatus("ACTIVE");
            contractRepository.updateContract(contract);
            productRepository.updateProduct(product);
            return ResponseEntity.ok(new CourierRespondResponseDTO(contract, "Contract accepted successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierRespondResponseDTO> rejectContract(String accessToken, String contractId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String courierId = authFacade.getCognitoUsername(wrappedUser);
            Contract contract = contractRepository.getContractById(contractId);
            if (contract == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponseDTO(null, "Contract not found"));
            }
            if (!contract.getCourierId().equals(courierId)) {
                return ResponseEntity.status(403).body(new CourierRespondResponseDTO(null, "Unauthorized"));
            }
            Product product = productRepository.getProductById(contract.getProductId());
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponseDTO(null, "Product not found"));
            }
            if (!product.getStatus().equals("COURIER_UNASSIGNED") || !contract.getStatus().equals("COURIER_ACCEPTANCE_PENDING")) {
                return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, "Product is not in acceptance pending state"));
            }
            contract.setStatus("COURIER_REJECTED");
            contractRepository.updateContract(contract);
            return ResponseEntity.ok(new CourierRespondResponseDTO(contract, "Contract rejected successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierRespondResponseDTO> cancelContract(String accessToken, String contractId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String courierId = authFacade.getCognitoUsername(wrappedUser);
            Contract contract = contractRepository.getContractById(contractId);
            if (contract == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponseDTO(null, "Contract not found"));
            }
            if (!contract.getCourierId().equals(courierId)) {
                return ResponseEntity.status(403).body(new CourierRespondResponseDTO(null, "Unauthorized"));
            }
            Product product = productRepository.getProductById(contract.getProductId());
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponseDTO(null, "Product not found"));
            }
            if (!product.getStatus().equals("ACTIVE") || !contract.getStatus().equals("ACTIVE")) {
                return ResponseEntity.status(400).body(null);
            }
            contract.setStatus("COURIER_CANCELLED");
            product.setStatus("COURIER_UNASSIGNED");
            contractRepository.updateContract(contract);
            productRepository.updateProduct(product);
            return ResponseEntity.ok(new CourierRespondResponseDTO(contract, "Contract cancelled successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierChangeResponseDTO> removeContract(String accessToken, String contractId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = authFacade.getCognitoUsername(wrappedUser);
            Contract contract = contractRepository.getContractById(contractId);
            if (contract == null) {
                return ResponseEntity.status(404).body(new CourierChangeResponseDTO(null, "Contract not found"));
            }
            if (!contract.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(new CourierChangeResponseDTO(null, "Unauthorized"));
            }
            Product product = productRepository.getProductById(contract.getProductId());
            if (product == null) {
                return ResponseEntity.status(404).body(new CourierChangeResponseDTO(null, "Product not found"));
            }
            if (product.getContractId() != null && product.getContractId().equals(contractId)) {
                product.setCourierId(null);
                product.setContractId(null);
                product.setStatus("COURIER_UNASSIGNED");
                productRepository.updateProduct(product);
            }
            contractRepository.deleteContract(contractId);
            return ResponseEntity.status(204).body(new CourierChangeResponseDTO(product, "Contract removed successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierChangeResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<CourierRespondResponseDTO> updateDeliveryCharge(String accessToken, String contractId, float deliveryCharge) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String courierId = authFacade.getCognitoUsername(wrappedUser);
            Contract contract = contractRepository.getContractById(contractId);
            if (contract == null) {
                return ResponseEntity.status(404).body(new CourierRespondResponseDTO(null, "Contract not found"));
            }
            if (!contract.getCourierId().equals(courierId)) {
                return ResponseEntity.status(403).body(new CourierRespondResponseDTO(null, "Unauthorized"));
            }
            contract.setDeliveryCharge(deliveryCharge);
            contractRepository.updateContract(contract);
            return ResponseEntity.ok(new CourierRespondResponseDTO(contract, "Delivery charge updated successfully"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new CourierRespondResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<List<Contract>> getContracts(String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String userRole = authFacade.getRole(wrappedUser);
            if (userRole.equals("SELLER")) {
                String sellerId = authFacade.getCognitoUsername(wrappedUser);
                List<Contract> contracts = contractRepository.getContractsBySellerId(sellerId);
                return ResponseEntity.ok(contracts);
            } else if (userRole.equals("COURIER")) {
                String courierId = authFacade.getCognitoUsername(wrappedUser);
                List<Contract> contracts = contractRepository.getContractsByCourierId(courierId);
                return ResponseEntity.ok(contracts);
            } else {
                return ResponseEntity.status(403).body(null);
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }

    }

    private PopulatedContractDTO getPopulatedContract(Contract contract) {
        Product product = productRepository.getProductById(contract.getProductId());
        Courier courier = restTemplate.getForObject(userService + "/api/couriers/" + contract.getCourierId(), Courier.class);
        Seller seller = restTemplate.getForObject(userService + "/api/sellers/" + contract.getSellerId(), Seller.class);
        return new PopulatedContractDTO(contract.getId(), product, seller, courier, contract.getDeliveryCharge(), contract.getStatus());
    }

    public ResponseEntity<PopulatedContractDTO> getContract(String contractId, String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String userRole = authFacade.getRole(wrappedUser);
            if (userRole.equals("SELLER")) {
                String sellerId = authFacade.getCognitoUsername(wrappedUser);
                Contract contract = contractRepository.getContractById(contractId);
                if (contract == null) {
                    return ResponseEntity.status(404).body(null);
                }
                if (!contract.getSellerId().equals(sellerId)) {
                    return ResponseEntity.status(403).body(null);
                }
                return ResponseEntity.ok(getPopulatedContract(contract));
            } else if (userRole.equals("COURIER")) {
                String courierId = authFacade.getCognitoUsername(wrappedUser);
                Contract contract = contractRepository.getContractById(contractId);
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
