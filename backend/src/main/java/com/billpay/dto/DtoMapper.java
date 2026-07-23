package com.billpay.dto;

import com.billpay.domain.Bill;
import com.billpay.domain.Payment;
import com.billpay.domain.ServiceProvider;
import com.billpay.domain.User;

import static com.billpay.dto.AuthDtos.UserResponse;
import static com.billpay.dto.BillDtos.BillResponse;
import static com.billpay.dto.DashboardDtos.CustomerResponse;
import static com.billpay.dto.PaymentDtos.PaymentResponse;
import static com.billpay.dto.ProviderDtos.ProviderResponse;

public final class DtoMapper {

    private DtoMapper() {
    }

    public static UserResponse toUser(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }

    public static CustomerResponse toCustomer(User user) {
        return new CustomerResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }

    public static ProviderResponse toProvider(ServiceProvider provider) {
        return new ProviderResponse(provider.getId(), provider.getName(), provider.getCategory(),
                provider.getDescription(), provider.getCreatedAt());
    }

    public static BillResponse toBill(Bill bill) {
        return new BillResponse(
                bill.getId(),
                bill.getReferenceNumber(),
                bill.getAmount(),
                bill.getDueDate(),
                bill.getStatus(),
                bill.getServiceProvider().getId(),
                bill.getServiceProvider().getName(),
                bill.getServiceProvider().getCategory(),
                bill.getCustomer().getId(),
                bill.getCustomer().getFullName(),
                bill.getCreatedAt()
        );
    }

    public static PaymentResponse toPayment(Payment payment) {
        Bill bill = payment.getBill();
        return new PaymentResponse(
                payment.getId(),
                payment.getTransactionReference(),
                payment.getAmount(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getMessage(),
                payment.getCreatedAt(),
                bill.getId(),
                bill.getReferenceNumber(),
                bill.getServiceProvider().getName(),
                bill.getCustomer().getId(),
                bill.getCustomer().getFullName()
        );
    }
}
