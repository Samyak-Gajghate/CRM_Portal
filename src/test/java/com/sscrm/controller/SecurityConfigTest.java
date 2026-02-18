package com.sscrm.controller;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Security integration tests verifying that endpoint access rules,
 * role-based authorization, and the password encoder are correctly configured.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@SuppressWarnings("null")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ─── Public Endpoints ────────────────────────────────────────────────────

    @Test
    void testLoginPage_IsPubliclyAccessible() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk());
    }

    // ─── Protected API Endpoints ─────────────────────────────────────────────

    @Test
    void testApiTickets_WithoutAuth_RedirectsToLogin() throws Exception {
        // Spring Security redirects unauthenticated requests to /login (302)
        // because the app uses session-based auth for the web UI layer.
        // JWT-only APIs would return 401; this hybrid config returns 302.
        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void testAdminEndpoint_WithAgentRole_Returns403() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .with(user("agent1").roles("AGENT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminEndpoint_WithAdminRole_IsAccessible() throws Exception {
        // Admin role should be able to reach admin endpoints (may return 404 if no
        // handler exists, but NOT 401/403 — security passes)
        mockMvc.perform(get("/api/admin/users")
                .with(user("admin").roles("ADMIN")))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertNotEquals(401, status, "Admin should not get 401");
                    assertNotEquals(403, status, "Admin should not get 403");
                });
    }

    // ─── Password Encoder ────────────────────────────────────────────────────

    @Test
    void testPasswordEncoder_IsBCrypt() {
        assertInstanceOf(BCryptPasswordEncoder.class, passwordEncoder,
                "PasswordEncoder bean must be BCryptPasswordEncoder");
    }

    @Test
    void testPasswordEncoder_MatchesEncodedPassword() {
        String rawPassword = "SecurePassword123!";
        String encoded = passwordEncoder.encode(rawPassword);

        assertTrue(passwordEncoder.matches(rawPassword, encoded),
                "BCrypt should correctly verify the raw password against its hash");
        assertFalse(passwordEncoder.matches("WrongPassword", encoded),
                "BCrypt should reject an incorrect password");
    }
}
