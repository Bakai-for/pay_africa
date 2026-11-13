package com.payafrica.controller;
import com.payafrica.dto.OrderDto; import com.payafrica.dto.PartnerDto; import com.payafrica.entity.*; import com.payafrica.repository.*; import com.payafrica.service.SettingsService; import lombok.RequiredArgsConstructor; import org.springframework.data.domain.PageRequest; import org.springframework.data.domain.Sort; import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal; import java.util.Map;
@RestController @RequestMapping("/api/v1/admin") @RequiredArgsConstructor
public class AdminController {
    private final SettingsService settingsService; private final UserRepository users; private final PartnerProfileRepository partners; private final OrderRepository orders; private final ProductRepository products; private final ProductCategoryRepository cats; private final AppSettingsRepository appSettingsRepo;
    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(){ var s=settingsService.get(); return ResponseEntity.ok(Map.of("commissionPercent", s.getCommissionPercent()!=null?s.getCommissionPercent():1.5, "pcFixedCommission", s.getPcFixedCommission()!=null?s.getPcFixedCommission():500, "pcCategoryName", s.getPcCategoryName()!=null?s.getPcCategoryName():"PC", "voucherRulesJson", s.getVoucherRulesJson()!=null? s.getVoucherRulesJson():"[]", "termsVersion", s.getTermsVersion()!=null? s.getTermsVersion():"v1", "cgu", s.getCguContent()!=null? s.getCguContent():"", "privacy", s.getPrivacyContent()!=null? s.getPrivacyContent():"")); }
    @PutMapping("/settings")
    public ResponseEntity<?> update(@RequestBody OrderDto.UpdateSettings req){
        var s=settingsService.get();
        if(req.getCommissionPercent()!=null) s.setCommissionPercent(req.getCommissionPercent());
        if(req.getPcFixedCommission()!=null) s.setPcFixedCommission(req.getPcFixedCommission());
        if(req.getPcCategoryName()!=null) s.setPcCategoryName(req.getPcCategoryName());
        if(req.getVoucherRulesJson()!=null) s.setVoucherRulesJson(req.getVoucherRulesJson());
        if(req.getCguContent()!=null) s.setCguContent(req.getCguContent());
        if(req.getPrivacyContent()!=null) s.setPrivacyContent(req.getPrivacyContent());
        // bump version if CGU changed
        if(req.getCguContent()!=null || req.getPrivacyContent()!=null) s.setTermsVersion("v"+(System.currentTimeMillis()/1000));
        return ResponseEntity.ok(appSettingsRepo.save(s));
    }
    @GetMapping("/partners")
    public ResponseEntity<?> listPartners(@RequestParam(defaultValue="false") boolean onlyPending){
        if(onlyPending) return ResponseEntity.ok(partners.findByIsValidated(false));
        return ResponseEntity.ok(partners.findAll());
    }
    @PatchMapping("/partners/{id}/validate")
    public ResponseEntity<?> validate(@PathVariable Long id, @RequestBody Map<String,Boolean> body){
        var p=partners.findById(id).orElseThrow(); p.setValidated(body.getOrDefault("validated", true)); partners.save(p);
        return ResponseEntity.ok(p);
    }
    @GetMapping("/orders")
    public ResponseEntity<?> allOrders(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size){
        return ResponseEntity.ok(orders.findAllByOrderByCreatedAtDesc(PageRequest.of(page,size, Sort.by("createdAt").descending())));
    }
    @GetMapping("/stats")
    public ResponseEntity<PartnerDto.StatsResponse> stats(){
        long totalOrders=orders.count();
        BigDecimal totalRevenue=orders.findAll().stream().map(o->o.getTotal()!=null? o.getTotal():BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCommission=orders.findAll().stream().map(o->o.getCommission()!=null? o.getCommission():BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        return ResponseEntity.ok(PartnerDto.StatsResponse.builder().totalOrders(totalOrders).totalRevenue(totalRevenue).totalCommission(totalCommission).adminEarnings(totalCommission).totalProducts(products.count()).totalPartners(partners.count()).totalClients(users.countByRole(User.Role.CLIENT)).build());
    }
    @GetMapping("/users")
    public ResponseEntity<?> users(){ return ResponseEntity.ok(users.findAll()); }
    @GetMapping("/activities")
    public ResponseEntity<?> activities(){
        var allOrders=orders.findAllByOrderByCreatedAtDesc(PageRequest.of(0,100, Sort.by("createdAt").descending())).getContent();
        var allProducts=products.findAllByOrderByCreatedAtDesc(PageRequest.of(0,100, Sort.by("createdAt").descending())).getContent();
        var allPartners=partners.findAll();
        var allUsers=users.findAll();
        var byClient = allOrders.stream().collect(java.util.stream.Collectors.groupingBy(o-> o.getClient().getFullName()+" ("+o.getClient().getPhone()+")", java.util.stream.Collectors.counting()));
        var byPartner = allOrders.stream().collect(java.util.stream.Collectors.groupingBy(o-> o.getPartner().getShopName(), java.util.stream.Collectors.counting()));
        var byStatus = allOrders.stream().collect(java.util.stream.Collectors.groupingBy(o-> o.getStatus().name(), java.util.stream.Collectors.counting()));
        var m=new java.util.LinkedHashMap<String,Object>();
        m.put("totalOrders", allOrders.size());
        m.put("totalProducts", allProducts.size());
        m.put("totalPartners", allPartners.size());
        m.put("totalUsers", allUsers.size());
        m.put("pendingProducts", products.findByIsValidatedFalse().size());
        m.put("pendingPartners", partners.findByIsValidated(false).size());
        m.put("ordersByClient", byClient);
        m.put("ordersByPartner", byPartner);
        m.put("ordersByStatus", byStatus);
        m.put("recentOrders", allOrders.stream().limit(10).map(o-> Map.of("ref",o.getReference(),"shop",o.getPartner().getShopName(),"client",o.getClient().getFullName(),"total",o.getTotal(),"status",o.getStatus().name())).toList());
        m.put("recentProducts", allProducts.stream().limit(10).map(p-> Map.of("name",p.getName(),"shop",p.getPartner().getShopName(),"validated",p.isValidated())).toList());
        return ResponseEntity.ok(m);
    }

    // === Gestion produits / publications ===
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id){
        var p=products.findById(id).orElseThrow(()->new IllegalArgumentException("Produit non trouvé"));
        products.delete(p);
        return ResponseEntity.ok(Map.of("ok",true,"message","Publication retirée"));
    }
    @PatchMapping("/products/{id}/toggle")
    public ResponseEntity<?> toggleProduct(@PathVariable Long id){
        var p=products.findById(id).orElseThrow();
        p.setActive(!p.isActive());
        return ResponseEntity.ok(products.save(p));
    }
    @DeleteMapping("/partners/{id}")
    public ResponseEntity<?> deletePartner(@PathVariable Long id){
        var p=partners.findById(id).orElseThrow(()->new IllegalArgumentException("Fournisseur non trouvé"));
        // Supprimer produits et catégories puis profil
        var prods=products.findByPartnerIdAndIsActiveTrue(id);
        products.deleteAll(prods);
        partners.delete(p);
        // Optionnel: désactiver l'utilisateur mais garder l'historique
        return ResponseEntity.ok(Map.of("ok",true,"message","Fournisseur retiré, ses publications supprimées"));
    }
    @PostMapping("/partners/{id}/categories")
    public ResponseEntity<?> addCategoryToPartner(@PathVariable Long id, @RequestBody Map<String,String> body){
        var p=partners.findById(id).orElseThrow();
        String name=body.get("name"); String icon=body.getOrDefault("icon","📦");
        if(name==null||name.isBlank()) throw new IllegalArgumentException("Nom catégorie requis");
        var c=cats.save(com.payafrica.entity.ProductCategory.builder().partner(p).name(name).icon(icon).build());
        return ResponseEntity.ok(c);
    }
    @PostMapping("/partners/{id}/products")
    public ResponseEntity<?> addProductToPartner(@PathVariable Long id, @RequestBody com.payafrica.dto.ProductDto.CreateProduct req){
        var p=partners.findById(id).orElseThrow();
        com.payafrica.entity.ProductCategory cat=null;
        if(req.getCategoryId()!=null) cat=cats.findById(req.getCategoryId()).orElse(null);
        var prod=products.save(com.payafrica.entity.Product.builder().partner(p).category(cat).name(req.getName()).description(req.getDescription()).price(req.getPrice()).currency(req.getCurrency()!=null?req.getCurrency():"XAF").stock(req.getStock()!=null?req.getStock():100).imageUrl(req.getImageUrl()).isActive(true).isValidated(true).build());
        return ResponseEntity.ok(prod);
    }
    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String,Integer> body){
        var p=products.findById(id).orElseThrow();
        Integer stock=body.get("stock");
        Integer add=body.get("add");
        if(add!=null) p.setStock((p.getStock()!=null?p.getStock():0)+add);
        else if(stock!=null) p.setStock(stock);
        return ResponseEntity.ok(products.save(p));
    }
    @GetMapping("/products")
    public ResponseEntity<?> listProducts(@RequestParam(defaultValue="false") boolean onlyPending){
        if(onlyPending) return ResponseEntity.ok(products.findByIsValidatedFalse());
        return ResponseEntity.ok(products.findAllByOrderByCreatedAtDesc(PageRequest.of(0,100, Sort.by("createdAt").descending())).getContent());
    }
    @PatchMapping("/products/{id}/validate")
    public ResponseEntity<?> validateProduct(@PathVariable Long id, @RequestBody Map<String,Boolean> body){
        var p=products.findById(id).orElseThrow(()->new IllegalArgumentException("Produit non trouvé"));
        boolean v=body.getOrDefault("validated", true);
        p.setValidated(v);
        // si validé, activer aussi
        if(v) p.setActive(true);
        products.save(p);
        return ResponseEntity.ok(Map.of("ok",true,"validated",v,"message", v? "Article approuvé ✅ — visible aux clients":"Article retiré de la validation"));
    }
}
