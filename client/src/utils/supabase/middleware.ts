import { createServerClient } from "@supabase/ssr";

const supabaseUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://ofapinsnbqipgpsoxsnf.supabase.co";

const supabaseKey =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  "sb_publishable_9JSZVxuYkboAFADek3shdg_ofM17qls";

export const createClient = (request: any) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies?.getAll?.() || [];
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }: any) => request.cookies?.set?.(name, value));
          } catch {
            // Handled
          }
        },
      },
    },
  );
};

