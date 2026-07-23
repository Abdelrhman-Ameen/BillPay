package com.billpay.service;

import com.billpay.domain.Role;
import com.billpay.domain.User;
import com.billpay.dto.AuthDtos.AuthResponse;
import com.billpay.dto.AuthDtos.LoginRequest;
import com.billpay.dto.AuthDtos.RegisterRequest;
import com.billpay.exception.ApiException;
import com.billpay.repository.UserRepository;
import com.billpay.security.AuthenticatedUser;
import com.billpay.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.billpay.dto.DtoMapper.toUser;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User user = userRepository.save(new User(
                request.fullName().trim(),
                request.email().trim(),
                passwordEncoder.encode(request.password()),
                Role.CUSTOMER
        ));
        AuthenticatedUser principal = principal(user);
        return new AuthResponse(jwtService.createToken(principal), toUser(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return new AuthResponse(jwtService.createToken(principal(user)), toUser(user));
    }

    private AuthenticatedUser principal(User user) {
        return new AuthenticatedUser(user.getId(), user.getFullName(), user.getEmail(),
                user.getPasswordHash(), user.getRole());
    }
}
