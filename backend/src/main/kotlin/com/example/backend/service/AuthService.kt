package com.example.backend.service

import com.example.backend.dto.request.LoginRequest
import com.example.backend.dto.request.RegisterRequest
import com.example.backend.dto.response.AuthResponse

interface AuthService {
    fun register(req: RegisterRequest): AuthResponse
    fun login(req: LoginRequest): AuthResponse
}