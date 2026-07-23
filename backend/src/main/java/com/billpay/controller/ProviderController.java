package com.billpay.controller;

import com.billpay.dto.ProviderDtos.ProviderResponse;
import com.billpay.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {

    private final CatalogService catalogService;

    public ProviderController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<ProviderResponse> list() {
        return catalogService.listProviders();
    }
}
