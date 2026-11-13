package com.payafrica;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
@SpringBootApplication @EnableAsync
public class PayAfricaMarketplaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PayAfricaMarketplaceApplication.class, args);
        System.out.println("\n=== PayAfrica MARKETPLACE V2 démarrée ===");
        System.out.println("API: http://localhost:8080");
        System.out.println("Swagger: http://localhost:8080/swagger-ui.html");
        System.out.println("========================================\n");
    }
}
