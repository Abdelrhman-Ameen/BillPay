package com.billpay.dto;

import com.billpay.domain.PaymentMethodType;
import com.billpay.domain.PaymentStatus;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public final class PaymentDtos {

    private PaymentDtos() {
    }

    public record CreatePaymentRequest(
            @NotNull PaymentMethodType method
    ) {
    }

    public record PaymentResponse(
            Long id,
            String transactionReference,
            BigDecimal amount,
            PaymentMethodType method,
            PaymentStatus status,
            String message,
            Instant createdAt,
            Long billId,
            String billReference,
            String serviceProviderName,
            Long customerId,
            String customerName
    ) {
    }
}
