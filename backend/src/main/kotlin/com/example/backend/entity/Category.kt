package com.example.backend.entity

import com.example.backend.enum.TransactionType
import jakarta.persistence.*
import org.hibernate.annotations.SQLRestriction
import java.time.LocalDateTime

@Entity
@Table(name = "categories")
@SQLRestriction("deleted = false") 
class Category(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val name: String = "",

    val icon: String? = null,
    
    @Column(nullable = false)
    val color: String = "#607D8B",

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: TransactionType = TransactionType.EXPENSE,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    val user: User? = null,

    @Column(nullable = false)
    val deleted: Boolean = false,         

    @Column(name = "deleted_at")
    val deletedAt: LocalDateTime? = null

)