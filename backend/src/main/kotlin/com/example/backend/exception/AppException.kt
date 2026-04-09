package com.expense.backend.exception

class AppException(val errorCode: ErrorCode) : 
    RuntimeException(errorCode.message)