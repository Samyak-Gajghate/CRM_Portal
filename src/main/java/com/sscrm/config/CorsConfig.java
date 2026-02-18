package com.sscrm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow requests from React frontend (Vercel & Localhost)
        String allowedOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        } else {
            config.setAllowedOrigins(List.of("http://localhost:5173"));
        }

        // Allow standard HTTP methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow necessary headers
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));

        // Allow credentials (needed for cookies/auth if used)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
