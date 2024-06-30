package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Courier;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourierUpdateResponse {
    private Courier courier;
    private String message;

    public CourierUpdateResponse(Courier courier) {
        this.courier = courier;
        this.message = "Account update successful";
    }
}
