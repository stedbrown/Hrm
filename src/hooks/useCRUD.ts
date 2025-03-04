import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCRUD<T extends Record<string, any>>(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: Omit<T, "id">) => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select();

      if (error) throw error;
      return result as T[];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const read = async (id?: string, query?: any) => {
    try {
      setLoading(true);
      setError(null);

      let queryBuilder = supabase.from(tableName).select(query?.select || "*");

      if (id) {
        queryBuilder = queryBuilder.eq("id", id);
      }

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

      const { data, error } = await queryBuilder;

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return [];
      }
      return data as unknown as T[];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq("id", id)
        .select();

      if (error) throw error;
      return result as T[];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.from(tableName).delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    read,
    update,
    remove,
    loading,
    error,
  };
}
