package com.example.backend.controller

import com.example.backend.common.ApiResponse
import com.example.backend.dto.request.TransactionRequest
import com.example.backend.enum.TransactionType
import com.example.backend.entity.User
import com.example.backend.service.TransactionService  // ← import interface
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/transactions")
class TransactionController(
    private val transactionService: TransactionService  
) {
    @GetMapping
    fun getAll(@AuthenticationPrincipal user: User) =
        ApiResponse.ok(transactionService.getAll(user))

    @GetMapping("/monthly")
    fun getByMonth(
        @AuthenticationPrincipal user: User,
        @RequestParam year: Int  = LocalDate.now().year,
        @RequestParam month: Int = LocalDate.now().monthValue
    ) = ApiResponse.ok(transactionService.getByMonth(user, year, month))

    @PostMapping
    fun create(
        @RequestBody @Valid req: TransactionRequest,
        @AuthenticationPrincipal user: User
    ) = ApiResponse.ok(transactionService.create(req, user), "Tạo thành công")

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody @Valid req: TransactionRequest,
        @AuthenticationPrincipal user: User
    ) = ApiResponse.ok(transactionService.update(id, req, user), "Cập nhật thành công")

    @DeleteMapping("/{id}")
    fun delete(
        @PathVariable id: Long,
        @AuthenticationPrincipal user: User
    ): ApiResponse<Nothing> {
        transactionService.delete(id, user)
        return ApiResponse.ok(null, "Xoá thành công")
    }

    @GetMapping("/summary")
    fun getSummary(
        @AuthenticationPrincipal user: User,
        @RequestParam year: Int  = LocalDate.now().year,
        @RequestParam month: Int = LocalDate.now().monthValue
    ) = ApiResponse.ok(transactionService.getSummary(user, year, month))

    @GetMapping("/stats")
    fun getCategoryStats(
        @AuthenticationPrincipal user: User,
        @RequestParam year: Int  = LocalDate.now().year,
        @RequestParam month: Int = LocalDate.now().monthValue,
        @RequestParam type: TransactionType = TransactionType.EXPENSE
    ) = ApiResponse.ok(transactionService.getCategoryStats(user, year, month, type))
}