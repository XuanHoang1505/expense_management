package com.expense.backend.exception

enum class ErrorCode(val code: Int, val message: String) {
    EMAIL_EXISTED(1001, "Email đã tồn tại"),
    USER_NOT_FOUND(1002, "Không tìm thấy người dùng"),
    INVALID_CREDENTIALS(1003, "Email hoặc mật khẩu không đúng"),
    RESOURCE_NOT_FOUND(1004, "Không tìm thấy dữ liệu"),
    UNAUTHORIZED(1005, "Không có quyền truy cập"),
    CATEGORY_NOT_FOUND(1006, "Không tìm thấy danh mục"),
    CATEGORY_DUPLICATED(1007, "Tên danh mục đã tồn tại"),  
    CANNOT_DELETE_DEFAULT(1008, "Không thể xoá danh mục mặc định")
}