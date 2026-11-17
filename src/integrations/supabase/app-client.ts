import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "./types";
import { supabase } from "./client";

export type RecipeId = "alcohol" | "without-alcohol" | "black-beer";

type AuthorizedUserRow = {
  email: string;
  active: boolean;
  created_at: string;
};

type AppDatabase = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      authorized_users: {
        Row: { email: string; active: boolean; created_at: string };
        Insert: { email: string; active?: boolean; created_at?: string };
        Update: { email?: string; active?: boolean; created_at?: string };
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
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_app_admin: { Args: Record<string, never>; Returns: boolean };
      is_app_authorized: { Args: Record<string, never>; Returns: boolean };
      admin_list_authorized_users: {
        Args: { p_search?: string | null };
        Returns: AuthorizedUserRow[];
      };
      admin_add_authorized_user: { Args: { p_email: string }; Returns: boolean };
      admin_remove_authorized_user: { Args: { p_email: string }; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export const appSupabase = supabase as unknown as SupabaseClient<AppDatabase>;
