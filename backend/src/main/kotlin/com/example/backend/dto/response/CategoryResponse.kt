package com.expense.backend.dto.response

import com.expense.backend.enum.TransactionType

data class CategoryResponse(
    val id       : Long,
    val name     : String,
    val icon     : String?,
    val type     : TransactionType,
    val isDefault: Boolean  
)