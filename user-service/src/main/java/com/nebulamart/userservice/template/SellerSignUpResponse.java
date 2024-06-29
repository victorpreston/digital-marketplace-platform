package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Seller;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SellerSignUpResponse {
    private Seller seller;
    private String message;

    public SellerSignUpResponse(Seller seller) {
        this.seller = seller;
        this.message = "Sign up successful";
    }
}
