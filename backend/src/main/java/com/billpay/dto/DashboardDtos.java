package com.billpay.dto;

import com.billpay.domain.Role;

public final class DashboardDtos {

    private DashboardDtos() {
    }

    public record CustomerResponse(
            Long id,
            String fullName,
            String email,
            Role role
    ) {
    }
}
