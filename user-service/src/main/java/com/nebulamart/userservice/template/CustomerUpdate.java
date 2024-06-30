package com.nebulamart.userservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerUpdate {

    private String name;
    private String contactNumber;
    private String address;

    public boolean isValid() {
        return name != null || contactNumber != null || address != null;
    }
}
