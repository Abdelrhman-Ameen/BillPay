package com.billpay.service;

import com.billpay.domain.ServiceProvider;
import com.billpay.dto.ProviderDtos.ProviderRequest;
import com.billpay.dto.ProviderDtos.ProviderResponse;
import com.billpay.exception.ApiException;
import com.billpay.repository.ServiceProviderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.billpay.dto.DtoMapper.toProvider;

@Service
public class CatalogService {

    private final ServiceProviderRepository providerRepository;

    public CatalogService(ServiceProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    @Transactional(readOnly = true)
    public List<ProviderResponse> listProviders() {
        return providerRepository.findAllByOrderByNameAsc().stream()
                .map(com.billpay.dto.DtoMapper::toProvider)
                .toList();
    }

    @Transactional
    public ProviderResponse createProvider(ProviderRequest request) {
        if (providerRepository.existsByNameIgnoreCase(request.name())) {
            throw new ApiException(HttpStatus.CONFLICT, "A provider with this name already exists");
        }
        ServiceProvider provider = providerRepository.save(new ServiceProvider(
                request.name().trim(),
                request.category().trim(),
                request.description().trim()
        ));
        return toProvider(provider);
    }
}
