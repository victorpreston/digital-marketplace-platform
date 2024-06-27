package com.nebulamart.userservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CustomerSignUp {

    private String name;
    private String email;
    private String password;
    private String contactNumber;
    private List<Float> location;
    private String address;

    public boolean isValid() {
        return name != null && email != null && password != null && contactNumber != null && address != null;
    }

}
