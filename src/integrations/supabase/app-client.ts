import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "./types";
import { supabase } from "./client";

export type RecipeId = "alcohol" | "without-alcohol" | "black-beer";

type AppDatabase = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      authorized_users: {
        Row: { email: string; role: "admin" | "user"; active: boolean; created_at: string };
        Insert: { email: string; role?: "admin" | "user"; active?: boolean; created_at?: string };
        Update: { email?: string; role?: "admin" | "user"; active?: boolean; created_at?: string };
        Relationships: [];
      };
      wedding_cake_recipes: {
        Row: { id: RecipeId; recipe: Json; updated_at: string };
        Insert: { id: RecipeId; recipe: Json; updated_at?: string };
        Update: { id?: RecipeId; recipe?: Json; updated_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_app_authorized: { Args: Record<string, never>; Returns: boolean };
      is_app_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export const appSupabase = supabase as unknown as SupabaseClient<AppDatabase>;