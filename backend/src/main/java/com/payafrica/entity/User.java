package com.payafrica.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity @Table(name = "users", indexes = @Index(name="idx_user_phone", columnList="phone", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(nullable = false)
    private String fullName;

    @JsonIgnore
    @Column(nullable = false)
    private String pinHash;

    @Column(length = 2, nullable = false)
    private String country; // CM, TD, NG

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.CLIENT;

    @Builder.Default
    private boolean termsAccepted = false;
    private String termsVersionAccepted;
    private Instant termsAcceptedAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private KycLevel kycLevel = KycLevel.LEVEL_0;

    @CreationTimestamp private Instant createdAt;
    @UpdateTimestamp private Instant updatedAt;

    public enum Role { CLIENT, PARTNER, ADMIN }
    public enum KycLevel { LEVEL_0, LEVEL_1, LEVEL_2 }
}
