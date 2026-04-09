package com.expense.backend.service

import com.expense.backend.dto.request.TransactionRequest
import com.expense.backend.dto.response.CategoryStatsResponse
import com.expense.backend.dto.response.SummaryResponse
import com.expense.backend.dto.response.TransactionResponse
import com.expense.backend.enum.TransactionType
import com.expense.backend.entity.User

interface TransactionService {
    fun getAll(user: User): List<TransactionResponse>
    fun getByMonth(user: User, year: Int, month: Int): List<TransactionResponse>
    fun create(req: TransactionRequest, user: User): TransactionResponse
    fun update(id: Long, req: TransactionRequest, user: User): TransactionResponse
    fun delete(id: Long, user: User)
    fun getSummary(user: User, year: Int, month: Int): SummaryResponse
    fun getCategoryStats(user: User, year: Int, month: Int, type: TransactionType): List<CategoryStatsResponse>
}