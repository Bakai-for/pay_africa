package com.payafrica.controller;
import com.payafrica.dto.PartnerDto; import com.payafrica.entity.*; import com.payafrica.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.http.ResponseEntity; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/v1/partner") @RequiredArgsConstructor
public class PartnerController {
    private final PartnerProfileRepository partners; private final ProductRepository products;
    @GetMapping("/profile")
    public ResponseEntity<?> myProfile(@AuthenticationPrincipal User user){
        var p=partners.findByUserId(user.getId()).orElseThrow(()->new IllegalArgumentException("Profil partenaire non trouvé"));
        return ResponseEntity.ok(toResp(p));
    }
    @PutMapping("/profile")
    public ResponseEntity<?> update(@AuthenticationPrincipal User user, @RequestBody PartnerDto.UpdateProfile req){
        var p=partners.findByUserId(user.getId()).orElseThrow(()->new IllegalArgumentException("Profil non trouvé"));
        if(req.getShopName()!=null) p.setShopName(req.getShopName());
        if(req.getDescription()!=null) p.setDescription(req.getDescription());
        if(req.getAddress()!=null) p.setAddress(req.getAddress());
        if(req.getCity()!=null) p.setCity(req.getCity());
        if(req.getGpsLat()!=null) p.setGpsLat(req.getGpsLat());
        if(req.getGpsLng()!=null) p.setGpsLng(req.getGpsLng());
        if(req.getPhoneContact()!=null) p.setPhoneContact(req.getPhoneContact());
        if(req.getLogoUrl()!=null) p.setLogoUrl(req.getLogoUrl());
        return ResponseEntity.ok(toResp(partners.save(p)));
    }
    @GetMapping("/public/{id}")
    public ResponseEntity<?> publicProfile(@PathVariable Long id){
        var p=partners.findById(id).orElseThrow(()->new IllegalArgumentException("Boutique non trouvée"));
        if(!p.isValidated()) throw new IllegalArgumentException("Boutique non validée");
        return ResponseEntity.ok(toResp(p));
    }
    @GetMapping("/public")
    public ResponseEntity<List<PartnerDto.PartnerResponse>> allPublic(){
        return ResponseEntity.ok(partners.findAllByIsValidatedTrue().stream().map(this::toResp).toList());
    }
    private PartnerDto.PartnerResponse toResp(PartnerProfile p){
        return PartnerDto.PartnerResponse.builder().id(p.getId()).shopName(p.getShopName()).description(p.getDescription()).address(p.getAddress()).city(p.getCity()).gpsLat(p.getGpsLat()).gpsLng(p.getGpsLng()).phoneContact(p.getPhoneContact()).logoUrl(p.getLogoUrl()).isValidated(p.isValidated()).rating(p.getRating()).userId(p.getUser().getId()).ownerPhone(p.getUser().getPhone()).build();
    }
}
