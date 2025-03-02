import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useSupabaseQuery<T>(tableName: string, query?: any) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mock data for development without Supabase connection
        const mockData = [];
        const error = null;
        const data = mockData;

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, JSON.stringify(query)]);

  return { data, loading, error };
}

export function useSupabaseMutation<T>(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const insert = async (record: any) => {
    try {
      setLoading(true);
      // Mock insert for development without Supabase connection
      // const { data, error } = await supabase
      //   .from(tableName)
      //   .insert(record)
      //   .select();
      const data = [{ id: "mock-id", ...record }];
      const error = null;
      if (error) throw error;
      return data as T[];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, updates: any) => {
    try {
      setLoading(true);
      // Mock update for development without Supabase connection
      // const { data, error } = await supabase
      //   .from(tableName)
      //   .update(updates)
      //   .eq("id", id)
      //   .select();
      const data = [{ id, ...updates }];
      const error = null;
      if (error) throw error;
      return data as T[];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setLoading(true);
      // Mock delete for development without Supabase connection
      // const { error } = await supabase.from(tableName).delete().eq("id", id);
      const error = null;
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { insert, update, remove, loading, error };
}
