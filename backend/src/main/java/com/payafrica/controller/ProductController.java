package com.payafrica.controller;
import com.payafrica.dto.ProductDto; import com.payafrica.entity.*; import com.payafrica.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.data.domain.PageRequest; import org.springframework.data.domain.Sort; import org.springframework.http.ResponseEntity; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
public class ProductController {
    private final ProductRepository products; private final ProductCategoryRepository cats; private final PartnerProfileRepository partners;
    // PUBLIC - Catalogue (seuls produits validés par admin)
    @GetMapping("/products")
    public ResponseEntity<?> list(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size, @RequestParam(required=false) Long partnerId, @RequestParam(required=false) Long categoryId, @RequestParam(required=false) String q, @AuthenticationPrincipal User user){
        boolean isAdmin = user!=null && user.getRole()==User.Role.ADMIN;
        // Si admin demande, il voit tout (pour gestion), sinon public = validés seulement
        if(q!=null && !q.isBlank()){
            if(isAdmin) return ResponseEntity.ok(products.findByNameContainingIgnoreCaseAndIsActiveTrue(q, PageRequest.of(page,size, Sort.by("createdAt").descending())).map(this::toResp));
            return ResponseEntity.ok(products.findByNameContainingIgnoreCaseAndIsActiveTrueAndIsValidatedTrue(q, PageRequest.of(page,size, Sort.by("createdAt").descending())).map(this::toResp));
        }
        if(partnerId!=null && categoryId!=null){
            if(isAdmin) return ResponseEntity.ok(products.findByPartnerIdAndCategoryId(partnerId, categoryId).stream().map(this::toResp).toList());
            return ResponseEntity.ok(products.findByPartnerIdAndCategoryIdAndIsValidatedTrue(partnerId, categoryId).stream().map(this::toResp).toList());
        }
        if(categoryId!=null){
            if(isAdmin) return ResponseEntity.ok(products.findByCategoryIdAndIsActiveTrue(categoryId, PageRequest.of(page,size)).map(this::toResp));
            return ResponseEntity.ok(products.findByCategoryIdAndIsActiveTrueAndIsValidatedTrue(categoryId, PageRequest.of(page,size)).map(this::toResp));
        }
        if(partnerId!=null){
            // Si le partenaire consulte ses propres produits → voit tous (validés + en attente), sinon client voit validés
            if(user!=null){
                var partnerOpt=partners.findByUserId(user.getId());
                if(partnerOpt.isPresent() && partnerOpt.get().getId().equals(partnerId)) return ResponseEntity.ok(products.findByPartnerId(partnerId).stream().map(this::toResp).toList());
                if(isAdmin) return ResponseEntity.ok(products.findByPartnerId(partnerId).stream().map(this::toResp).toList());
            }
            return ResponseEntity.ok(products.findByPartnerIdAndIsActiveTrue(partnerId).stream().filter(Product::isValidated).map(this::toResp).toList());
        }
        if(isAdmin) return ResponseEntity.ok(products.findByIsActiveTrue(PageRequest.of(page,size, Sort.by("createdAt").descending())).map(this::toResp));
        return ResponseEntity.ok(products.findByIsActiveTrueAndIsValidatedTrue(PageRequest.of(page,size, Sort.by("createdAt").descending())).map(this::toResp));
    }
    @GetMapping("/partner/products")
    public ResponseEntity<?> myProducts(@AuthenticationPrincipal User user){
        var p=partners.findByUserId(user.getId()).orElseThrow(()->new IllegalArgumentException("Profil partenaire requis"));
        return ResponseEntity.ok(products.findByPartnerId(p.getId()).stream().map(this::toResp).toList());
    }
    @GetMapping("/products/{id}")
    public ResponseEntity<?> get(@PathVariable Long id){ return ResponseEntity.ok(toResp(products.findById(id).orElseThrow(()->new IllegalArgumentException("Produit non trouvé")))); }
    @GetMapping("/categories")
    public ResponseEntity<?> categories(@RequestParam(required=false) Long partnerId){
        if(partnerId!=null) return ResponseEntity.ok(cats.findByPartnerId(partnerId));
        return ResponseEntity.ok(cats.findAll());
    }
    @GetMapping("/partners/{partnerId}/categories")
    public ResponseEntity<?> catsByPartner(@PathVariable Long partnerId){ return ResponseEntity.ok(cats.findByPartnerId(partnerId)); }
    // PARTNER - Gestion catalogue
    @PostMapping("/partner/categories")
    public ResponseEntity<?> createCat(@AuthenticationPrincipal User user, @RequestBody ProductDto.CreateCategory req){
        var p=partners.findByUserId(user.getId()).orElseThrow(()->new IllegalArgumentException("Profil partenaire requis"));
        var c=cats.save(ProductCategory.builder().partner(p).name(req.getName()).icon(req.getIcon()).build());
        return ResponseEntity.ok(c);
    }
    @PostMapping("/partner/products")
    public ResponseEntity<?> create(@AuthenticationPrincipal User user, @RequestBody ProductDto.CreateProduct req){
        var p=partners.findByUserId(user.getId()).orElseThrow(()->new IllegalArgumentException("Profil partenaire requis"));
        ProductCategory cat=null; if(req.getCategoryId()!=null) cat=cats.findById(req.getCategoryId()).orElse(null);
        var prod=products.save(Product.builder().partner(p).category(cat).name(req.getName()).description(req.getDescription()).price(req.getPrice()).currency(req.getCurrency()!=null? req.getCurrency():"XAF").stock(req.getStock()!=null? req.getStock():100).imageUrl(req.getImageUrl()).isActive(true).isValidated(false).build());
        return ResponseEntity.ok(toResp(prod));
    }
    @PutMapping("/partner/products/{id}")
    public ResponseEntity<?> update(@AuthenticationPrincipal User user, @PathVariable Long id, @RequestBody ProductDto.UpdateProduct req){
        var p=partners.findByUserId(user.getId()).orElseThrow();
        var prod=products.findById(id).orElseThrow(()->new IllegalArgumentException("Produit non trouvé"));
        if(!prod.getPartner().getId().equals(p.getId())) return ResponseEntity.status(403).body(java.util.Map.of("error","Non autorisé"));
        if(req.getName()!=null) prod.setName(req.getName());
        if(req.getDescription()!=null) prod.setDescription(req.getDescription());
        if(req.getPrice()!=null) prod.setPrice(req.getPrice());
        if(req.getStock()!=null) prod.setStock(req.getStock());
        if(req.getImageUrl()!=null) prod.setImageUrl(req.getImageUrl());
        if(req.getIsActive()!=null) prod.setActive(req.getIsActive());
        if(req.getCategoryId()!=null) prod.setCategory(cats.findById(req.getCategoryId()).orElse(null));
        return ResponseEntity.ok(toResp(products.save(prod)));
    }
    @DeleteMapping("/partner/products/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal User user, @PathVariable Long id){
        var p=partners.findByUserId(user.getId()).orElseThrow();
        var prod=products.findById(id).orElseThrow();
        if(!prod.getPartner().getId().equals(p.getId())) return ResponseEntity.status(403).build();
        prod.setActive(false); products.save(prod); return ResponseEntity.ok(java.util.Map.of("message","Produit désactivé"));
    }
    @PatchMapping("/partner/products/{id}/stock")
    public ResponseEntity<?> incStock(@AuthenticationPrincipal User user, @PathVariable Long id, @RequestBody java.util.Map<String,Integer> body){
        var p=partners.findByUserId(user.getId()).orElseThrow();
        var prod=products.findById(id).orElseThrow();
        if(!prod.getPartner().getId().equals(p.getId())) return ResponseEntity.status(403).body(java.util.Map.of("error","Non autorisé"));
        Integer add=body.get("add"); Integer stock=body.get("stock");
        if(add!=null) prod.setStock((prod.getStock()!=null?prod.getStock():0)+add);
        else if(stock!=null) prod.setStock(stock);
        else return ResponseEntity.badRequest().body(java.util.Map.of("error","add ou stock requis"));
        return ResponseEntity.ok(toResp(products.save(prod)));
    }
    private ProductDto.ProductResponse toResp(Product pr){
        return ProductDto.ProductResponse.builder().id(pr.getId()).name(pr.getName()).description(pr.getDescription()).price(pr.getPrice()).currency(pr.getCurrency()).stock(pr.getStock()).imageUrl(pr.getImageUrl()).isActive(pr.isActive()).isValidated(pr.isValidated()).partnerId(pr.getPartner().getId()).partnerShopName(pr.getPartner().getShopName()).categoryId(pr.getCategory()!=null? pr.getCategory().getId():null).categoryName(pr.getCategory()!=null? pr.getCategory().getName():null).build();
    }
}
