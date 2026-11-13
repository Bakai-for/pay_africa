package com.payafrica.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity @Table(name="terms_acceptances", uniqueConstraints=@UniqueConstraint(columnNames={"user_id","termsVersion"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TermsAcceptance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id", nullable=false)
    private User user;

    private String termsVersion;

    @CreationTimestamp private Instant acceptedAt;
    private String ipAddress;
}
