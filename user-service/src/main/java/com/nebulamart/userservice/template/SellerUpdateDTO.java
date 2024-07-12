package com.nebulamart.userservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SellerUpdateDTO {

    private String name;
    private String contactNumber;
    private String address;
    private String logoUrl;

    public boolean isValid() {
        return name != null || contactNumber != null || address != null || logoUrl != null;
    }
}
