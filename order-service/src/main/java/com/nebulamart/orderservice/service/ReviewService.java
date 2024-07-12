package com.nebulamart.orderservice.service;

import com.nebulamart.orderservice.entity.Customer;
import com.nebulamart.orderservice.entity.Order;
import com.nebulamart.orderservice.entity.Review;
import com.nebulamart.orderservice.repository.*;
import com.nebulamart.orderservice.template.ReviewCreateDTO;
import com.nebulamart.orderservice.template.ReviewCreateResponseDTO;
import com.nebulamart.orderservice.template.ReviewWithCustomerDTO;
import com.nebulamart.orderservice.util.WrappedUser;
import com.nebulamart.orderservice.util.AuthFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CourierRepository courierRepository;
    private final CustomerRepository customerRepository;
    private final AuthFacade authFacade;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, OrderRepository orderRepository, ProductRepository productRepository, CourierRepository courierRepository, CustomerRepository customerRepository, AuthFacade authFacade) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.courierRepository = courierRepository;
        this.customerRepository = customerRepository;
        this.authFacade = authFacade;
    }

    public ResponseEntity<ReviewCreateResponseDTO> createReview(String accessToken, ReviewCreateDTO reviewCreateDTO) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String customerId = wrappedUser.getCognitoUsername();
            Order order = orderRepository.getOrderById(reviewCreateDTO.getOrderId());
            if (order == null) {
                return ResponseEntity.status(400).body(new ReviewCreateResponseDTO(null, "Order not found"));
            }
            if (!order.getCustomerId().equals(customerId)) {
                return ResponseEntity.status(401).body(new ReviewCreateResponseDTO(null, "Unauthorized"));
            }
            if (!order.getStatus().equals("DELIVERED")) {
                return ResponseEntity.status(400).body(new ReviewCreateResponseDTO(null, "Order not delivered"));
            }
            String createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            Review review = new Review(UUID.randomUUID().toString(), order.getProductId(), order.getSellerId(), order.getCourierId(), order.getId(), customerId,
                    reviewCreateDTO.getProductReview(), reviewCreateDTO.getCourierReview(), reviewCreateDTO.getProductRating(), reviewCreateDTO.getCourierRating(), createdAt);
            reviewRepository.createReview(review);
            productRepository.updateProductRating(order.getProductId(), reviewCreateDTO.getProductRating());
            courierRepository.updateCourierRating(order.getCourierId(), reviewCreateDTO.getCourierRating());
            return ResponseEntity.ok(new ReviewCreateResponseDTO(review));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new ReviewCreateResponseDTO(null, e.getMessage()));
        }
    }

    private List<Review> getReviewsByProductId(String productId) {
        return reviewRepository.getReviewsByProductId(productId);
    }

    private List<Review> getReviewsBySellerId(String sellerId) {
        return reviewRepository.getReviewsBySellerId(sellerId);
    }

    private List<Review> getReviewsByCourierId(String courierId) {
        return reviewRepository.getReviewsByCourierId(courierId);
    }

    public ResponseEntity<List<Review>> getReviews(String productId, String sellerId, String courierId) {
        try {
            if (productId != null && sellerId == null && courierId == null) {
                return ResponseEntity.ok(getReviewsByProductId(productId));
            } else if (sellerId != null && productId == null && courierId == null) {
                return ResponseEntity.ok(getReviewsBySellerId(sellerId));
            } else if (courierId != null && productId == null && sellerId == null) {
                return ResponseEntity.ok(getReviewsByCourierId(courierId));
            }
            return ResponseEntity.status(400).body(null);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<ReviewWithCustomerDTO> getReview(String id) {
        try {
            Review review = reviewRepository.getReviewsById(id);
            if (review == null) {
                return ResponseEntity.status(404).body(null);
            }
            Customer customer = customerRepository.getCustomerById(review.getCustomerId());
            return ResponseEntity.ok(new ReviewWithCustomerDTO(review, customer.getName()));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }
}
