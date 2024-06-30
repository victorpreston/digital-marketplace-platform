package com.nebulamart.userservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourierUpdate {

    private String name;
    private String contactNumber;
    private String logoUrl;

    public boolean isValid() {
        return name != null || contactNumber != null || logoUrl != null;
    }
}
