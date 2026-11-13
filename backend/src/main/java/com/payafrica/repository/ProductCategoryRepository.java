package com.payafrica.repository;
import com.payafrica.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    List<ProductCategory> findByPartnerId(Long partnerId);
}
