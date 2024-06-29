package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Courier;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourierSignUpResponse {
    private Courier courier;
    private String message;

    public CourierSignUpResponse(Courier courier) {
        this.courier = courier;
        this.message = "Sign up successful";
    }
}
