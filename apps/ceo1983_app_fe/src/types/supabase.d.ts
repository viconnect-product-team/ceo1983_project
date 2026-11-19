// Ambient module declarations for legacy Supabase types after full SDK decoupling.
declare module "@supabase/supabase-js" {
  export type SupabaseClient<Database = any, SchemaName = any, Schema = any> = any;
  export function createClient(...args: any[]): any;
  export type User = any;
  export type Session = any;
  export type AuthChangeEvent = any;
  export type PostgrestError = any;
  export type PostgrestResponse<T = any> = { data: T | null; error: any; count?: number | null };
  export type PostgrestSingleResponse<T = any> = { data: T | null; error: any };
}
