export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase?: {
    PostgrestVersion?: string;
  };
  public: {
    Tables: {
      [key: string]: {
        Row: { [key: string]: any };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
        Relationships: any[];
      };
    };
    Views: {
      [key: string]: {
        Row: { [key: string]: any };
        Relationships: any[];
      };
    };
    Functions: {
      [key: string]: {
        Args: { [key: string]: any };
        Returns: any;
      };
    };
    Enums: {
      [key: string]: any;
    };
    CompositeTypes: {
      [key: string]: any;
    };
  };
};
