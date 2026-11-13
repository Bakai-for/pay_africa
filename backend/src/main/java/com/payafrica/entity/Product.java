package com.payafrica.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.Instant;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity @Table(name="products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="partner_id", nullable=false)
    private PartnerProfile partner;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="category_id")
    private ProductCategory category;

    @Column(nullable=false)
    private String name;

    @Column(length=2000)
    private String description;

    @Column(nullable=false, precision=19, scale=2)
    private BigDecimal price; // XAF ou NGN selon partenaire

    @Column(length=3) @Builder.Default
    private String currency = "XAF";

    @Builder.Default
    private Integer stock = 100;

    private String imageUrl;

    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private boolean isValidated = false; // doit être validé par admin seul

    @CreationTimestamp private Instant createdAt;
    @UpdateTimestamp private Instant updatedAt;
}
