package com.payafrica.config;
import com.payafrica.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity; import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain; import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration; import org.springframework.web.cors.CorsConfigurationSource; import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
@Configuration @EnableWebSecurity @RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    @Bean public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(c->c.configurationSource(corsSource())).csrf(cs->cs.disable())
            .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a->a
                .requestMatchers("/","/health","/api/v1/auth/**","/api/v1/products/**","/api/v1/categories/**","/api/v1/partner/public/**","/api/v1/partners/public/**","/api/v1/terms/current","/swagger-ui.html","/swagger-ui/**","/v3/api-docs/**","/api-docs/**","/webjars/**","/h2-console/**","/error").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/partner/**").hasAnyRole("PARTNER","ADMIN")
                .anyRequest().authenticated()
            ).headers(h->h.frameOptions(f->f.disable())).addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean public CorsConfigurationSource corsSource(){
        CorsConfiguration c=new CorsConfiguration();
        c.setAllowedOriginPatterns(Arrays.asList("*")); c.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS")); c.setAllowedHeaders(Arrays.asList("*")); c.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource(); s.registerCorsConfiguration("/**",c); return s;
    }
    @Bean public PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
}
