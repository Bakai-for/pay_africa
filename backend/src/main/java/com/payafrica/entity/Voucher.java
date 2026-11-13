package com.payafrica.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.Instant;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity @Table(name="vouchers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Voucher {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, nullable=false, length=20)
    private String code; // FIDELITE-5-AB12

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="client_id", nullable=false)
    private User client;

    private Integer discountPercent; // 5, 10, 15
    @Column(precision=19, scale=2) private BigDecimal discountAmount; // si montant fixe

    @Column(precision=19, scale=2) private BigDecimal minOrderAmount; // commande min

    @Builder.Default private boolean isUsed = false;
    private Instant usedAt;
    private Long usedOrderId;

    private String reason; // "5 commandes", "10 commandes + usage élevé"

    private Instant expiresAt;

    @CreationTimestamp private Instant createdAt;
}
