import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface Student extends Profile {
  connectionStatus?: 'none' | 'pending' | 'connected';
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async (filters?: {
    country?: string;
    course?: string;
    search?: string;
    role?: string;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*')

      // Apply role filter if specified, otherwise show all students
      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }

      if (filters?.course) {
        query = query.eq('course', filters.course);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,university.ilike.%${filters.search}%,course.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setStudents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
  };
}