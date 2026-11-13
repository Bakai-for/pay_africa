package com.payafrica.security;
import com.payafrica.repository.UserRepository;
import jakarta.servlet.FilterChain; import jakarta.servlet.ServletException; import jakarta.servlet.http.HttpServletRequest; import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component; import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException; import java.util.List;
@Component @RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService; private final UserRepository userRepository;
    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if(h!=null && h.startsWith("Bearer ")){
            String t=h.substring(7);
            if(jwtService.isValid(t)){
                try{
                    Long uid=jwtService.getUserId(t);
                    var u=userRepository.findById(uid).orElse(null);
                    if(u!=null){
                        var auth=new UsernamePasswordAuthenticationToken(u,null, List.of(new SimpleGrantedAuthority("ROLE_"+u.getRole().name())));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }catch(Exception ignored){}
            }
        }
        chain.doFilter(req,res);
    }
}
