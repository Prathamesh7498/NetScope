import { createServerClient } from "@supabase/ssr";

const supabaseUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://ofapinsnbqipgpsoxsnf.supabase.co";

const supabaseKey =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  "sb_publishable_9JSZVxuYkboAFADek3shdg_ofM17qls";

export const createClient = (cookieStore: any) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll?.() || [];
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set?.(name, value, options)
            );
          } catch {
            // Handled
          }
        },
      },
    },
  );
};

