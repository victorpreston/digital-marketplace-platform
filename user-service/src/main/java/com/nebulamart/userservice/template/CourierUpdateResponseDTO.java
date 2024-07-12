package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Courier;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourierUpdateResponseDTO {
    private Courier courier;
    private String message;

    public CourierUpdateResponseDTO(Courier courier) {
        this.courier = courier;
        this.message = "Account update successful";
    }
}
