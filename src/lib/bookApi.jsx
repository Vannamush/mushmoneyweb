import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const useClients = () =>
  useQuery({ queryKey: ['clients'], queryFn: () => base44.entities.Client.list('name', 500) });

export const useClient = (id) =>
  useQuery({ queryKey: ['client', id], queryFn: () => base44.entities.Client.get(id), enabled: !!id });

export const useVisits = () =>
  useQuery({ queryKey: ['visits'], queryFn: () => base44.entities.Visit.list('-date', 1000) });

export const useBookRefresh = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['clients'] });
    qc.invalidateQueries({ queryKey: ['client'] });
    qc.invalidateQueries({ queryKey: ['visits'] });
  };
};