package com.example.backend.common

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null
) {
    companion object {
        fun <T> ok(data: T? = null, message: String = "Success") =
            ApiResponse(true, message, data)

        fun error(message: String) =
            ApiResponse<Nothing>(false, message, null)
    }
}