package com.example.backend.dto.response

import com.example.backend.enum.TransactionType

data class CategoryResponse(
    val id       : Long,
    val name     : String,
    val icon     : String?,
    val color    : String,
    val type     : TransactionType,
    val isDefault: Boolean  
)