package com.payafrica.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity @Table(name="orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, nullable=false, length=20)
    private String reference; // CMD-XXXX

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="client_id", nullable=false)
    private User client;

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="partner_id", nullable=false)
    private PartnerProfile partner;

    @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval=true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(precision=19, scale=2) private BigDecimal subtotal; // somme articles
    @Column(precision=19, scale=2) @Builder.Default private BigDecimal discount = BigDecimal.ZERO; // bon réduction
    @Column(precision=19, scale=2) private BigDecimal total; // subtotal - discount
    @Column(precision=19, scale=2) private BigDecimal commission; // 1.5% de total
    @Column(precision=19, scale=2) private BigDecimal netToPartner; // total - commission
    @Column(length=3) private String currency;

    private String voucherCode; // code utilisé

    @Enumerated(EnumType.STRING) @Builder.Default
    private OrderStatus status = OrderStatus.PENDING_PAYMENT;

    // Paiement Mobile Money
    private String operator; // mtn_cm, orange_cm...
    private String clientPhone; // numéro qui a payé
    private String providerReference;

    private String deliveryAddress;
    private String notes;

    @CreationTimestamp private Instant createdAt;
    @UpdateTimestamp private Instant updatedAt;

    public enum OrderStatus { PENDING_PAYMENT, PAYE, EN_PREPARATION, LIVRE, ANNULE, ECHEC_PAIEMENT }
}
