package com.payafrica.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity @Table(name="app_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppSettings {
    @Id private Long id = 1L; // singleton

    @Column(columnDefinition="TEXT")
    private String voucherRulesJson; // [{"minTransactions":5,"discountPercent":5,"expiresInDays":30},...]

    @Builder.Default
    private Double commissionPercent = 1.5;

    @Builder.Default
    private Integer pcFixedCommission = 500; // commission fixe pour type PC (modifiable admin)

    @Builder.Default
    private String pcCategoryName = "PC"; // nom du type à commission fixe

    @Column(columnDefinition="TEXT")
    private String cguContent; // HTML

    @Column(columnDefinition="TEXT")
    private String privacyContent; // HTML

    private String termsVersion; // v1, v2...

    @Builder.Default private boolean maintenance = false;
}
