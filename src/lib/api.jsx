import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useExpenses = () =>
  useQuery({ queryKey: ['expenses'], queryFn: async () => base44.entities.Expense.list('-date', 1000) });

export const useIncomes = () =>
  useQuery({ queryKey: ['incomes'], queryFn: async () => base44.entities.Income.list('-date', 1000) });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: async () => base44.entities.Category.list('sort_order', 100) });

export const useSettings = () =>
  useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const list = await base44.entities.Settings.list();
      if (list.length === 0) return await base44.entities.Settings.create({ budget: 6000, theme: 'minimal' });
      return list[0];
    },
  });

export const useRefresh = (key) => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: key });
};