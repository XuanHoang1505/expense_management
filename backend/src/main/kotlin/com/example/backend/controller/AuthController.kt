package com.example.backend.controller

import com.example.backend.common.ApiResponse
import com.example.backend.dto.request.LoginRequest
import com.example.backend.dto.request.RegisterRequest
import com.example.backend.service.AuthService        
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService              
) {
    @PostMapping("/register")
    fun register(@RequestBody @Valid req: RegisterRequest) =
        ApiResponse.ok(authService.register(req), "Đăng ký thành công")

    @PostMapping("/login")
    fun login(@RequestBody @Valid req: LoginRequest) =
        ApiResponse.ok(authService.login(req), "Đăng nhập thành công")
}