package com.expense.backend.dto.response

data class AuthResponse(
    val token: String,
    val fullName: String,
    val email: String
)