package com.payafrica.controller;
import com.payafrica.entity.*; import com.payafrica.repository.*; import com.payafrica.service.SettingsService; import lombok.RequiredArgsConstructor; import org.springframework.http.ResponseEntity; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/v1/terms") @RequiredArgsConstructor
public class TermsController {
    private final SettingsService settingsService; private final TermsAcceptanceRepository termsRepo;
    @GetMapping("/current")
    public ResponseEntity<?> current(){ var s=settingsService.get(); return ResponseEntity.ok(Map.of("version", s.getTermsVersion()!=null? s.getTermsVersion():"v1", "cgu", s.getCguContent()!=null? s.getCguContent():"", "privacy", s.getPrivacyContent()!=null? s.getPrivacyContent():"", "commissionPercent", s.getCommissionPercent())); }
    @PostMapping("/accept")
    public ResponseEntity<?> accept(@AuthenticationPrincipal User user, @RequestBody Map<String,String> body){
        String ver=body.get("version"); if(ver==null) ver=settingsService.get().getTermsVersion();
        if(termsRepo.existsByUserIdAndTermsVersion(user.getId(), ver)) return ResponseEntity.ok(Map.of("message","Déjà accepté"));
        termsRepo.save(TermsAcceptance.builder().user(user).termsVersion(ver).build());
        user.setTermsAccepted(true); user.setTermsVersionAccepted(ver); user.setTermsAcceptedAt(java.time.Instant.now());
        // save via repository - need UserRepository
        return ResponseEntity.ok(Map.of("message","CGU acceptées version "+ver));
    }
}
