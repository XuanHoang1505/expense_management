package com.example.backend.service

import com.example.backend.dto.request.TransactionRequest
import com.example.backend.dto.response.CategoryStatsResponse
import com.example.backend.dto.response.SummaryResponse
import com.example.backend.dto.response.TransactionResponse
import com.example.backend.enum.TransactionType
import com.example.backend.entity.User

interface TransactionService {
    fun getAll(user: User): List<TransactionResponse>
    fun getByMonth(user: User, year: Int, month: Int): List<TransactionResponse>
    fun create(req: TransactionRequest, user: User): TransactionResponse
    fun update(id: Long, req: TransactionRequest, user: User): TransactionResponse
    fun delete(id: Long, user: User)
    fun getSummary(user: User, year: Int, month: Int): SummaryResponse
    fun getCategoryStats(user: User, year: Int, month: Int, type: TransactionType): List<CategoryStatsResponse>
}