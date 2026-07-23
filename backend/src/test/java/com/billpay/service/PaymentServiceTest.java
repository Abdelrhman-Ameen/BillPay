package com.billpay.service;

import com.billpay.domain.Bill;
import com.billpay.domain.BillStatus;
import com.billpay.domain.Payment;
import com.billpay.domain.PaymentMethodType;
import com.billpay.domain.PaymentStatus;
import com.billpay.domain.Role;
import com.billpay.domain.ServiceProvider;
import com.billpay.domain.User;
import com.billpay.exception.ApiException;
import com.billpay.payment.PaymentMethod;
import com.billpay.payment.PaymentMethodRegistry;
import com.billpay.payment.PaymentResult;
import com.billpay.repository.BillRepository;
import com.billpay.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentServiceTest {

    private BillRepository billRepository;
    private PaymentRepository paymentRepository;
    private PaymentMethodRegistry registry;
    private PaymentMethod method;
    private PaymentService service;
    private Bill bill;

    @BeforeEach
    void setUp() {
        billRepository = mock(BillRepository.class);
        paymentRepository = mock(PaymentRepository.class);
        registry = mock(PaymentMethodRegistry.class);
        method = mock(PaymentMethod.class);
        service = new PaymentService(billRepository, paymentRepository, registry);

        User customer = new User("Customer", "customer@example.com", "hash", Role.CUSTOMER);
        ReflectionTestUtils.setField(customer, "id", 7L);
        ServiceProvider provider = new ServiceProvider("Power Co", "Electricity", "Power bills");
        ReflectionTestUtils.setField(provider, "id", 3L);
        bill = new Bill(customer, provider, "BILL-101", new BigDecimal("750.00"),
                LocalDate.now().plusDays(5), BillStatus.PENDING);
        ReflectionTestUtils.setField(bill, "id", 11L);

        when(billRepository.findDetailedById(11L)).thenReturn(Optional.of(bill));
        when(registry.get(PaymentMethodType.CARD)).thenReturn(method);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void successfulPaymentMarksBillPaid() {
        when(method.pay(bill.getAmount()))
                .thenReturn(PaymentResult.success("CRD-OK", "Authorized"));

        var response = service.payBill(7L, 11L, PaymentMethodType.CARD);

        assertThat(response.status()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(bill.getStatus()).isEqualTo(BillStatus.PAID);
        assertThat(bill.getSuccessfulPayment()).isNotNull();
        verify(billRepository).save(bill);
    }

    @Test
    void failedPaymentIsRecordedButDoesNotMarkBillPaid() {
        when(method.pay(bill.getAmount()))
                .thenReturn(PaymentResult.failure("CRD-NO", "Declined"));

        var response = service.payBill(7L, 11L, PaymentMethodType.CARD);

        assertThat(response.status()).isEqualTo(PaymentStatus.FAILED);
        assertThat(bill.getStatus()).isEqualTo(BillStatus.PENDING);
        assertThat(bill.getSuccessfulPayment()).isNull();
        verify(billRepository, never()).save(bill);

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    @Test
    void customerCannotAccessAnotherCustomersBill() {
        assertThatThrownBy(() -> service.payBill(99L, 11L, PaymentMethodType.CARD))
                .isInstanceOf(ApiException.class)
                .hasMessage("You cannot access another customer's bill");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    void cancelledBillCannotBePaid() {
        ReflectionTestUtils.setField(bill, "status", BillStatus.CANCELLED);

        assertThatThrownBy(() -> service.payBill(7L, 11L, PaymentMethodType.CARD))
                .isInstanceOf(ApiException.class)
                .hasMessage("A cancelled bill cannot be paid");
    }

    @Test
    void paidBillCannotBePaidAgain() {
        Payment previous = new Payment(bill, bill.getAmount(), PaymentMethodType.CASH,
                PaymentStatus.SUCCESS, "CSH-PREV", "Paid");
        bill.markPaid(previous);

        assertThatThrownBy(() -> service.payBill(7L, 11L, PaymentMethodType.CARD))
                .isInstanceOf(ApiException.class)
                .hasMessage("This bill has already been paid");
    }
}
