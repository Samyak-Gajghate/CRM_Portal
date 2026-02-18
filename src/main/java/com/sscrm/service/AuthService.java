package com.sscrm.service;

import com.sscrm.config.JwtUtil;
import com.sscrm.dto.AuthResponse;
import com.sscrm.dto.LoginRequest;
import com.sscrm.dto.RegisterRequest;
import com.sscrm.entity.User;
import com.sscrm.entity.Customer;
import com.sscrm.entity.CustomerCategory;
import com.sscrm.repository.UserRepository;
import com.sscrm.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setActive(true);

        userRepository.save(user);

        if (user.getRole() == com.sscrm.entity.UserRole.CUSTOMER) {
            Customer customer = new Customer();
            customer.setName(request.getUsername());
            customer.setEmail(request.getEmail());
            customer.setPhone(request.getPhone() != null ? request.getPhone() : "");
            customer.setCategory(CustomerCategory.REGULAR);
            customer.setUserId(user.getId());
            customerRepository.save(customer);
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }
}
