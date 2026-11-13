package com.payafrica.service;
import com.payafrica.entity.AppSettings; import com.payafrica.repository.AppSettingsRepository; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class SettingsService {
    private final AppSettingsRepository repo;
    public AppSettings get(){ return repo.findById(1L).orElseGet(()-> repo.save(AppSettings.builder().id(1L).commissionPercent(1.5).voucherRulesJson("[{\"minTransactions\":5,\"discountPercent\":5,\"expiresInDays\":30},{\"minTransactions\":10,\"discountPercent\":10,\"expiresInDays\":60}]").termsVersion("v1").cguContent("<h1>CGU PayAfrica Marketplace V2</h1><p>En utilisant PayAfrica, vous acceptez que le propriétaire prélève 1,5% sur chaque article vendu...</p>").privacyContent("<h1>Politique de confidentialité</h1><p>Vos données sont chiffrées...</p>").build())); }
    public AppSettings save(AppSettings s){ return repo.save(s); }
}
