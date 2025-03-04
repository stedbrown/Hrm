import { useState, useEffect } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type RealtimeSubscription = {
  table: string;
  schema?: string;
  filter?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  callback: (payload: any) => void;
};

export function useRealtime(subscriptions: RealtimeSubscription[]) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Create a new realtime channel
    const newChannel = supabase.channel("db-changes");

    // Add all subscriptions to the channel
    subscriptions.forEach((sub) => {
      newChannel.on(
        "postgres_changes" as any,
        {
          event: sub.event || "*",
          schema: sub.schema || "public",
          table: sub.table,
          filter: sub.filter,
        },
        (payload) => {
          sub.callback(payload);
        },
      );
    });

    // Subscribe to the channel
    newChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("Connected to realtime changes");
      }
    });

    setChannel(newChannel);

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      newChannel.unsubscribe();
    };
  }, []);

  return { channel };
}
