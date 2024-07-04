package com.nebulamart.productservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetUrlResponse {
    private String url;
    private String message;
}
