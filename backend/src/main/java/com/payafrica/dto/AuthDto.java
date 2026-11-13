package com.payafrica.dto;
import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Pattern; import lombok.*;
public class AuthDto {
    @Data public static class RegisterRequest {
        @NotBlank private String fullName;
        @NotBlank @Pattern(regexp="^\\+?[0-9]{8,15}$") private String phone;
        @NotBlank @Pattern(regexp="^[0-9]{4}$") private String pin;
        @NotBlank private String country;
        @NotBlank private String role; // CLIENT, PARTNER
        private String shopName; // si PARTNER
        private String address; private String city;
        private boolean termsAccepted;
    }
    @Data public static class LoginRequest { @NotBlank private String phone; @NotBlank private String pin; }
    @Data @AllArgsConstructor @Builder public static class AuthResponse { private String token; private Long userId; private String phone; private String fullName; private String role; private boolean termsAccepted; private String termsVersion; }
}
