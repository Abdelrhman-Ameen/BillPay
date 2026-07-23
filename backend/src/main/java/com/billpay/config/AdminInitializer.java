package com.billpay.config;

import com.billpay.domain.Role;
import com.billpay.domain.User;
import com.billpay.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    org.springframework.boot.CommandLineRunner bootstrapAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.name:BillPay Admin}") String name,
            @Value("${app.admin.email:}") String email,
            @Value("${app.admin.password:}") String password
    ) {
        return args -> {
            if (email.isBlank() && password.isBlank()) {
                return;
            }
            if (email.isBlank() || password.length() < 8) {
                throw new IllegalStateException(
                        "ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters are required"
                );
            }
            if (userRepository.existsByEmailIgnoreCase(email)) {
                return;
            }

            userRepository.save(new User(
                    name.trim().isEmpty() ? "BillPay Admin" : name.trim(),
                    email.trim().toLowerCase(),
                    passwordEncoder.encode(password),
                    Role.ADMIN
            ));
        };
    }
}
