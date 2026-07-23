package com.billpay.repository;

import com.billpay.domain.Payment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @EntityGraph(attributePaths = {"bill", "bill.serviceProvider", "bill.customer"})
    List<Payment> findAllByBillCustomerIdOrderByCreatedAtDesc(Long customerId);

    @EntityGraph(attributePaths = {"bill", "bill.serviceProvider", "bill.customer"})
    List<Payment> findAllByOrderByCreatedAtDesc();
}
