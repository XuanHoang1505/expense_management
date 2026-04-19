package com.example.backend.dto.request

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class LoginRequest(
    @field:Email(message = "Email không hợp lệ")
    @field:NotBlank(message = "Email không được để trống")
    val email: String,

    @field:NotBlank(message = "Mật khẩu không được để trống")
    val password: String
)