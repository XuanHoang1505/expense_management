package com.example.backend.repository

import com.example.backend.entity.Category
import com.example.backend.entity.User
import com.example.backend.enum.TransactionType
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
        ORDER BY CASE WHEN c.user IS NULL THEN 0 ELSE 1 END, c.type, c.name
    """)
    fun findAllAvailableForUser(user: User): List<Category>

    // Lọc theo loại — tất cả category user có thể dùng
    @Query("""
        SELECT c FROM Category c 
        WHERE (c.user IS NULL OR c.user = :user)
        AND c.type = :type
        ORDER BY CASE WHEN c.user IS NULL THEN 0 ELSE 1 END, c.name
    """)
    fun findByTypeAndAvailableForUser(user: User, type: TransactionType): List<Category>

    fun existsByNameAndTypeAndUser(name: String, type: TransactionType, user: User): Boolean
}
