package com.nebulamart.orderservice.service;

import com.nebulamart.orderservice.entity.*;
import com.nebulamart.orderservice.repository.CustomerRepository;
import com.nebulamart.orderservice.repository.OrderRepository;
import com.nebulamart.orderservice.repository.ProductRepository;
import com.nebulamart.orderservice.template.*;
import com.nebulamart.orderservice.util.AuthFacade;
import com.nebulamart.orderservice.util.PaymentValidater;
import com.nebulamart.orderservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final AuthFacade authFacade;
    private final RestTemplate restTemplate;
    private final PaymentValidater paymentValidater;

    @Autowired
    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, CustomerRepository customerRepository, AuthFacade authFacade, RestTemplate restTemplate, PaymentValidater paymentValidater) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.authFacade = authFacade;
        this.restTemplate = restTemplate;
        this.paymentValidater = paymentValidater;
    }

    private List<Order> createOrdersSet(OrdersCreateDTO ordersCreateDTO, String customerId) throws Exception {
        if (!paymentValidater.validatePayment(ordersCreateDTO.getPaymentId(), customerId, ordersCreateDTO.getAmountPaid())) {
            throw new Exception("Payment is invalid");
        }
        List<PopulatedProductDTO> populatedProductDTOS = new ArrayList<>();
        float finalPrice = 0;
        for (SingleOrderCreateDTO singleOrderCreateDTO : ordersCreateDTO.getOrders()) {
            PopulatedProductDTO populatedProductDTO = restTemplate.getForObject("http://PRODUCT-SERVICE/api/products/" + singleOrderCreateDTO.getProductId(), PopulatedProductDTO.class);
            if (populatedProductDTO != null) {
                populatedProductDTOS.add(populatedProductDTO);
                finalPrice += (populatedProductDTO.getBasePrice() - populatedProductDTO.getBasePrice()* populatedProductDTO.getDiscount()/100) * singleOrderCreateDTO.getQuantity() + populatedProductDTO.getDeliveryCharge();
                if (singleOrderCreateDTO.getQuantity() > populatedProductDTO.getStock()) {
                    throw new Exception("Stock not available");
                }
            } else {
                throw new Exception("Product not found");
            }
        }
        if (ordersCreateDTO.getAmountPaid() < finalPrice) {
            throw new Exception("Amount paid is less than final price");
        }
        String createdDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        List<Order> orders = new ArrayList<>();
        for (int i = 0; i < ordersCreateDTO.getOrders().size(); i++) {
            SingleOrderCreateDTO singleOrderCreateDTO = ordersCreateDTO.getOrders().get(i);
            PopulatedProductDTO populatedProductDTO = populatedProductDTOS.get(i);
            productRepository.decreaseStock(singleOrderCreateDTO.getProductId(), singleOrderCreateDTO.getQuantity());
            Order order = new Order(UUID.randomUUID().toString(), singleOrderCreateDTO.getProductId(), populatedProductDTO.getSeller().getId(), populatedProductDTO.getCourier().getId(), customerId, singleOrderCreateDTO.getQuantity(), finalPrice, ordersCreateDTO.getDeliveryAddress(), null, null, "PROCESSING", createdDate);
            orderRepository.createOrder(order);
            orders.add(order);
        }
        return orders;
    }

    public ResponseEntity<OrdersCreateResponseDTO> createOrders(String accessToken, OrdersCreateDTO ordersCreateDTO) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String customerId = wrappedUser.getCognitoUsername();
            List<Order> orders = createOrdersSet(ordersCreateDTO, customerId);
            return ResponseEntity.status(201).body(new OrdersCreateResponseDTO(orders));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new OrdersCreateResponseDTO(null, e.getMessage()));
        }
    }

    private PopulatedOrderDTO populateOrder(Order order) {
        Product product = restTemplate.getForObject("http://PRODUCT-SERVICE/api/products/" + order.getProductId() + "/unmodified", Product.class);
        if (product == null) {
            return null;
        }
        Seller seller = restTemplate.getForObject("http://USER-SERVICE/api/sellers/" + order.getSellerId(), Seller.class);
        if (seller == null) {
            return null;
        }
        Courier courier = restTemplate.getForObject("http://USER-SERVICE/api/couriers/" + order.getCourierId(), Courier.class);
        if (courier == null) {
            return null;
        }
        Customer customer = customerRepository.getCustomerById(order.getCustomerId());
        if (customer == null) {
            return null;
        }
        return new PopulatedOrderDTO(order.getId(), product, seller, courier, customer, order.getQuantity(), order.getFinalPrice(), order.getDeliveryAddress(), order.getDispatchDate(), order.getDeliveryDate(), order.getStatus(), order.getCreatedDate());
    }

    public ResponseEntity<PopulatedOrderDTO> getOrder(String accessToken, String orderId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String userId = wrappedUser.getCognitoUsername();
            Order order = orderRepository.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.status(404).body(null);
            }
            if (!order.getCustomerId().equals(userId) && !order.getSellerId().equals(userId) && !order.getCourierId().equals(userId)) {
                return ResponseEntity.status(403).body(null);
            }
            PopulatedOrderDTO populatedOrderDTO = populateOrder(order);
            return ResponseEntity.status(200).body(populatedOrderDTO);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<List<Order>>getOrders(String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String userId = wrappedUser.getCognitoUsername();
            String role = wrappedUser.getRole();
            List<Order> orders = new ArrayList<>();
            if (role.equals("CUSTOMER")) {
                orders = orderRepository.getOrdersByCustomer(userId);
            } else if (role.equals("SELLER")) {
                orders = orderRepository.getOrdersBySeller(userId);
            } else if (role.equals("COURIER")) {
                orders = orderRepository.getOrdersByCourier(userId);
            } else {
                return ResponseEntity.status(403).body(null);
            }
            return ResponseEntity.status(200).body(orders);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<List<Order>> getOrdersByProduct(String accessToken, String productId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String sellerId = wrappedUser.getCognitoUsername();
            Product product = restTemplate.getForObject("http://PRODUCT-SERVICE/api/products/" + productId + "/unmodified", Product.class);
            if (product == null) {
                return ResponseEntity.status(404).body(null);
            }
            if (!product.getSellerId().equals(sellerId)) {
                return ResponseEntity.status(403).body(null);
            }
            List<Order> orders = orderRepository.getOrdersByProduct(productId);
            return ResponseEntity.status(200).body(orders);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<OrderUpdateResponseDTO> setOrderDispatched(String accessToken, String orderId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String courierId = wrappedUser.getCognitoUsername();
            Order order = orderRepository.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.status(404).body(new OrderUpdateResponseDTO(null, "Order not found"));
            }
            if (!order.getCourierId().equals(courierId)) {
                return ResponseEntity.status(403).body(new OrderUpdateResponseDTO(null, "Unauthorized"));
            }
            if (!order.getStatus().equals("PROCESSING")) {
                return ResponseEntity.status(400).body(new OrderUpdateResponseDTO(null, "Order is not in processing state"));
            }
            String updatedDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            Order updatedOrder = orderRepository.setOrderStatus(order, "DISPATCHED", updatedDate);
            return ResponseEntity.status(200).body(new OrderUpdateResponseDTO(updatedOrder));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new OrderUpdateResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<OrderUpdateResponseDTO> setOrderDelivered(String accessToken, String orderId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String courierId = wrappedUser.getCognitoUsername();
            Order order = orderRepository.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.status(404).body(new OrderUpdateResponseDTO(null, "Order not found"));
            }
            if (!order.getCourierId().equals(courierId)) {
                return ResponseEntity.status(403).body(new OrderUpdateResponseDTO(null, "Unauthorized"));
            }
            if (!order.getStatus().equals("DISPATCHED")) {
                return ResponseEntity.status(400).body(new OrderUpdateResponseDTO(null, "Order is not in dispatched state"));
            }
            String updatedDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            Order updatedOrder = orderRepository.setOrderStatus(order, "DELIVERED", updatedDate);
            return ResponseEntity.status(200).body(new OrderUpdateResponseDTO(updatedOrder));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new OrderUpdateResponseDTO(null, e.getMessage()));
        }
    }

    public ResponseEntity<OrderUpdateResponseDTO> setOrderCancelled(String accessToken, String orderId) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String userId = wrappedUser.getCognitoUsername();
            Order order = orderRepository.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.status(404).body(new OrderUpdateResponseDTO(null, "Order not found"));
            }
            if (!order.getCustomerId().equals(userId)) {
                return ResponseEntity.status(403).body(new OrderUpdateResponseDTO(null, "Unauthorized"));
            }
            if (!order.getStatus().equals("PROCESSING")) {
                return ResponseEntity.status(400).body(new OrderUpdateResponseDTO(null, "Order is not in processing state"));
            }
            Order updatedOrder = orderRepository.setOrderStatus(order, "CANCELLED", null);
            productRepository.increaseStock(order.getProductId(), order.getQuantity());
            return ResponseEntity.status(200).body(new OrderUpdateResponseDTO(updatedOrder));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new OrderUpdateResponseDTO(null, e.getMessage()));
        }
    }

}
