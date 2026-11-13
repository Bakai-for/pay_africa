package com.payafrica.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;
@Service
public class JwtService {
    private final Key key; private final long expirationMs;
    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long exp) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes()); this.expirationMs = exp;
    }
    public String generate(Long userId, String phone, String role) {
        return Jwts.builder().setSubject(String.valueOf(userId)).claim("phone", phone).claim("role", role)
                .setIssuedAt(new Date()).setExpiration(new Date(System.currentTimeMillis()+expirationMs))
                .signWith(key, SignatureAlgorithm.HS256).compact();
    }
    public Jws<Claims> parse(String token){return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);}
    public Long getUserId(String token){return Long.valueOf(parse(token).getBody().getSubject());}
    public boolean isValid(String t){try{parse(t);return true;}catch(Exception e){return false;}}
}
