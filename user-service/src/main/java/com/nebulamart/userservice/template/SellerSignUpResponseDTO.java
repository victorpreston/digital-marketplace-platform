package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Seller;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SellerSignUpResponseDTO {
    private Seller seller;
    private String message;

    public SellerSignUpResponseDTO(Seller seller) {
        this.seller = seller;
        this.message = "Sign up successful";
    }
}
