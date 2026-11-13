package com.payafrica.repository;
import com.payafrica.entity.PartnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface PartnerProfileRepository extends JpaRepository<PartnerProfile, Long> {
    Optional<PartnerProfile> findByUserId(Long userId);
    List<PartnerProfile> findByIsValidated(boolean validated);
    List<PartnerProfile> findAllByIsValidatedTrue();
}
