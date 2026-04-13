package com.example.backend.exception

class AppException(val errorCode: ErrorCode) : 
    RuntimeException(errorCode.message)