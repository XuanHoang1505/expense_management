package com.expense.backend.entity

import com.expense.backend.enum.TransactionType
import jakarta.persistence.*

@Entity
@Table(name = "categories")
class Category(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val name: String = "",

    val icon: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: TransactionType = TransactionType.EXPENSE

    // null = category mặc định của hệ thống
    // có user = category riêng của người dùng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    val user: User? = null

)