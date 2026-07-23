package com.billpay.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class ProviderDtos {

    private ProviderDtos() {
    }

    public record ProviderRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Size(max = 60) String category,
            @NotBlank @Size(max = 280) String description
    ) {
    }

    public record ProviderResponse(
            Long id,
            String name,
            String category,
            String description,
            Instant createdAt
    ) {
    }
}
