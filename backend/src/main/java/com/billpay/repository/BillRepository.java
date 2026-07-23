package com.billpay.repository;

import com.billpay.domain.Bill;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {

    boolean existsByReferenceNumberIgnoreCase(String referenceNumber);

    @EntityGraph(attributePaths = {"serviceProvider", "successfulPayment"})
    List<Bill> findAllByCustomerIdOrderByDueDateAsc(Long customerId);

    @EntityGraph(attributePaths = {"serviceProvider", "customer", "successfulPayment"})
    Optional<Bill> findDetailedById(Long id);
}
