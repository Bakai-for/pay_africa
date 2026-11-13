package com.payafrica.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity @Table(name="product_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductCategory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="partner_id", nullable=false)
    private PartnerProfile partner;

    @Column(nullable=false)
    private String name; // ex: Alimentation, Cosmetiques

    private String icon; // emoji ou fa-icon

    @CreationTimestamp private Instant createdAt;
}
