package com.billpay.payment;

import com.billpay.domain.PaymentMethodType;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class PaymentMethodRegistry {

    private final Map<PaymentMethodType, PaymentMethod> methods;

    public PaymentMethodRegistry(CashPayment cashPayment, CardPayment cardPayment,
                                 WalletPayment walletPayment) {
        methods = new EnumMap<>(PaymentMethodType.class);
        methods.put(PaymentMethodType.CASH, cashPayment);
        methods.put(PaymentMethodType.CARD, cardPayment);
        methods.put(PaymentMethodType.WALLET, walletPayment);
    }

    public PaymentMethod get(PaymentMethodType type) {
        PaymentMethod paymentMethod = methods.get(type);
        if (paymentMethod == null) {
            throw new IllegalArgumentException("Unsupported payment method: " + type);
        }
        return paymentMethod;
    }
}
