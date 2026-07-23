package com.billpay.controller;

import com.billpay.dto.BillDtos.BillResponse;
import com.billpay.dto.BillDtos.CreateBillRequest;
import com.billpay.dto.DashboardDtos.CustomerResponse;
import com.billpay.dto.PaymentDtos.PaymentResponse;
import com.billpay.dto.ProviderDtos.ProviderRequest;
import com.billpay.dto.ProviderDtos.ProviderResponse;
import com.billpay.service.AdminService;
import com.billpay.service.BillService;
import com.billpay.service.CatalogService;
import com.billpay.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CatalogService catalogService;
    private final BillService billService;
    private final PaymentService paymentService;
    private final AdminService adminService;

    public AdminController(CatalogService catalogService, BillService billService,
                           PaymentService paymentService, AdminService adminService) {
        this.catalogService = catalogService;
        this.billService = billService;
        this.paymentService = paymentService;
        this.adminService = adminService;
    }

    @PostMapping("/providers")
    @ResponseStatus(HttpStatus.CREATED)
    public ProviderResponse createProvider(@Valid @RequestBody ProviderRequest request) {
        return catalogService.createProvider(request);
    }

    @PostMapping("/bills")
    @ResponseStatus(HttpStatus.CREATED)
    public BillResponse createBill(@Valid @RequestBody CreateBillRequest request) {
        return billService.createBill(request);
    }

    @GetMapping("/customers")
    public List<CustomerResponse> customers() {
        return adminService.listCustomers();
    }

    @GetMapping("/payments")
    public List<PaymentResponse> payments() {
        return paymentService.allPayments();
    }
}
