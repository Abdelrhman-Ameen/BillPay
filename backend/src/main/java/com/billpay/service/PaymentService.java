package com.billpay.service;

import com.billpay.domain.Bill;
import com.billpay.domain.BillStatus;
import com.billpay.domain.Payment;
import com.billpay.domain.PaymentMethodType;
import com.billpay.domain.PaymentStatus;
import com.billpay.dto.PaymentDtos.PaymentResponse;
import com.billpay.exception.ApiException;
import com.billpay.payment.PaymentMethod;
import com.billpay.payment.PaymentMethodRegistry;
import com.billpay.payment.PaymentResult;
import com.billpay.repository.BillRepository;
import com.billpay.repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.billpay.dto.DtoMapper.toPayment;

@Service
public class PaymentService {

    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMethodRegistry paymentMethodRegistry;

    public PaymentService(BillRepository billRepository, PaymentRepository paymentRepository,
                          PaymentMethodRegistry paymentMethodRegistry) {
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
        this.paymentMethodRegistry = paymentMethodRegistry;
    }

    @Transactional
    public PaymentResponse payBill(Long customerId, Long billId, PaymentMethodType methodType) {
        Bill bill = billRepository.findDetailedById(billId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Bill not found"));

        if (!bill.getCustomer().getId().equals(customerId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You cannot access another customer's bill");
        }
        if (bill.getStatus() == BillStatus.PAID) {
            throw new ApiException(HttpStatus.CONFLICT, "This bill has already been paid");
        }
        if (bill.getStatus() == BillStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "A cancelled bill cannot be paid");
        }

        PaymentMethod paymentMethod = paymentMethodRegistry.get(methodType);
        PaymentResult result = paymentMethod.pay(bill.getAmount());
        Payment payment = paymentRepository.save(new Payment(
                bill,
                bill.getAmount(),
                methodType,
                result.successful() ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
                result.reference(),
                result.message()
        ));

        if (result.successful()) {
            bill.markPaid(payment);
            billRepository.save(bill);
        }

        return toPayment(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> customerHistory(Long customerId) {
        return paymentRepository.findAllByBillCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(com.billpay.dto.DtoMapper::toPayment)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> allPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(com.billpay.dto.DtoMapper::toPayment)
                .toList();
    }
}
