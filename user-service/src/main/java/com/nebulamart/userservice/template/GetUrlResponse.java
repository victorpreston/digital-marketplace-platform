package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetUrlResponse {
    private String url;
    private String message;
}
