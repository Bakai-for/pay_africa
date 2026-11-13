package com.payafrica.repository;
import com.payafrica.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByClientIdOrderByCreatedAtDesc(Long clientId, Pageable p);
    Page<Order> findByPartnerIdOrderByCreatedAtDesc(Long partnerId, Pageable p);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable p);
    long countByClientIdAndStatus(Long clientId, Order.OrderStatus status);
    long countByClientId(Long clientId);
    List<Order> findByStatus(Order.OrderStatus status);
}
