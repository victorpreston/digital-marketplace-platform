package com.nebulamart.userservice.template;

import com.nebulamart.userservice.entity.Seller;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SellerUpdateResponse {
    private Seller seller;
    private String message;

    public SellerUpdateResponse(Seller seller) {
        this.seller = seller;
        this.message = "Account update successful";
    }
}
