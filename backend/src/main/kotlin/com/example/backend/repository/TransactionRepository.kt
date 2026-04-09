package com.expense.backend.repository

import com.expense.backend.entity.Transaction
import com.expense.backend.enum.TransactionType
import com.expense.backend.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface TransactionRepository : JpaRepository<Transaction, Long> {
    fun findByUserOrderByDateDesc(user: User): List<Transaction>

    fun findByUserAndDateBetweenOrderByDateDesc(
        user: User,
        startDate: LocalDate,
        endDate: LocalDate
    ): List<Transaction>

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type")
    fun sumAmountByUserAndType(user: User, type: TransactionType): java.math.BigDecimal?
}