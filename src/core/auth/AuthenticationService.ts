import { supabase } from "@/core/database/supabase";

import type {
  AuthChangeEvent,
  Session,
} from "@supabase/supabase-js";

export interface ProfileUpdates {
  full_name?: string;
  username?: string;
  phone?: string;
  avatar_url?: string;
}

export class AuthenticationService {
  static async signUp(
    email: string,
    password: string,
    fullName: string
  ) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });
  }

  static async login(
    email: string,
    password: string
  ) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  static async logout() {
    return supabase.auth.signOut();
  }

  static async updateProfile(
    updates: ProfileUpdates
  ) {
    const cleanedUpdates: ProfileUpdates = {};

    if (updates.full_name !== undefined) {
      cleanedUpdates.full_name =
        updates.full_name.trim();
    }

    if (updates.username !== undefined) {
      cleanedUpdates.username =
        updates.username.trim();
    }

    if (updates.phone !== undefined) {
      cleanedUpdates.phone =
        updates.phone.trim();
    }

    if (updates.avatar_url !== undefined) {
      cleanedUpdates.avatar_url =
        updates.avatar_url;
    }

    console.log(
      "PROFILE: Saving profile metadata:",
      cleanedUpdates
    );

    const result =
      await supabase.auth.updateUser({
        data: cleanedUpdates,
      });

    if (result.error) {
      console.error(
        "PROFILE: Supabase profile update failed:",
        result.error
      );
    } else {
      console.log(
        "PROFILE: Supabase profile update successful:",
        result.data.user?.user_metadata
      );
    }

    return result;
  }

  static async currentUser() {
    return supabase.auth.getUser();
  }

  static async session() {
    return supabase.auth.getSession();
  }

  static onAuthStateChange(
    callback: (
      event: AuthChangeEvent,
      session: Session | null
    ) => Promise<void>
  ) {
    return supabase.auth.onAuthStateChange(
      callback
    );
  }
}
