import { create } from 'zustand'
import { transactionApi, Transaction, SummaryResponse } from '../api/transactionApi'

interface TransactionState {
  transactions: Transaction[]
  summary:      SummaryResponse | null
  loading:      boolean
  error:        string | null
  fetchByMonth: (year: number, month: number) => Promise<void>
  fetchSummary: (year: number, month: number) => Promise<void>
  addTransaction:    (data: any) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  summary:      null,
  loading:      false,
  error:        null,

  fetchByMonth: async (year, month) => {
    set({ loading: true, error: null })
    try {
      const res = await transactionApi.getByMonth(year, month)
      set({ transactions: res.data.data, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  fetchSummary: async (year, month) => {
    try {
      const res = await transactionApi.getSummary(year, month)
      set({ summary: res.data.data })
    } catch (e) {
      console.error(e)
    }
  },

  addTransaction: async (data) => {
    const res = await transactionApi.create(data)
    set(state => ({
      transactions: [res.data.data, ...state.transactions]
    }))
  },

  deleteTransaction: async (id) => {
    await transactionApi.delete(id)
    set(state => ({
      transactions: state.transactions.filter(t => t.id !== id)
    }))
  },
}))