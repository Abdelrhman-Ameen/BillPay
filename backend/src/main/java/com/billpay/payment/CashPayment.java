package com.billpay.payment;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component("cashPayment")
public class CashPayment implements PaymentMethod {

    @Override
    public PaymentResult pay(BigDecimal amount) {
        return PaymentResult.success(reference("CSH"), "Cash payment accepted at the service counter");
    }

    private String reference(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}
