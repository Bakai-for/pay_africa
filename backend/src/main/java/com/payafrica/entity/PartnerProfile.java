package com.payafrica.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.Instant;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity @Table(name = "partner_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PartnerProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name="user_id", unique = true, nullable = false)
    private User user;

    @Column(nullable = false)
    private String shopName;

    @Column(length = 2000)
    private String description;

    private String address;
    private String city;
    private Double gpsLat;
    private Double gpsLng;
    private String phoneContact;
    private String logoUrl;

    @Builder.Default
    private boolean isValidated = false; // Admin doit valider

    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal totalEarnings = BigDecimal.ZERO; // Net à reverser

    @Builder.Default
    private BigDecimal totalCommissionPaid = BigDecimal.ZERO;

    @CreationTimestamp private Instant createdAt;
    @UpdateTimestamp private Instant updatedAt;
}
