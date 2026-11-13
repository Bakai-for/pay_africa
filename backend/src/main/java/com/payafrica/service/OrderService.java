package com.payafrica.service;
import com.payafrica.dto.OrderDto; import com.payafrica.entity.*; import com.payafrica.repository.*; import lombok.RequiredArgsConstructor; import lombok.extern.slf4j.Slf4j; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal; import java.math.RoundingMode; import java.security.SecureRandom; import java.time.Instant; import java.util.*;
@Service @RequiredArgsConstructor @Slf4j
public class OrderService {
    private final OrderRepository orderRepo; private final ProductRepository productRepo; private final PartnerProfileRepository partnerRepo;
    private final AppSettingsRepository appSettingsRepo; private final VoucherRepository voucherRepo; private final LoyaltyService loyaltyService;
    private static final SecureRandom RAND=new SecureRandom();
    @Transactional
    public Order placeOrder(User client, OrderDto.PlaceOrderRequest req){
        if(req.getItems()==null || req.getItems().isEmpty()) throw new IllegalArgumentException("Panier vide");
        // Tous les articles doivent appartenir au même partenaire (MVP : 1 commande = 1 boutique)
        Product first=productRepo.findById(req.getItems().get(0).getProductId()).orElseThrow(()->new IllegalArgumentException("Produit non trouvé"));
        Long partnerId=first.getPartner().getId();
        PartnerProfile partner=partnerRepo.findById(partnerId).orElseThrow();
        if(!partner.isValidated()) throw new IllegalArgumentException("Boutique non validée par l'admin");
        List<OrderItem> items=new ArrayList<>(); BigDecimal subtotal=BigDecimal.ZERO;
        for(OrderDto.CartItem ci: req.getItems()){
            Product p=productRepo.findById(ci.getProductId()).orElseThrow(()->new IllegalArgumentException("Produit "+ci.getProductId()+" introuvable"));
            if(!p.getPartner().getId().equals(partnerId)) throw new IllegalArgumentException("Tous les articles doivent être de la même boutique (panier multi-boutique à venir)");
            if(!p.isActive()) throw new IllegalArgumentException("Produit "+p.getName()+" indisponible");
            if(!p.isValidated()) throw new IllegalArgumentException("Article '"+p.getName()+"' en attente de validation par l'admin — non achetable");
            if(p.getStock()!=null && p.getStock()<ci.getQuantity()) throw new IllegalArgumentException("Stock insuffisant pour "+p.getName());
            BigDecimal line=p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal=subtotal.add(line);
            OrderItem oi=OrderItem.builder().product(p).productName(p.getName()).unitPrice(p.getPrice()).quantity(ci.getQuantity()).subtotal(line).build();
            items.add(oi);
        }
        // Voucher
        BigDecimal discount=BigDecimal.ZERO;
        if(req.getVoucherCode()!=null && !req.getVoucherCode().isBlank()){
            var vOpt=voucherRepo.findByCode(req.getVoucherCode().toUpperCase());
            if(vOpt.isPresent()){
                Voucher v=vOpt.get();
                if(v.getClient().getId().equals(client.getId()) && !v.isUsed() && (v.getExpiresAt()==null || Instant.now().isBefore(v.getExpiresAt()))){
                    discount=subtotal.multiply(BigDecimal.valueOf(v.getDiscountPercent())).divide(BigDecimal.valueOf(100),2,RoundingMode.HALF_UP);
                } else {
                    throw new IllegalArgumentException("Bon invalide ou déjà utilisé");
                }
            } else throw new IllegalArgumentException("Code bon invalide");
        }
        BigDecimal total=subtotal.subtract(discount);
        if(total.compareTo(BigDecimal.valueOf(100))<0) throw new IllegalArgumentException("Montant minimum 100 XAF/NGN");
        // Commission : % par défaut, mais type PC = commission fixe 500 par unité (modifiable admin)
        AppSettings settings=appSettingsRepo.findById(1L).orElse(AppSettings.builder().id(1L).commissionPercent(1.5).pcFixedCommission(500).pcCategoryName("PC").build());
        double pct=settings.getCommissionPercent()!=null? settings.getCommissionPercent():1.5;
        int pcFixed=settings.getPcFixedCommission()!=null? settings.getPcFixedCommission():500;
        String pcName=settings.getPcCategoryName()!=null? settings.getPcCategoryName():"PC";
        BigDecimal commission;
        // Calcul mixte : PC = fixe par unité, autres = % sur leur part après remise
        if(subtotal.compareTo(BigDecimal.ZERO)>0){
            BigDecimal discountRatio = subtotal.compareTo(BigDecimal.ZERO)>0 ? discount.divide(subtotal,4,RoundingMode.HALF_UP) : BigDecimal.ZERO;
            BigDecimal commPC=BigDecimal.ZERO; BigDecimal commOther=BigDecimal.ZERO;
            for(int i=0;i<items.size();i++){
                OrderDto.CartItem ci=req.getItems().get(i);
                Product p=productRepo.findById(ci.getProductId()).get();
                BigDecimal line=items.get(i).getSubtotal();
                BigDecimal discountedLine=line.subtract(line.multiply(discountRatio));
                boolean isPC = p.getCategory()!=null && p.getCategory().getName()!=null && p.getCategory().getName().equalsIgnoreCase(pcName);
                if(isPC){
                    commPC=commPC.add(BigDecimal.valueOf((long)pcFixed * ci.getQuantity()));
                } else {
                    commOther=commOther.add(discountedLine.multiply(BigDecimal.valueOf(pct)).divide(BigDecimal.valueOf(100),2,RoundingMode.HALF_UP));
                }
            }
            commission=commPC.add(commOther);
            // Plafonner commission à total
            if(commission.compareTo(total)>0) commission=total.multiply(BigDecimal.valueOf(0.9)); // sécurité
        } else {
            commission=total.multiply(BigDecimal.valueOf(pct)).divide(BigDecimal.valueOf(100),2,RoundingMode.HALF_UP);
        }
        BigDecimal netToPartner=total.subtract(commission);
        String currency=first.getCurrency()!=null? first.getCurrency():"XAF";
        String ref="CMD-"+random(6);
        Order order=Order.builder().reference(ref).client(client).partner(partner).subtotal(subtotal).discount(discount).total(total).commission(commission).netToPartner(netToPartner).currency(currency).voucherCode(req.getVoucherCode()!=null? req.getVoucherCode().toUpperCase():null).status(Order.OrderStatus.PENDING_PAYMENT).operator(req.getOperator()!=null? req.getOperator().toLowerCase():null).clientPhone(req.getClientPhone()).deliveryAddress(req.getDeliveryAddress()).notes(req.getNotes()).build();
        order=orderRepo.save(order);
        // Sauver items
        for(OrderItem oi: items){ oi.setOrder(order); }
        // On doit persister via order cascade - mais items pas encore sauvés, on les sauve via order
        order.setItems(items);
        order=orderRepo.save(order);
        // Décrémenter stock
        for(OrderDto.CartItem ci: req.getItems()){
            Product p=productRepo.findById(ci.getProductId()).get();
            if(p.getStock()!=null) p.setStock(p.getStock()-ci.getQuantity());
            productRepo.save(p);
        }
        // Simuler paiement Mobile Money (MOCK) - en prod appeler CinetPay/Flutterwave
        // Pour MVP, on simule succès immédiat si opérateur connu, sinon pending
        boolean isMockSuccess = req.getOperator()!=null && req.getOperator().matches("mtn_cm|orange_cm|airtel_td|moov_td|mtn_ng|airtel_ng|glo_ng");
        // Simuler échec si numéro se termine par 9998
        if(req.getClientPhone()!=null && req.getClientPhone().endsWith("9998")){
            order.setStatus(Order.OrderStatus.ECHEC_PAIEMENT); orderRepo.save(order);
            throw new IllegalArgumentException("Paiement échoué: PIN incorrect ou solde insuffisant (simulation - numéro se termine par 9998)");
        }
        if(isMockSuccess){
            order.setStatus(Order.OrderStatus.PAYE);
            order.setProviderReference("MOCK-"+random(8));
            orderRepo.save(order);
            // Marquer voucher utilisé
            if(req.getVoucherCode()!=null) loyaltyService.markVoucherUsed(req.getVoucherCode(), order.getId());
            // Mettre à jour earnings partenaire
            partner.setTotalEarnings(partner.getTotalEarnings().add(netToPartner));
            partner.setTotalCommissionPaid(partner.getTotalCommissionPaid().add(commission));
            partnerRepo.save(partner);
            // Générer bon fidélité si palier atteint
            loyaltyService.checkAndGenerateVoucher(client);
            log.info("Commande {} PAYEE: total {} {} commission {} net {}", ref, total, currency, commission, netToPartner);
        } else {
            order.setStatus(Order.OrderStatus.PENDING_PAYMENT);
            orderRepo.save(order);
        }
        return order;
    }
    private String random(int len){ String chars="ABCDEFGHJKLMNP23456789"; StringBuilder sb=new StringBuilder(); for(int i=0;i<len;i++) sb.append(chars.charAt(RAND.nextInt(chars.length()))); return sb.toString(); }
}
