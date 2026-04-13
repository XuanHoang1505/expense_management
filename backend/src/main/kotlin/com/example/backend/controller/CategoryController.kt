package com.example.backend.controller

import com.example.backend.common.ApiResponse
import com.example.backend.dto.request.CategoryRequest
import com.example.backend.enum.TransactionType
import com.example.backend.entity.User
import com.example.backend.service.CategoryService    
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/categories")
class CategoryController(
    private val categoryService: CategoryService      
) {
    @GetMapping
    fun getAll(@AuthenticationPrincipal user: User) =
        ApiResponse.ok(categoryService.getAllForUser(user))

    @GetMapping("/type/{type}")
    fun getByType(
        @AuthenticationPrincipal user: User,
        @PathVariable type: TransactionType
    ) = ApiResponse.ok(categoryService.getByTypeForUser(user, type))

    @PostMapping
    fun create(
        @RequestBody @Valid req: CategoryRequest,
        @AuthenticationPrincipal user: User
    ) = ApiResponse.ok(categoryService.create(req, user), "Tạo danh mục thành công")

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody @Valid req: CategoryRequest,
        @AuthenticationPrincipal user: User
    ) = ApiResponse.ok(categoryService.update(id, req, user), "Cập nhật thành công")

    @DeleteMapping("/{id}")
    fun delete(
        @PathVariable id: Long,
        @AuthenticationPrincipal user: User
    ): ApiResponse<Nothing> {
        categoryService.delete(id, user)
        return ApiResponse.ok(null, "Xoá thành công")
    }
}