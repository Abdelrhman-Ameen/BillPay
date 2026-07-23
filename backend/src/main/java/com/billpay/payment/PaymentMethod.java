package com.billpay.payment;

import java.math.BigDecimal;

public interface PaymentMethod {
    PaymentResult pay(BigDecimal amount);
}
