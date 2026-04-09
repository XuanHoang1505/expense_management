package com.expense.backend.dto.response

import java.math.BigDecimal

data class CategoryStatsResponse(
    val categoryId   : Long,
    val categoryName : String,
    val categoryIcon : String?,
    val totalAmount  : BigDecimal
)