package com.nebulamart.productservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductDeleteResponseDTO {
    private boolean success;
    private String message;
}
