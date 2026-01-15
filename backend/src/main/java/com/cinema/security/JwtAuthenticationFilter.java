/**
 * @spec O003-beverage-order
 * JWT 认证过滤器 (T026)
 */
package com.cinema.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

/**
 * JWT 认证过滤器
 *
 * 功能:
 * 1. 从 HTTP 请求头中提取 JWT Token (Authorization: Bearer <token>)
 * 2. 验证 Token 合法性
 * 3. 从 Token 中提取用户ID
 * 4. 设置 Spring Security 认证上下文
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            // 1. 从请求头中提取 JWT Token
            String jwt = getJwtFromRequest(request);

            // 2. 验证 Token 并设置认证上下文
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                // 从 Token 中提取用户ID
                UUID userId = jwtTokenProvider.getUserIdFromToken(jwt);

                // 创建 Authentication 对象 (简化版本，不加载用户详情)
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,               // Principal (用户ID)
                                null,                // Credentials (不需要)
                                Collections.emptyList()  // Authorities (暂不实现角色权限)
                        );

                // 设置请求详情
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 设置到 Spring Security 上下文
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("JWT 认证成功: userId={}", userId);
            }
        } catch (Exception ex) {
            log.error("无法设置用户认证: {}", ex.getMessage());
        }

        // 继续过滤链
        filterChain.doFilter(request, response);
    }

    /**
     * 从请求头中提取 JWT Token
     *
     * @param request HTTP 请求
     * @return JWT Token (如果存在)
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        // 检查 Authorization 头格式: "Bearer <token>"
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // 去掉 "Bearer " 前缀
        }

        return null;
    }
}
