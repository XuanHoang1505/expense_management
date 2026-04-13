import api from './axiosInstance'

export interface Transaction {
  id:           number
  amount:       number
  note:         string | null
  type:         'INCOME' | 'EXPENSE'
  date:         string
  categoryId:   number
  categoryName: string
  categoryIcon: string | null
  createdAt:    string
}

export interface TransactionRequest {
  amount:     number
  note?:      string
  type:       'INCOME' | 'EXPENSE'
  date:       string
  categoryId: number
}

export interface SummaryResponse {
  totalIncome:  number
  totalExpense: number
  balance:      number
}

export interface CategoryStats {
  categoryId:   number
  categoryName: string
  categoryIcon: string | null
  totalAmount:  number
}

export const transactionApi = {
  getAll:     ()                               => api.get<{ data: Transaction[] }>('/transactions'),
  getByMonth: (year: number, month: number)    => api.get<{ data: Transaction[] }>(`/transactions/monthly?year=${year}&month=${month}`),
  create:     (data: TransactionRequest)       => api.post<{ data: Transaction }>('/transactions', data),
  update:     (id: number, data: TransactionRequest) => api.put<{ data: Transaction }>(`/transactions/${id}`, data),
  delete:     (id: number)                     => api.delete(`/transactions/${id}`),
  getSummary: (year: number, month: number)    => api.get<{ data: SummaryResponse }>(`/transactions/summary?year=${year}&month=${month}`),
  getStats:   (year: number, month: number, type: string) => api.get<{ data: CategoryStats[] }>(`/transactions/stats?year=${year}&month=${month}&type=${type}`),
}