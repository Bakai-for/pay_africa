package com.payafrica.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HomeController {
    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
            "name", "PayAfrica Marketplace V2 API",
            "version", "2.0.0",
            "status", "running",
            "port", 8080,
            "docs", "/swagger-ui.html",
            "apiDocs", "/api-docs",
            "frontend", "https://5173-iek1s3ehz3b12jpyhwrx0.e2b.app (ou ton preview 5173)",
            "endpoints", Map.of(
                "public", new String[]{"/api/v1/products","/api/v1/partner/public","/api/v1/terms/current","/api/v1/auth/register","/api/v1/auth/login"},
                "client", new String[]{"/api/v1/orders/place","/api/v1/orders/my","/api/v1/orders/vouchers/my"},
                "partner", new String[]{"/api/v1/partner/profile","/api/v1/partner/products","/api/v1/orders/partner/my"},
                "admin", new String[]{"/api/v1/admin/settings","/api/v1/admin/stats","/api/v1/admin/partners"}
            )
        );
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "payafrica-marketplace-v2");
    }
}
