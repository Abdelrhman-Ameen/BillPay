package com.billpay.service;

import com.billpay.domain.Role;
import com.billpay.dto.DashboardDtos.CustomerResponse;
import com.billpay.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> listCustomers() {
        return userRepository.findAllByRoleOrderByFullNameAsc(Role.CUSTOMER).stream()
                .map(com.billpay.dto.DtoMapper::toCustomer)
                .toList();
    }
}
