package com.example.backend.service.impl

import com.example.backend.dto.request.CategoryRequest
import com.example.backend.dto.response.CategoryResponse
import com.example.backend.entity.Category
import com.example.backend.enum.TransactionType
import com.example.backend.entity.User
import com.example.backend.exception.AppException
import com.example.backend.exception.ErrorCode
import com.example.backend.repository.CategoryRepository
import com.example.backend.service.CategoryService
import org.springframework.stereotype.Service

@Service
class CategoryServiceImpl(
    private val categoryRepository: CategoryRepository
) : CategoryService {

    override fun getAllForUser(user: User): List<CategoryResponse> =
        categoryRepository.findAllAvailableForUser(user).map { it.toResponse() }

    override fun getByTypeForUser(user: User, type: TransactionType): List<CategoryResponse> =
        categoryRepository.findByTypeAndAvailableForUser(user, type).map { it.toResponse() }

    override fun getById(id: Long, user: User?): Category {
        val category = categoryRepository.findById(id).orElseThrow {
            AppException(ErrorCode.CATEGORY_NOT_FOUND)
        }
        // ← dùng val local để Kotlin smart cast được
        val categoryUser = category.user
        if (user != null && categoryUser != null && categoryUser.id != user.id)
            throw AppException(ErrorCode.UNAUTHORIZED)
        return category
    }

    override fun create(req: CategoryRequest, user: User): CategoryResponse {
        if (categoryRepository.existsByNameAndTypeAndUser(req.name, req.type, user))
            throw AppException(ErrorCode.CATEGORY_DUPLICATED)

        val category = Category(
            name = req.name,
            icon = req.icon,
            color = req.color,
            type = req.type,
            user = user
        )
        return categoryRepository.save(category).toResponse()
    }

    override fun update(id: Long, req: CategoryRequest, user: User): CategoryResponse {
        val category = categoryRepository.findById(id).orElseThrow {
            AppException(ErrorCode.CATEGORY_NOT_FOUND)
        }

        // ← dùng val local
        val categoryUser = category.user
        if (categoryUser == null)
            throw AppException(ErrorCode.UNAUTHORIZED)
        if (categoryUser.id != user.id)
            throw AppException(ErrorCode.UNAUTHORIZED)

        val updated = Category(
            id   = category.id,
            name = req.name,
            icon = req.icon,
            color = req.color,
            type = req.type,
            user = user
        )
        return categoryRepository.save(updated).toResponse()
    }

    override fun delete(id: Long, user: User) {
        val category = categoryRepository.findById(id).orElseThrow {
            AppException(ErrorCode.CATEGORY_NOT_FOUND)
        }

        // ← dùng val local
        val categoryUser = category.user
        if (categoryUser == null)
            throw AppException(ErrorCode.CANNOT_DELETE_DEFAULT)
        if (categoryUser.id != user.id)
            throw AppException(ErrorCode.UNAUTHORIZED)

        categoryRepository.softDelete(category.id)
    }

    private fun Category.toResponse() = CategoryResponse(
        id        = id,
        name      = name,
        icon      = icon,
        color     = color,
        type      = type,
        isDefault = (user == null)
    )
}