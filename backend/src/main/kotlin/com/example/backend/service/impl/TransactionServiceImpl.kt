package com.example.backend.service.impl

import com.example.backend.dto.request.TransactionRequest
import com.example.backend.dto.response.CategoryStatsResponse
import com.example.backend.dto.response.SummaryResponse
import com.example.backend.dto.response.TransactionResponse
import com.example.backend.entity.Transaction
import com.example.backend.enum.TransactionType
import com.example.backend.entity.User
import com.example.backend.exception.AppException
import com.example.backend.exception.ErrorCode
import com.example.backend.repository.TransactionRepository
import com.example.backend.service.CategoryService
import com.example.backend.service.TransactionService
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class TransactionServiceImpl(
    private val transactionRepository : TransactionRepository,
    private val categoryService       : CategoryService
) : TransactionService {

    override fun getAll(user: User): List<TransactionResponse> =
        transactionRepository.findByUserOrderByDateDesc(user)
            .map { it.toResponse() }

    override fun getByMonth(user: User, year: Int, month: Int): List<TransactionResponse> {
        val (start, end) = monthRange(year, month)
        return transactionRepository
            .findByUserAndDateBetweenOrderByDateDesc(user, start, end)
            .map { it.toResponse() }
    }

    override fun create(req: TransactionRequest, user: User): TransactionResponse {
        val category = categoryService.getById(req.categoryId, user)
        val transaction = Transaction(
            amount   = req.amount,
            note     = req.note,
            type     = req.type,
            date     = req.date,
            user     = user,
            category = category
        )
        return transactionRepository.save(transaction).toResponse()
    }

    override fun update(id: Long, req: TransactionRequest, user: User): TransactionResponse {
        val existing = findOwnedTransaction(id, user)
        val category = categoryService.getById(req.categoryId, user)
        val updated = Transaction(
            id       = existing.id,
            amount   = req.amount,
            note     = req.note,
            type     = req.type,
            date     = req.date,
            user     = user,
            category = category
        )
        return transactionRepository.save(updated).toResponse()
    }

    override fun delete(id: Long, user: User) {
        val existing = findOwnedTransaction(id, user)
        transactionRepository.softDelete(existing.id)
    }

    override fun getSummary(user: User, year: Int, month: Int): SummaryResponse {
        val (start, end) = monthRange(year, month)
        val totalIncome  = transactionRepository
            .sumAmountByUserAndTypeAndDateBetween(user, TransactionType.INCOME, start, end)
        val totalExpense = transactionRepository
            .sumAmountByUserAndTypeAndDateBetween(user, TransactionType.EXPENSE, start, end)
        return SummaryResponse(
            totalIncome  = totalIncome,
            totalExpense = totalExpense,
            balance      = totalIncome - totalExpense
        )
    }

    override fun getCategoryStats(
        user: User, year: Int, month: Int, type: TransactionType
    ): List<CategoryStatsResponse> {
        val (start, end) = monthRange(year, month)
        return transactionRepository
            .sumByCategoryAndDateBetween(user, start, end, type)
            .map { row ->
                CategoryStatsResponse(
                    categoryId   = row[0] as Long,
                    categoryName = row[1] as String,
                    categoryIcon = row[2] as? String,
                    categoryColor = row[3] as String,
                    totalAmount  = row[4] as java.math.BigDecimal
                )
            }
    }

    private fun monthRange(year: Int, month: Int): Pair<LocalDate, LocalDate> {
        val start = LocalDate.of(year, month, 1)
        return start to start.withDayOfMonth(start.lengthOfMonth())
    }

    private fun findOwnedTransaction(id: Long, user: User): Transaction {
        val t = transactionRepository.findById(id).orElseThrow {
            AppException(ErrorCode.RESOURCE_NOT_FOUND)
        }
        if (t.user.id != user.id) throw AppException(ErrorCode.UNAUTHORIZED)
        return t
    }

    private fun Transaction.toResponse() = TransactionResponse(
        id           = id,
        amount       = amount,
        note         = note,
        type         = type,
        date         = date,
        categoryId   = category.id,
        categoryName = category.name,
        categoryIcon = category.icon,
        categoryColor = category.color,
        createdAt    = createdAt
    )
}