package com.expense.backend.dto.request

import com.expense.backend.enum.TransactionType
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDate

data class TransactionRequest(
    @field:NotNull(message = "Số tiền không được để trống")
    @field:Positive(message = "Số tiền phải lớn hơn 0")
    val amount: BigDecimal,

    val note: String? = null,

    @field:NotNull(message = "Loại giao dịch không được để trống")
    val type: TransactionType,

    @field:NotNull(message = "Ngày không được để trống")
    val date: LocalDate,

    @field:NotNull(message = "Danh mục không được để trống")
    val categoryId: Long
)