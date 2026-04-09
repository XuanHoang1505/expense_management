package com.expense.backend.repository

import com.expense.backend.entity.Category
import com.expense.backend.entity.User
import com.expense.backend.enum.TransactionType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface CategoryRepository : JpaRepository<Category, Long> {
    fun findByType(type: TransactionType): List<Category>
     fun findByUserIsNull(): List<Category>

    fun findByUser(user: User): List<Category>

    @Query("""
        SELECT c FROM Category c 
        WHERE c.user IS NULL OR c.user = :user
        ORDER BY c.user IS NOT NULL, c.type, c.name
    """)
    fun findAllAvailableForUser(user: User): List<Category>

    // Lọc theo loại — tất cả category user có thể dùng
    @Query("""
        SELECT c FROM Category c 
        WHERE (c.user IS NULL OR c.user = :user)
        AND c.type = :type
        ORDER BY c.user IS NOT NULL, c.name
    """)
    fun findByTypeAndAvailableForUser(user: User, type: TransactionType): List<Category>

    fun existsByNameAndTypeAndUser(name: String, type: TransactionType, user: User): Boolean
}
