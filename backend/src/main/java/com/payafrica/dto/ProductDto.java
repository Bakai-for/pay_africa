package com.payafrica.dto;
import lombok.*; import java.math.BigDecimal;
public class ProductDto {
    @Data public static class CreateCategory { private String name; private String icon; }
    @Data @Builder public static class CategoryResponse { private Long id; private String name; private String icon; }
    @Data public static class CreateProduct {
        private String name; private String description; private BigDecimal price; private String currency; private Integer stock; private String imageUrl; private Long categoryId;
    }
    @Data @Builder public static class ProductResponse {
        private Long id; private String name; private String description; private BigDecimal price; private String currency; private Integer stock; private String imageUrl; private boolean isActive; private boolean isValidated; private Long partnerId; private String partnerShopName; private Long categoryId; private String categoryName;
    }
    @Data public static class UpdateProduct { private String name; private String description; private BigDecimal price; private Integer stock; private String imageUrl; private Long categoryId; private Boolean isActive; private Boolean isValidated; }
}
