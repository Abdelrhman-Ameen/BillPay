package com.billpay.payment;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component("cardPayment")
public class CardPayment implements PaymentMethod {

    private static final BigDecimal SIMULATED_CARD_LIMIT = new BigDecimal("20000.00");

    @Override
    public PaymentResult pay(BigDecimal amount) {
        String reference = reference("CRD");
        if (amount.compareTo(SIMULATED_CARD_LIMIT) > 0) {
            return PaymentResult.failure(reference, "Card authorization declined by the simulator");
        }
        return PaymentResult.success(reference, "Card authorized successfully");
    }

    private String reference(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}
