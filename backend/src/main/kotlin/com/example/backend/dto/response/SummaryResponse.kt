package com.expense.backend.dto.response

import java.math.BigDecimal

data class SummaryResponse(
    val totalIncome  : BigDecimal,
    val totalExpense : BigDecimal,
    val balance      : BigDecimal
)