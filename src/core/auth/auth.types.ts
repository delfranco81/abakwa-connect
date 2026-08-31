import type { User } from "@supabase/supabase-js";

export interface ProfileUpdates {
  full_name?: string;
  username?: string;
  phone?: string;
  avatar_url?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;

  login(
    email: string,
    password: string
  ): Promise<void>;

  logout(): Promise<void>;

  register(
    email: string,
    password: string,
    fullName: string
  ): Promise<void>;

  updateProfile(
    updates: ProfileUpdates
  ): Promise<void>;
}
