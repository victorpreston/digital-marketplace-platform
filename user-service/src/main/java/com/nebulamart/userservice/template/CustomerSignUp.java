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

}
