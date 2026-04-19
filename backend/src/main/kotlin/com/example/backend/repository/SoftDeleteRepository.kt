package com.example.backend.repository

import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.NoRepositoryBean
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@NoRepositoryBean
interface SoftDeleteRepository<T, ID> : JpaRepository<T, ID> {

    @Modifying
    @Transactional
    @Query("UPDATE #{#entityName} e SET e.deleted = true, e.deletedAt = :now WHERE e.id = :id")
    fun softDelete(id: ID, now: LocalDateTime = LocalDateTime.now())
}