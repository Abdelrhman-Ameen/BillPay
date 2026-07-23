package com.billpay.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_provider_id", nullable = false)
    private ServiceProvider serviceProvider;

    @Column(nullable = false, unique = true, length = 60)
    private String referenceNumber;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BillStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "successful_payment_id", unique = true)
    private Payment successfulPayment;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Bill() {
    }

    public Bill(User customer, ServiceProvider serviceProvider, String referenceNumber,
                BigDecimal amount, LocalDate dueDate, BillStatus status) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Bill amount must be positive");
        }
        this.customer = customer;
        this.serviceProvider = serviceProvider;
        this.referenceNumber = referenceNumber;
        this.amount = amount;
        this.dueDate = dueDate;
        this.status = status;
    }

    @PrePersist
    void setCreatedAt() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public void markPaid(Payment payment) {
        if (status != BillStatus.PENDING) {
            throw new IllegalStateException("Only a pending bill can be marked as paid");
        }
        if (payment == null || payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalArgumentException("A bill requires a successful payment");
        }
        successfulPayment = payment;
        status = BillStatus.PAID;
    }

    public Long getId() {
        return id;
    }

    public User getCustomer() {
        return customer;
    }

    public ServiceProvider getServiceProvider() {
        return serviceProvider;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public BillStatus getStatus() {
        return status;
    }

    public Payment getSuccessfulPayment() {
        return successfulPayment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
