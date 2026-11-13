package com.payafrica.dto;
import lombok.*; import java.math.BigDecimal;
public class PartnerDto {
    @Data @Builder public static class PartnerResponse { private Long id; private String shopName; private String description; private String address; private String city; private Double gpsLat; private Double gpsLng; private String phoneContact; private String logoUrl; private boolean isValidated; private BigDecimal rating; private Long userId; private String ownerPhone; }
    @Data public static class UpdateProfile { private String shopName; private String description; private String address; private String city; private Double gpsLat; private Double gpsLng; private String phoneContact; private String logoUrl; }
    @Data @Builder public static class StatsResponse { private long totalOrders; private BigDecimal totalRevenue; private BigDecimal totalCommission; private long totalProducts; private long totalPartners; private long totalClients; private BigDecimal adminEarnings; }
}
