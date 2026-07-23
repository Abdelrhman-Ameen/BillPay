package com.billpay.dto;

import com.billpay.domain.BillStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public final class BillDtos {

    private BillDtos() {
    }

    public record CreateBillRequest(
            @NotNull Long customerId,
            @NotNull Long serviceProviderId,
            @NotBlank @Size(max = 60) String referenceNumber,
            @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
            @NotNull @FutureOrPresent LocalDate dueDate
    ) {
    }

    public record BillResponse(
            Long id,
            String referenceNumber,
            BigDecimal amount,
            LocalDate dueDate,
            BillStatus status,
            Long serviceProviderId,
            String serviceProviderName,
            String serviceCategory,
            Long customerId,
            String customerName,
            Instant createdAt
    ) {
    }
}
