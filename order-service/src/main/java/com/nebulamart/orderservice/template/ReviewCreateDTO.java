package com.nebulamart.orderservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewCreateDTO {
    private String orderId;
    private String productReview;
    private String courierReview;
    private int productRating;
    private int courierRating;

    public boolean isValid() {
        return orderId != null && productRating >= 1 && productRating <= 5 && courierRating >= 1 && courierRating <= 5;
    }

}
