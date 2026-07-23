package com.billpay.payment;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component("walletPayment")
public class WalletPayment implements PaymentMethod {

    private static final BigDecimal SIMULATED_WALLET_LIMIT = new BigDecimal("5000.00");

    @Override
    public PaymentResult pay(BigDecimal amount) {
        String reference = reference("WLT");
        if (amount.compareTo(SIMULATED_WALLET_LIMIT) > 0) {
            return PaymentResult.failure(reference, "Wallet balance is insufficient in the simulator");
        }
        return PaymentResult.success(reference, "Wallet payment confirmed");
    }

    private String reference(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}
