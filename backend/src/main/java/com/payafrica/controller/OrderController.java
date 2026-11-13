package com.payafrica.controller;

import com.payafrica.dto.OrderDto;
import com.payafrica.entity.*;
import com.payafrica.repository.*;
import com.payafrica.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final OrderRepository orders;
    private final VoucherRepository vouchers;
    private final PartnerProfileRepository partners;

    @PostMapping("/place")
    public ResponseEntity<?> place(@AuthenticationPrincipal User user, @RequestBody OrderDto.PlaceOrderRequest req){
        if(user.getRole()!=User.Role.CLIENT) throw new IllegalArgumentException("Seul un client peut commander");
        var o=orderService.placeOrder(user, req);
        return ResponseEntity.ok(toResp(o));
    }

    @GetMapping("/my")
    public ResponseEntity<?> myOrders(@AuthenticationPrincipal User user, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size){
        var p=orders.findByClientIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page,size, Sort.by("createdAt").descending()));
        // Client voit facture sans commission
        if(user.getRole()==User.Role.CLIENT) return ResponseEntity.ok(p.map(this::toInvoice));
        return ResponseEntity.ok(p.map(this::toResp));
    }

    @GetMapping("/partner/my")
    public ResponseEntity<?> partnerMyOrders(@AuthenticationPrincipal User user, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size){
        var partner = partners.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Profil partenaire non trouvé"));
        return ResponseEntity.ok(orders.findByPartnerIdOrderByCreatedAtDesc(partner.getId(), PageRequest.of(page,size, Sort.by("createdAt").descending())).map(this::toResp));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id, @AuthenticationPrincipal User user){
        var o=orders.findById(id).orElseThrow(()->new IllegalArgumentException("Commande non trouvée"));
        if(!o.getClient().getId().equals(user.getId()) && !o.getPartner().getUser().getId().equals(user.getId()) && user.getRole()!=User.Role.ADMIN) return ResponseEntity.status(403).build();
        if(user.getRole()==User.Role.CLIENT) return ResponseEntity.ok(toInvoice(o));
        return ResponseEntity.ok(toResp(o));
    }
    @GetMapping("/{id}/invoice")
    public ResponseEntity<?> invoice(@PathVariable Long id, @AuthenticationPrincipal User user){
        var o=orders.findById(id).orElseThrow(()->new IllegalArgumentException("Commande non trouvée"));
        if(!o.getClient().getId().equals(user.getId()) && !o.getPartner().getUser().getId().equals(user.getId()) && user.getRole()!=User.Role.ADMIN) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(toInvoice(o));
    }
    @GetMapping("/history")
    public ResponseEntity<?> history(@AuthenticationPrincipal User user){
        var myOrders=orders.findByClientIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0,100)).getContent();
        var myVouchers=vouchers.findByClientIdOrderByCreatedAtDesc(user.getId());
        if(user.getRole()==User.Role.CLIENT){
            return ResponseEntity.ok(java.util.Map.of("role","CLIENT","orders",myOrders.stream().map(this::toInvoice).toList(),"vouchers",myVouchers,"activities",myOrders.size()+myVouchers.size()));
        }
        // Partner: own orders + products
        try{
            var partner=partners.findByUserId(user.getId()).orElse(null);
            if(partner!=null){
                var pOrders=orders.findByPartnerIdOrderByCreatedAtDesc(partner.getId(), PageRequest.of(0,100)).getContent();
                return ResponseEntity.ok(java.util.Map.of("role","PARTNER","orders",pOrders.stream().map(this::toResp).toList(),"shop",partner.getShopName(),"activities",pOrders.size()));
            }
        }catch(Exception ignored){}
        return ResponseEntity.ok(java.util.Map.of("role",user.getRole().name(),"orders",myOrders.stream().map(this::toResp).toList()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String,String> body, @AuthenticationPrincipal User user){
        var o=orders.findById(id).orElseThrow();
        if(!o.getPartner().getUser().getId().equals(user.getId()) && user.getRole()!=User.Role.ADMIN) return ResponseEntity.status(403).build();
        String s=body.get("status"); o.setStatus(Order.OrderStatus.valueOf(s)); orders.save(o);
        return ResponseEntity.ok(toResp(o));
    }

    @GetMapping("/vouchers/my")
    public ResponseEntity<?> myVouchers(@AuthenticationPrincipal User user){
        return ResponseEntity.ok(vouchers.findByClientIdOrderByCreatedAtDesc(user.getId()).stream().map(v-> OrderDto.VoucherResponse.builder().code(v.getCode()).discountPercent(v.getDiscountPercent()).isUsed(v.isUsed()).expiresAt(v.getExpiresAt()!=null? v.getExpiresAt().toString():null).reason(v.getReason()).build()).toList());
    }

    @PostMapping("/vouchers/apply")
    public ResponseEntity<?> apply(@AuthenticationPrincipal User user, @RequestBody java.util.Map<String,String> body){
        String code=body.get("code"); var v=vouchers.findByCode(code.toUpperCase()).orElseThrow(()->new IllegalArgumentException("Bon invalide"));
        if(!v.getClient().getId().equals(user.getId())) throw new IllegalArgumentException("Bon ne vous appartient pas");
        if(v.isUsed()) throw new IllegalArgumentException("Déjà utilisé");
        return ResponseEntity.ok(OrderDto.VoucherResponse.builder().code(v.getCode()).discountPercent(v.getDiscountPercent()).isUsed(v.isUsed()).expiresAt(v.getExpiresAt()!=null? v.getExpiresAt().toString():null).reason(v.getReason()).build());
    }
    @PostMapping("/{id}/retry")
    public ResponseEntity<?> retry(@PathVariable Long id, @AuthenticationPrincipal User user){
        var o=orders.findById(id).orElseThrow(()->new IllegalArgumentException("Commande non trouvée"));
        if(!o.getClient().getId().equals(user.getId()) && user.getRole()!=User.Role.ADMIN) return ResponseEntity.status(403).build();
        if(o.getStatus()!=Order.OrderStatus.PENDING_PAYMENT && o.getStatus()!=Order.OrderStatus.ECHEC_PAIEMENT) throw new IllegalArgumentException("Seules les commandes en attente ou échouées peuvent être rejouées");
        // Simuler retraitement paiement : si téléphone ne finit pas par 9998 et opérateur connu → PAYE
        boolean ok = o.getOperator()!=null && o.getOperator().matches("mtn_cm|orange_cm|airtel_td|moov_td|mtn_ng|airtel_ng|glo_ng");
        if(o.getClientPhone()!=null && o.getClientPhone().endsWith("9998")) ok=false;
        if(o.getClientPhone()!=null && o.getClientPhone().endsWith("9997")){
            // 9997 = DB bloquée simulée -> on garde PENDING pour montrer gestion blocage
            o.setStatus(Order.OrderStatus.PENDING_PAYMENT);
            orders.save(o);
            return ResponseEntity.ok(java.util.Map.of("status","PENDING_PAYMENT","message","Base de données temporairement indisponible — commande conservée, réessayez dans 30s"));
        }
        if(ok){
            o.setStatus(Order.OrderStatus.PAYE);
            o.setProviderReference("RETRY-"+System.currentTimeMillis());
            orders.save(o);
            // créditer partenaire
            try{
                var partner=o.getPartner();
                partner.setTotalEarnings(partner.getTotalEarnings().add(o.getNetToPartner()));
                partner.setTotalCommissionPaid(partner.getTotalCommissionPaid().add(o.getCommission()));
                partners.save(partner);
            }catch(Exception ignored){}
            return ResponseEntity.ok(toResp(o));
        } else {
            o.setStatus(Order.OrderStatus.ECHEC_PAIEMENT);
            orders.save(o);
            return ResponseEntity.status(402).body(java.util.Map.of("status","ECHEC_PAIEMENT","message","Paiement toujours échoué — vérifiez solde Mobile Money"));
        }
    }

    private OrderDto.OrderResponse toResp(Order o){
        return OrderDto.OrderResponse.builder().id(o.getId()).reference(o.getReference()).shopName(o.getPartner().getShopName()).currency(o.getCurrency()).subtotal(o.getSubtotal()).discount(o.getDiscount()).total(o.getTotal()).commission(o.getCommission()).netToPartner(o.getNetToPartner()).status(o.getStatus().name()).operator(o.getOperator()).createdAt(o.getCreatedAt()!=null? o.getCreatedAt().toString():null).items(o.getItems()!=null? o.getItems().stream().map(i-> OrderDto.OrderItemResponse.builder().productName(i.getProductName()).unitPrice(i.getUnitPrice()).quantity(i.getQuantity()).subtotal(i.getSubtotal()).build()).toList():null).voucherCode(o.getVoucherCode()).clientName(o.getClient().getFullName()).partnerPhone(o.getPartner().getPhoneContact()).build();
    }
    private OrderDto.InvoiceResponse toInvoice(Order o){
        return OrderDto.InvoiceResponse.builder().id(o.getId()).reference(o.getReference()).shopName(o.getPartner().getShopName()).currency(o.getCurrency()).subtotal(o.getSubtotal()).discount(o.getDiscount()).total(o.getTotal()).status(o.getStatus().name()).operator(o.getOperator()).clientPhone(o.getClientPhone()).deliveryAddress(o.getDeliveryAddress()).createdAt(o.getCreatedAt()!=null? o.getCreatedAt().toString():null).items(o.getItems()!=null? o.getItems().stream().map(i-> OrderDto.OrderItemResponse.builder().productName(i.getProductName()).unitPrice(i.getUnitPrice()).quantity(i.getQuantity()).subtotal(i.getSubtotal()).build()).toList():null).voucherCode(o.getVoucherCode()).clientName(o.getClient().getFullName()).build();
    }
}
