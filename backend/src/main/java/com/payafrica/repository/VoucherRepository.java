package com.payafrica.repository;
import com.payafrica.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findByClientIdOrderByCreatedAtDesc(Long clientId);
    List<Voucher> findByClientIdAndIsUsedFalse(Long clientId);
    Optional<Voucher> findByCode(String code);
    boolean existsByClientIdAndReason(Long clientId, String reason);
}
