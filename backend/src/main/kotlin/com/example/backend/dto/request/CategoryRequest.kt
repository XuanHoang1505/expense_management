package com.expense.backend.dto.request

import com.expense.backend.enum.TransactionType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class CategoryRequest(
    @field:NotBlank(message = "Tên danh mục không được để trống")
    val name: String,

    val icon: String? = null,

    @field:NotNull(message = "Loại danh mục không được để trống")
    val type: TransactionType
)