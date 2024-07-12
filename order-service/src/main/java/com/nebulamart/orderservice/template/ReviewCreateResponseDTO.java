package com.nebulamart.orderservice.template;

import com.nebulamart.orderservice.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewCreateResponseDTO {
    private Review review;
    private String message;

    public ReviewCreateResponseDTO(Review review) {
        this.review = review;
        this.message = "Review created successfully";
    }

}
