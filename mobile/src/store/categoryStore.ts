// src/store/categoryStore.ts
import { create } from 'zustand';
import { categoryApi, Category, CategoryRequest } from '../api/categoryApi';

interface CategoryState {
  loading: boolean;
  expenseCategories: Category[];
  incomeCategories: Category[];
  categories: Category[];
  fetchByType: (type: 'INCOME' | 'EXPENSE') => Promise<void>;
  fetchAll: () => Promise<void>;
  createCategory: (data: CategoryRequest) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>(set => ({
  expenseCategories: [],
  incomeCategories: [],
  categories: [],
  loading: false,

  fetchByType: async type => {
    set({ loading: true });
    try {
      const res = await categoryApi.getByType(type);
      if (type === 'EXPENSE') {
        set(state => ({
          expenseCategories: res.data.data,
          categories: [...res.data.data, ...state.incomeCategories],
          loading: false,
        }));
      } else {
        set(state => ({
          incomeCategories: res.data.data,
          categories: [...state.expenseCategories, ...res.data.data],
          loading: false,
        }));
      }
    } catch (e) {
      set({ loading: false });
    }
  },
  fetchAll: async () => {
    set({ loading: true });
    try {
      const res = await categoryApi.getAll();
      set({ categories: res.data.data });
    } catch (error) {
      set({ loading: false });
    }
  },
  createCategory: async data => {
    const res = await categoryApi.create(data);
    set(state => ({
      categories: [...state.categories, res.data.data],
    }));
  },
}));
