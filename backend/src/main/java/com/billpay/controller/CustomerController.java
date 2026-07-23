package com.billpay.controller;

import com.billpay.dto.BillDtos.BillResponse;
import com.billpay.dto.PaymentDtos.CreatePaymentRequest;
import com.billpay.dto.PaymentDtos.PaymentResponse;
import com.billpay.security.AuthenticatedUser;
import com.billpay.service.BillService;
import com.billpay.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final BillService billService;
    private final PaymentService paymentService;

    public CustomerController(BillService billService, PaymentService paymentService) {
        this.billService = billService;
        this.paymentService = paymentService;
    }

    @GetMapping("/bills")
    public List<BillResponse> bills(@AuthenticationPrincipal AuthenticatedUser user) {
        return billService.listCustomerBills(user.id());
    }

    @PostMapping("/bills/{billId}/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse pay(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long billId,
            @Valid @RequestBody CreatePaymentRequest request
    ) {
        return paymentService.payBill(user.id(), billId, request.method());
    }

    @GetMapping("/payments")
    public List<PaymentResponse> payments(@AuthenticationPrincipal AuthenticatedUser user) {
        return paymentService.customerHistory(user.id());
    }
}
