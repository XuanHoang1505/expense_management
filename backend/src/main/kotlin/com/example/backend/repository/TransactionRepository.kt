package com.example.backend.repository

import com.example.backend.entity.Transaction
import com.example.backend.enum.TransactionType
import com.example.backend.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.LocalDate

@Repository
interface TransactionRepository : JpaRepository<Transaction, Long> {

    // Lấy tất cả giao dịch của user, sắp xếp mới nhất trước
    fun findByUserOrderByDateDesc(user: User): List<Transaction>

    // Lấy giao dịch theo khoảng thời gian
    fun findByUserAndDateBetweenOrderByDateDesc(
        user: User,
        startDate: LocalDate,
        endDate: LocalDate
    ): List<Transaction>

    // Lấy giao dịch theo loại (INCOME / EXPENSE)
    fun findByUserAndTypeOrderByDateDesc(
        user: User,
        type: TransactionType
    ): List<Transaction>

    // Tính tổng tiền theo loại
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type")
    fun sumAmountByUserAndType(user: User, type: TransactionType): BigDecimal

    // Tính tổng tiền theo loại trong tháng
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t 
        WHERE t.user = :user 
        AND t.type = :type 
        AND t.date BETWEEN :startDate AND :endDate
    """)
    fun sumAmountByUserAndTypeAndDateBetween(
        user: User,
        type: TransactionType,
        startDate: LocalDate,
        endDate: LocalDate
    ): BigDecimal

    // Thống kê theo danh mục trong tháng
    @Query("""
        SELECT t.category.id, t.category.name, t.category.icon, COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user = :user
        AND t.date BETWEEN :startDate AND :endDate
        AND t.type = :type
        GROUP BY t.category.id, t.category.name, t.category.icon
    """)
    fun sumByCategoryAndDateBetween(
        user: User,
        startDate: LocalDate,
        endDate: LocalDate,
        type: TransactionType
    ): List<Array<Any>>
}