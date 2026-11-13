package com.payafrica.config;
import com.payafrica.entity.*;
import com.payafrica.repository.*;
import lombok.RequiredArgsConstructor; import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
@Configuration @RequiredArgsConstructor @Slf4j
public class DataSeeder {
    private final UserRepository users; private final PartnerProfileRepository partners;
    private final ProductCategoryRepository cats; private final ProductRepository products;
    private final AppSettingsRepository settings; private final PasswordEncoder enc;
    @Bean CommandLineRunner seed(){
        return args->{
            if(users.count()>0){log.info("Seed exist");return;}
            // Admin propriétaire
            User admin=users.save(User.builder().phone("237699999999").fullName("Admin PayAfrica").pinHash(enc.encode("1234")).country("CM").role(User.Role.ADMIN).termsAccepted(true).termsVersionAccepted("v1").build());
            // Partenaire 1
            User p1u=users.save(User.builder().phone("237699111222").fullName("Amina Boutique").pinHash(enc.encode("1234")).country("CM").role(User.Role.PARTNER).termsAccepted(true).termsVersionAccepted("v1").build());
            PartnerProfile p1=partners.save(PartnerProfile.builder().user(p1u).shopName("Boutique Amina - Yaoundé Bastos").description("Alimentation & cosmétiques, livraison Yaoundé").address("Bastos, Yaoundé").city("Yaoundé").gpsLat(3.868).gpsLng(11.521).phoneContact("237699111222").isValidated(true).build());
            ProductCategory c1=cats.save(ProductCategory.builder().partner(p1).name("Alimentation").icon("🛒").build());
            ProductCategory c2=cats.save(ProductCategory.builder().partner(p1).name("Cosmétiques").icon("💄").build());
            products.save(Product.builder().partner(p1).category(c1).name("Riz 25kg - Nouricia").price(new BigDecimal("18500")).currency("XAF").stock(50).imageUrl("https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400").description("Riz parfumé 25kg, import qualité").isActive(true).isValidated(true).build());
            products.save(Product.builder().partner(p1).category(c1).name("Huile Mayor 5L").price(new BigDecimal("7500")).currency("XAF").stock(100).imageUrl("https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400").description("Huile végétale 5L").isActive(true).isValidated(true).build());
            products.save(Product.builder().partner(p1).category(c2).name("Lait corporel Mixte").price(new BigDecimal("3500")).currency("XAF").stock(80).imageUrl("https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400").description("Lait éclaircissant 500ml").isActive(true).isValidated(true).build());
            // Partenaire 2 Tchad
            User p2u=users.save(User.builder().phone("235660111222").fullName("Moussa Tchad Shop").pinHash(enc.encode("1234")).country("TD").role(User.Role.PARTNER).termsAccepted(true).termsVersionAccepted("v1").build());
            PartnerProfile p2=partners.save(PartnerProfile.builder().user(p2u).shopName("Moussa Shop - N'Djamena").description("Électronique & téléphonie").address("Avenue Charles de Gaulle").city("N'Djamena").phoneContact("235660111222").isValidated(true).build());
            ProductCategory c3=cats.save(ProductCategory.builder().partner(p2).name("Téléphonie").icon("📱").build());
            ProductCategory cPC=cats.save(ProductCategory.builder().partner(p2).name("PC").icon("💻").build());
            products.save(Product.builder().partner(p2).category(c3).name("Tecno Spark 20").price(new BigDecimal("85000")).currency("XAF").stock(20).imageUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400").description("Smartphone 128Go, 8Go RAM").isActive(true).isValidated(true).build());
            products.save(Product.builder().partner(p2).category(cPC).name("PC HP EliteBook 14\"").price(new BigDecimal("350000")).currency("XAF").stock(10).imageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400").description("PC portable 16Go/512Go, commission fixe 500 XAF (type PC)").isActive(true).isValidated(true).build());
            // Partenaire en attente pour démo validation
            User p3u=users.save(User.builder().phone("237698000111").fullName("Koffi EnAttente").pinHash(enc.encode("1234")).country("CM").role(User.Role.PARTNER).termsAccepted(true).termsVersionAccepted("v1").build());
            partners.save(PartnerProfile.builder().user(p3u).shopName("Koffi Shop - Douala (en attente)").description("En attente de validation").address("Douala Akwa").city("Douala").phoneContact("237698000111").isValidated(false).build());
            // Client
            users.save(User.builder().phone("237690333444").fullName("Jean Client Yaoundé").pinHash(enc.encode("1234")).country("CM").role(User.Role.CLIENT).termsAccepted(true).termsVersionAccepted("v1").build());
            users.save(User.builder().phone("237698765432").fullName("Fatou Client").pinHash(enc.encode("1234")).country("CM").role(User.Role.CLIENT).termsAccepted(true).termsVersionAccepted("v1").build());
            // Settings
            settings.save(AppSettings.builder().id(1L).commissionPercent(1.5).pcFixedCommission(500).pcCategoryName("PC").voucherRulesJson("[{\"minTransactions\":5,\"discountPercent\":5,\"expiresInDays\":30},{\"minTransactions\":10,\"discountPercent\":10,\"expiresInDays\":60},{\"minTransactions\":20,\"discountPercent\":15,\"expiresInDays\":90}]").termsVersion("v1").cguContent("<h1>CGU PayAfrica Marketplace</h1><p>Bienvenue sur PayAfrica...</p>").privacyContent("<h1>Politique de confidentialité</h1><p>Vos données...</p>").build());
            log.info("Seed V3 OK: 2 partenaires validés + 1 en attente, 6 produits (dont PC fixe 500), 2 clients");
        };
    }
}
