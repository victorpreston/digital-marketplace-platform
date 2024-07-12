package com.nebulamart.productservice.template;

import com.nebulamart.productservice.entity.Contract;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourierRespondResponseDTO {
    private Contract contract;
    private String message;
}
