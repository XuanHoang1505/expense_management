import api from './axiosInstance'

export interface LoginRequest {
  email:    string
  password: string
}

export interface RegisterRequest {
  email:    string
  password: string
  fullName: string
}

export interface User {
  email:    string
  fullName: string
}

export interface AuthResponse {
  accessToken:    string
  user: User
}

export const authApi = {
  login:    (data: LoginRequest)    => api.post<{ data: AuthResponse }>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<{ data: AuthResponse }>('/auth/register', data),
}