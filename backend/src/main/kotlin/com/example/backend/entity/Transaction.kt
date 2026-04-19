package com.example.backend.entity

import com.example.backend.enum.TransactionType
import org.hibernate.annotations.SQLRestriction 
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "transactions")
@SQLRestriction("deleted = false") 
class Transaction(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val amount: BigDecimal = BigDecimal.ZERO,

    val note: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: TransactionType = TransactionType.EXPENSE,

    @Column(nullable = false)
    val date: LocalDate = LocalDate.now(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User = User(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    val category: Category = Category(),

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val deleted: Boolean = false,           

    @Column(name = "deleted_at")
    val deletedAt: LocalDateTime? = null
)