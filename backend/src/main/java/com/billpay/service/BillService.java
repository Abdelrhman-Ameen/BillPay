package com.billpay.service;

import com.billpay.domain.Bill;
import com.billpay.domain.BillStatus;
import com.billpay.domain.Role;
import com.billpay.domain.ServiceProvider;
import com.billpay.domain.User;
import com.billpay.dto.BillDtos.BillResponse;
import com.billpay.dto.BillDtos.CreateBillRequest;
import com.billpay.exception.ApiException;
import com.billpay.repository.BillRepository;
import com.billpay.repository.ServiceProviderRepository;
import com.billpay.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.billpay.dto.DtoMapper.toBill;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;

    public BillService(BillRepository billRepository, UserRepository userRepository,
                       ServiceProviderRepository providerRepository) {
        this.billRepository = billRepository;
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
    }

    @Transactional(readOnly = true)
    public List<BillResponse> listCustomerBills(Long customerId) {
        return billRepository.findAllByCustomerIdOrderByDueDateAsc(customerId).stream()
                .map(com.billpay.dto.DtoMapper::toBill)
                .toList();
    }

    @Transactional
    public BillResponse createBill(CreateBillRequest request) {
        if (billRepository.existsByReferenceNumberIgnoreCase(request.referenceNumber())) {
            throw new ApiException(HttpStatus.CONFLICT, "A bill with this reference already exists");
        }
        User customer = userRepository.findById(request.customerId())
                .filter(user -> user.getRole() == Role.CUSTOMER)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
        ServiceProvider provider = providerRepository.findById(request.serviceProviderId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Service provider not found"));

        Bill bill = billRepository.save(new Bill(
                customer,
                provider,
                request.referenceNumber().trim(),
                request.amount(),
                request.dueDate(),
                BillStatus.PENDING
        ));
        return toBill(bill);
    }
}
