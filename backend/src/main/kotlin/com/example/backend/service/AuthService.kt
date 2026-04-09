package com.expense.backend.service

import com.expense.backend.dto.request.LoginRequest
import com.expense.backend.dto.request.RegisterRequest
import com.expense.backend.dto.response.AuthResponse

interface AuthService {
    fun register(req: RegisterRequest): AuthResponse
    fun login(req: LoginRequest): AuthResponse
}