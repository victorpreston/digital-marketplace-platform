package com.nebulamart.orderservice.util;

import org.springframework.stereotype.Component;

@Component
public class PaymentValidater {
    public boolean validatePayment(String paymentId, String customerId, float amountPaid) {
        return true;
    }
}
