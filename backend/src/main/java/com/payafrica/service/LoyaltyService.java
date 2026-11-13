package com.payafrica.service;
import com.payafrica.entity.*; import com.payafrica.repository.*; import com.fasterxml.jackson.core.type.TypeReference; import com.fasterxml.jackson.databind.ObjectMapper; import lombok.RequiredArgsConstructor; import lombok.extern.slf4j.Slf4j; import org.springframework.stereotype.Service; import java.math.BigDecimal; import java.security.SecureRandom; import java.time.Instant; import java.time.temporal.ChronoUnit; import java.util.List; import java.util.Map;
@Service @RequiredArgsConstructor @Slf4j
public class LoyaltyService {
    private final OrderRepository orders; private final VoucherRepository vouchers; private final SettingsService settings; private final ObjectMapper mapper=new ObjectMapper(); private static final SecureRandom RAND=new SecureRandom();
    public void checkAndGenerateVoucher(User client){
        long count=orders.countByClientId(client.getId());
        AppSettings s=settings.get();
        try{
            List<Map<String,Object>> rules=mapper.readValue(s.getVoucherRulesJson(), new TypeReference<>(){});
            for(Map<String,Object> r: rules){
                int minTx=((Number)r.get("minTransactions")).intValue();
                int discount=((Number)r.get("discountPercent")).intValue();
                int expDays=((Number)r.get("expiresInDays")).intValue();
                String reason=minTx+" commandes";
                if(count>=minTx && !vouchers.existsByClientIdAndReason(client.getId(), reason)){
                    String code="FIDELITE-"+minTx+"-"+randomCode(4);
                    Voucher v=Voucher.builder().code(code).client(client).discountPercent(discount).isUsed(false).reason(reason).expiresAt(Instant.now().plus(expDays, ChronoUnit.DAYS)).build();
                    vouchers.save(v);
                    log.info("Voucher généré pour client {}: {} (-{}%) après {} commandes", client.getPhone(), code, discount, minTx);
                }
            }
        }catch(Exception e){log.error("Voucher rules parse error",e);}
    }
    private String randomCode(int len){ String chars="ABCDEFGH123456789"; StringBuilder sb=new StringBuilder(); for(int i=0;i<len;i++) sb.append(chars.charAt(RAND.nextInt(chars.length()))); return sb.toString(); }
    public BigDecimal applyVoucher(String code, User client, BigDecimal subtotal){
        if(code==null || code.isBlank()) return BigDecimal.ZERO;
        var opt=vouchers.findByCode(code.toUpperCase());
        if(opt.isEmpty()) throw new IllegalArgumentException("Code bon invalide");
        Voucher v=opt.get();
        if(!v.getClient().getId().equals(client.getId())) throw new IllegalArgumentException("Ce bon ne vous appartient pas");
        if(v.isUsed()) throw new IllegalArgumentException("Bon déjà utilisé");
        if(v.getExpiresAt()!=null && Instant.now().isAfter(v.getExpiresAt())) throw new IllegalArgumentException("Bon expiré");
        return subtotal.multiply(BigDecimal.valueOf(v.getDiscountPercent())).divide(BigDecimal.valueOf(100));
    }
    public void markVoucherUsed(String code, Long orderId){
        if(code==null) return;
        vouchers.findByCode(code.toUpperCase()).ifPresent(v->{v.setUsed(true); v.setUsedAt(Instant.now()); v.setUsedOrderId(orderId); vouchers.save(v);});
    }
}
