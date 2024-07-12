package com.nebulamart.productservice.template;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RespondContractRequestDTO {
    private String contractId;
    private boolean accept;
    private float deliveryCharge;

    public boolean isAccept() {
        return accept;
    }

    public boolean isValid() {
        return (contractId != null && accept && deliveryCharge >= 0) || (contractId != null && !accept);
    }
}
