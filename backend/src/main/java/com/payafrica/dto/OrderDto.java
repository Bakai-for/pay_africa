package com.payafrica.dto;
import lombok.*; import java.math.BigDecimal; import java.util.List;
public class OrderDto {
    @Data public static class CartItem { private Long productId; private Integer quantity; }
    @Data public static class PlaceOrderRequest {
        private List<CartItem> items;
        private String operator; // mtn_cm, orange_cm...
        private String clientPhone; // numéro Mobile Money à débiter
        private String voucherCode;
        private String deliveryAddress; private String notes;
    }
    @Data @Builder public static class OrderResponse {
        private Long id; private String reference; private String shopName; private String currency;
        private BigDecimal subtotal; private BigDecimal discount; private BigDecimal total; private BigDecimal commission; private BigDecimal netToPartner;
        private String status; private String operator; private String createdAt;
        private List<OrderItemResponse> items;
        private String voucherCode; private String clientName; private String partnerPhone;
    }
    @Data @Builder public static class OrderItemResponse { private String productName; private BigDecimal unitPrice; private Integer quantity; private BigDecimal subtotal; }
    @Data @Builder public static class VoucherResponse { private String code; private Integer discountPercent; private boolean isUsed; private String expiresAt; private String reason; }
    @Data @Builder public static class SettingsResponse { private Double commissionPercent; private Integer pcFixedCommission; private String pcCategoryName; private String voucherRulesJson; private String termsVersion; }
    @Data public static class UpdateSettings { private Double commissionPercent; private Integer pcFixedCommission; private String pcCategoryName; private String voucherRulesJson; private String cguContent; private String privacyContent; }
    @Data @Builder public static class InvoiceResponse {
        private Long id; private String reference; private String shopName; private String currency;
        private BigDecimal subtotal; private BigDecimal discount; private BigDecimal total;
        private String status; private String operator; private String clientPhone; private String deliveryAddress; private String createdAt;
        private List<OrderItemResponse> items;
        private String voucherCode; private String clientName;
    }
}
