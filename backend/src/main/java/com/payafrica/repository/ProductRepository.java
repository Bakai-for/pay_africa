package com.payafrica.repository;
import com.payafrica.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByPartnerId(Long partnerId);
    List<Product> findByPartnerIdAndIsActiveTrue(Long partnerId);
    List<Product> findByIsValidatedFalse();
    List<Product> findByPartnerIdAndIsValidatedFalse(Long partnerId);
    Page<Product> findByIsActiveTrue(Pageable p);
    Page<Product> findByIsActiveTrueAndIsValidatedTrue(Pageable p);
    Page<Product> findByCategoryIdAndIsActiveTrue(Long catId, Pageable p);
    Page<Product> findByCategoryIdAndIsActiveTrueAndIsValidatedTrue(Long catId, Pageable p);
    Page<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable p);
    Page<Product> findByNameContainingIgnoreCaseAndIsActiveTrueAndIsValidatedTrue(String name, Pageable p);
    List<Product> findByPartnerIdAndCategoryId(Long partnerId, Long catId);
    List<Product> findByPartnerIdAndCategoryIdAndIsValidatedTrue(Long partnerId, Long catId);
    // For admin
    Page<Product> findAllByOrderByCreatedAtDesc(Pageable p);
}
