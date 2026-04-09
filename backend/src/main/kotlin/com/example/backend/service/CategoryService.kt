package com.expense.backend.service

import com.expense.backend.dto.request.CategoryRequest
import com.expense.backend.dto.response.CategoryResponse
import com.expense.backend.entity.Category
import com.expense.backend.enum.TransactionType
import com.expense.backend.entity.User

interface CategoryService {
    fun getAllForUser(user: User): List<CategoryResponse>
    fun getByTypeForUser(user: User, type: TransactionType): List<CategoryResponse>
    fun getById(id: Long, user: User? = null): Category
    fun create(req: CategoryRequest, user: User): CategoryResponse
    fun update(id: Long, req: CategoryRequest, user: User): CategoryResponse
    fun delete(id: Long, user: User)
}