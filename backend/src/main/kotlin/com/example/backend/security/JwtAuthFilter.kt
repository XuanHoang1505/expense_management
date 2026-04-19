package com.example.backend.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(
    private val jwtUtil: JwtUtil,
    private val userDetailsService: UserDetailsService
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {

        val path = request.servletPath

        // ✅ Skip các endpoint auth
        if (path.startsWith("/auth")) {
            filterChain.doFilter(request, response)
            return
        }

        val authHeader = request.getHeader("Authorization")

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val token = authHeader.substring(7)

            if (jwtUtil.isValid(token)) {
                val email = jwtUtil.extractEmail(token)

                // ✅ Tránh set lại authentication nhiều lần
                if (email != null && SecurityContextHolder.getContext().authentication == null) {
                    try {
                        val userDetails = userDetailsService.loadUserByUsername(email)

                        val auth = UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.authorities
                        )

                        auth.details = WebAuthenticationDetailsSource().buildDetails(request)
                        SecurityContextHolder.getContext().authentication = auth

                    } catch (e: Exception) {
                        // ❗ Token hợp lệ nhưng user không tồn tại → bỏ qua, không crash
                    }
                }
            }
        }

        filterChain.doFilter(request, response)
    }
}