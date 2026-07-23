package com.billpay.repository;

import com.billpay.domain.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {
    boolean existsByNameIgnoreCase(String name);
    List<ServiceProvider> findAllByOrderByNameAsc();
}
