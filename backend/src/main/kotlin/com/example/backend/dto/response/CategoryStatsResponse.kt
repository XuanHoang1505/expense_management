package com.example.backend.dto.response

import java.math.BigDecimal

data class CategoryStatsResponse(
    val categoryId   : Long,
    val categoryName : String,
    val categoryIcon : String?,
    val categoryColor: String,
    val totalAmount  : BigDecimal
)