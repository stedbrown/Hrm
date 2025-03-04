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
        
        let queryBuilder = supabase.from(tableName).select(query?.select || "*");
        
        if (query?.filter) {
          Object.entries(query.filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryBuilder = queryBuilder.eq(key, value);
            }
          });
        }
        
        if (query?.order) {
          queryBuilder = queryBuilder.order(query.order.column, {
            ascending: query.order.ascending,
          });
        }
        
        if (query?.limit) {
          queryBuilder = queryBuilder.limit(query.limit);
        }
        
        const { data: result, error } = await queryBuilder;
        
        if (error) throw error;
        setData(result as T[]);
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
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select();
      
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
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq("id", id)
        .select();
      
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
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      
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
