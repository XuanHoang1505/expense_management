import api from './axiosInstance';

export interface Category {
  id: number;
  name: string;
  icon: string | null;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  isDefault: boolean;
}

export interface CategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  type: 'INCOME' | 'EXPENSE';
}

export const categoryApi = {
  getAll: () => api.get<{ data: Category[] }>('/categories'),
  getByType: (type: string) =>
    api.get<{ data: Category[] }>(`/categories/type/${type}`),
  create: (data: CategoryRequest) =>
    api.post<{ data: Category }>('/categories', data),
  update: (id: number, data: CategoryRequest) =>
    api.put<{ data: Category }>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};
