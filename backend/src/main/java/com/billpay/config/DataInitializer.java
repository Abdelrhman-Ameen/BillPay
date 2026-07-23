package com.billpay.config;

import com.billpay.domain.Bill;
import com.billpay.domain.BillStatus;
import com.billpay.domain.Role;
import com.billpay.domain.ServiceProvider;
import com.billpay.domain.User;
import com.billpay.repository.BillRepository;
import com.billpay.repository.ServiceProviderRepository;
import com.billpay.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DataInitializer {

    @Bean
    CommandLineRunner seedDemoData(UserRepository userRepository,
                                   ServiceProviderRepository providerRepository,
                                   BillRepository billRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            userRepository.save(new User(
                    "BillPay Admin",
                    "admin@billpay.dev",
                    passwordEncoder.encode("Admin123!"),
                    Role.ADMIN
            ));
            User customer = userRepository.save(new User(
                    "Mariam Hassan",
                    "customer@billpay.dev",
                    passwordEncoder.encode("Customer123!"),
                    Role.CUSTOMER
            ));

            ServiceProvider electricity = providerRepository.save(new ServiceProvider(
                    "Cairo Electric",
                    "Electricity",
                    "Residential electricity bills and meter services"
            ));
            ServiceProvider internet = providerRepository.save(new ServiceProvider(
                    "Nile Connect",
                    "Internet",
                    "Home internet subscriptions and monthly packages"
            ));
            ServiceProvider water = providerRepository.save(new ServiceProvider(
                    "PureFlow",
                    "Water",
                    "Municipal water and utility account payments"
            ));

            billRepository.saveAll(List.of(
                    new Bill(customer, electricity, "CE-2026-10482", new BigDecimal("745.50"),
                            LocalDate.now().plusDays(5), BillStatus.PENDING),
                    new Bill(customer, internet, "NC-883104", new BigDecimal("1280.00"),
                            LocalDate.now().plusDays(11), BillStatus.PENDING),
                    new Bill(customer, water, "PF-42071", new BigDecimal("6200.00"),
                            LocalDate.now().plusDays(17), BillStatus.PENDING)
            ));
        };
    }
}
