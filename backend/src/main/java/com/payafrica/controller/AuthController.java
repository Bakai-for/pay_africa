package com.payafrica.controller;
import com.payafrica.dto.AuthDto; import com.payafrica.entity.*; import com.payafrica.repository.*; import com.payafrica.security.JwtService; import lombok.RequiredArgsConstructor; import org.springframework.http.ResponseEntity; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
@RestController @RequestMapping("/api/v1/auth") @RequiredArgsConstructor
public class AuthController {
    private final UserRepository users; private final PartnerProfileRepository partners; private final TermsAcceptanceRepository termsRepo; private final AppSettingsRepository settingsRepo; private final PasswordEncoder enc; private final JwtService jwt;
    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest req){
        String phone=req.getPhone().replaceAll("[^0-9]","");
        if(users.existsByPhone(phone)) throw new IllegalArgumentException("Numéro déjà utilisé");
        if(!req.isTermsAccepted()) throw new IllegalArgumentException("Vous devez accepter les CGU et la politique de confidentialité");
        String role=req.getRole()!=null? req.getRole().toUpperCase():"CLIENT";
        if(!role.matches("CLIENT|PARTNER")) role="CLIENT";
        User.Role r=User.Role.valueOf(role);
        AppSettings s=settingsRepo.findById(1L).orElse(null);
        String termsVer=s!=null? s.getTermsVersion():"v1";
        User u=User.builder().phone(phone).fullName(req.getFullName()).pinHash(enc.encode(req.getPin())).country(req.getCountry()!=null? req.getCountry().toUpperCase():"CM").role(r).termsAccepted(true).termsVersionAccepted(termsVer).termsAcceptedAt(java.time.Instant.now()).build();
        u=users.save(u);
        // Si PARTNER, créer PartnerProfile
        if(r==User.Role.PARTNER){
            if(req.getShopName()==null || req.getShopName().isBlank()) throw new IllegalArgumentException("Nom de boutique requis pour un compte partenaire");
            PartnerProfile p=PartnerProfile.builder().user(u).shopName(req.getShopName()).address(req.getAddress()).city(req.getCity()!=null? req.getCity():"Yaoundé").isValidated(false).build();
            partners.save(p);
        }
        // Enregistrer acceptation CGU
        if(termsVer!=null) termsRepo.save(TermsAcceptance.builder().user(u).termsVersion(termsVer).build());
        String token=jwt.generate(u.getId(), u.getPhone(), u.getRole().name());
        return ResponseEntity.ok(AuthDto.AuthResponse.builder().token(token).userId(u.getId()).phone(u.getPhone()).fullName(u.getFullName()).role(u.getRole().name()).termsAccepted(true).termsVersion(termsVer).build());
    }
    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest req){
        String phone=req.getPhone().replaceAll("[^0-9]","");
        User u=users.findByPhone(phone).orElseThrow(()->new IllegalArgumentException("Numéro ou PIN incorrect"));
        if(!enc.matches(req.getPin(), u.getPinHash())) throw new IllegalArgumentException("Numéro ou PIN incorrect");
        String token=jwt.generate(u.getId(), u.getPhone(), u.getRole().name());
        return ResponseEntity.ok(AuthDto.AuthResponse.builder().token(token).userId(u.getId()).phone(u.getPhone()).fullName(u.getFullName()).role(u.getRole().name()).termsAccepted(u.isTermsAccepted()).termsVersion(u.getTermsVersionAccepted()).build());
    }
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestAttribute(value="user", required=false) User dummy, @org.springframework.security.core.annotation.AuthenticationPrincipal User user){
        var auth=org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if(auth==null || !(auth.getPrincipal() instanceof User)) return ResponseEntity.status(401).build();
        User u=(User)auth.getPrincipal();
        return ResponseEntity.ok(AuthDto.AuthResponse.builder().token(null).userId(u.getId()).phone(u.getPhone()).fullName(u.getFullName()).role(u.getRole().name()).termsAccepted(u.isTermsAccepted()).termsVersion(u.getTermsVersionAccepted()).build());
    }
}
