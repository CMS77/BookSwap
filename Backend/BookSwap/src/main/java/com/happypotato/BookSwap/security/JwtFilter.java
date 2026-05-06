package com.happypotato.BookSwap.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {  // ← injeção pelo construtor
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {

        String path = request.getRequestURI();

        
        if (path.equals("/auth/login") || path.equals("/auth/register")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String authHeader = request.getHeader("Authorization");
        System.out.println("[JwtFilter] " + request.getMethod() + " " + path + " | authHeader=" + (authHeader != null ? "present" : "null"));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            boolean valid = jwtUtil.validateToken(token);
            System.out.println("[JwtFilter] token valid=" + valid);

            if (valid) {
                String username = jwtUtil.extractUsername(token);
                System.out.println("[JwtFilter] authenticated as: " + username);
                UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(username, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        
       filterChain.doFilter(request, response);
    }
}