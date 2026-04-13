package com.example.backend.dto.response

data class AuthResponse(
    val accessToken: String,
    val user: UserResponse
)