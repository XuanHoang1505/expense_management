package com.example.backend.service

import com.example.backend.dto.request.CategoryRequest
import com.example.backend.dto.response.CategoryResponse
import com.example.backend.entity.Category
import com.example.backend.enum.TransactionType
import com.example.backend.entity.User

interface CategoryService {
    fun getAllForUser(user: User): List<CategoryResponse>
    fun getByTypeForUser(user: User, type: TransactionType): List<CategoryResponse>
    fun getById(id: Long, user: User? = null): Category
    fun create(req: CategoryRequest, user: User): CategoryResponse
    fun update(id: Long, req: CategoryRequest, user: User): CategoryResponse
    fun delete(id: Long, user: User)
}