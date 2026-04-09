package com.expense.backend.dto.response

import com.expense.backend.enum.TransactionType
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class TransactionResponse(
    val id: Long,
    val amount: BigDecimal,
    val note: String?,
    val type: TransactionType,
    val date: LocalDate,
    val categoryId: Long,
    val categoryName: String,
    val categoryIcon: String?,
    val createdAt: LocalDateTime
)