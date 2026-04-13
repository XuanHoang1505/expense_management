package com.example.backend.service.impl

import com.example.backend.dto.request.LoginRequest
import com.example.backend.dto.request.RegisterRequest
import com.example.backend.dto.response.AuthResponse
import com.example.backend.dto.response.UserResponse
import com.example.backend.entity.User
import com.example.backend.exception.AppException
import com.example.backend.exception.ErrorCode
import com.example.backend.repository.UserRepository
import com.example.backend.security.JwtUtil
import com.example.backend.service.AuthService
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthServiceImpl(
    private val userRepository   : UserRepository,
    private val passwordEncoder  : PasswordEncoder,
    private val authManager      : AuthenticationManager,
    private val jwtUtil          : JwtUtil
) : AuthService {

    override fun register(req: RegisterRequest): AuthResponse {
        if (userRepository.existsByEmail(req.email))
            throw AppException(ErrorCode.EMAIL_EXISTED)

        val user = User(
            email    = req.email,
            userPassword = passwordEncoder.encode(req.password),
            fullName = req.fullName
        )
        userRepository.save(user)

        return AuthResponse(
            accessToken    = jwtUtil.generateToken(user),
            user = UserResponse(
                id = user.id,
                email = user.email,
                fullName = user.fullName
            )
        )
    }

    override fun login(req: LoginRequest): AuthResponse {
        try {
            authManager.authenticate(
                UsernamePasswordAuthenticationToken(req.email, req.password)
            )
        } catch (e: BadCredentialsException) {
            throw AppException(ErrorCode.INVALID_CREDENTIALS)
        }

        val user = userRepository.findByEmail(req.email)
            ?: throw AppException(ErrorCode.USER_NOT_FOUND)

        return AuthResponse(
            accessToken    = jwtUtil.generateToken(user),
            user = UserResponse(
                id = user.id,
                email = user.email,
                fullName = user.fullName
            )
        )
    }
}