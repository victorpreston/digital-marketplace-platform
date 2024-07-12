package com.nebulamart.orderservice.controller;

import com.nebulamart.orderservice.service.ReviewService;
import com.nebulamart.orderservice.template.ReviewCreateDTO;
import com.nebulamart.orderservice.template.ReviewCreateResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/review")
public class ReviewController {
    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/create")
    public ResponseEntity<ReviewCreateResponseDTO> createReview(@RequestHeader("Authorization") String accessToken, @RequestBody ReviewCreateDTO reviewCreateDTO) {
        if (!reviewCreateDTO.isValid()) {
            return ResponseEntity.status(400).body(new ReviewCreateResponseDTO(null, "Missing required fields"));
        }
        ResponseEntity<ReviewCreateResponseDTO> responseEntity = reviewService.createReview(accessToken, reviewCreateDTO);
        if (responseEntity == null) {
            return ResponseEntity.status(400).body(new ReviewCreateResponseDTO(null, "Failed to create review"));
        }
        return responseEntity;
    }


}
