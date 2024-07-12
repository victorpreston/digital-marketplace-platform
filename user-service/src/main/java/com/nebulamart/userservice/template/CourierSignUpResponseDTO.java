package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Courier;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourierSignUpResponseDTO {
    private Courier courier;
    private String message;

    public CourierSignUpResponseDTO(Courier courier) {
        this.courier = courier;
        this.message = "Sign up successful";
    }
}
