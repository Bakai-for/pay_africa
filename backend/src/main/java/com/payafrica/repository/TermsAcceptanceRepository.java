package com.payafrica.repository;
import com.payafrica.entity.TermsAcceptance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface TermsAcceptanceRepository extends JpaRepository<TermsAcceptance, Long> {
    Optional<TermsAcceptance> findByUserIdAndTermsVersion(Long userId, String version);
    boolean existsByUserIdAndTermsVersion(Long userId, String version);
}
