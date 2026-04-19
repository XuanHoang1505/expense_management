package com.example.backend.dto.request

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegisterRequest(
    @field:Email(message = "Email không hợp lệ")
    @field:NotBlank(message = "Email không được để trống")
    val email: String,

    @field:NotBlank(message = "Mật khẩu không được để trống")
    @field:Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    val password: String,

    @field:NotBlank(message = "Họ tên không được để trống")
    val fullName: String
)