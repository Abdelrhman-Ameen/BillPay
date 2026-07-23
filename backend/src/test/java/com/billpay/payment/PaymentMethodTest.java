package com.billpay.payment;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class PaymentMethodTest {

    @Test
    void cashAlwaysSucceeds() {
        PaymentMethod paymentMethod = new CashPayment();

        assertThat(paymentMethod.pay(new BigDecimal("50000.00")).successful()).isTrue();
    }

    @Test
    void cardDeclinesAboveSimulatorLimit() {
        PaymentMethod paymentMethod = new CardPayment();

        PaymentResult result = paymentMethod.pay(new BigDecimal("20000.01"));

        assertThat(result.successful()).isFalse();
        assertThat(result.message()).contains("declined");
    }

    @Test
    void walletDeclinesAboveSimulatorLimit() {
        PaymentMethod paymentMethod = new WalletPayment();

        PaymentResult result = paymentMethod.pay(new BigDecimal("5000.01"));

        assertThat(result.successful()).isFalse();
        assertThat(result.message()).contains("insufficient");
    }
}
