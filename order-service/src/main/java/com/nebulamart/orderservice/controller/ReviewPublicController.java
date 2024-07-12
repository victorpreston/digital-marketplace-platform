package com.nebulamart.orderservice.controller;

import com.nebulamart.orderservice.entity.Review;
import com.nebulamart.orderservice.service.ReviewService;
import com.nebulamart.orderservice.template.ReviewWithCustomerDTO;
import jakarta.websocket.server.PathParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewPublicController {
    private final ReviewService reviewService;

    @Autowired
    public ReviewPublicController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("")
    public ResponseEntity<List<Review>> getReviews(@PathParam("productId") String productId, @PathParam("sellerId") String sellerId, @PathParam("courierId") String courierId) {
        ResponseEntity<List<Review>> responseEntity = reviewService.getReviews(productId, sellerId, courierId);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(null);
        }
        return responseEntity;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewWithCustomerDTO> getReview(@PathVariable("id") String id) {
        ResponseEntity<ReviewWithCustomerDTO> responseEntity = reviewService.getReview(id);
        if (responseEntity.getBody() == null) {
            return ResponseEntity.status(404).body(null);
        }
        return responseEntity;
    }


}
