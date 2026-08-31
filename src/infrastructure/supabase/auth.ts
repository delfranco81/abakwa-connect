import { supabase } from "./client";

export class SupabaseAuthAdapter {
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut() {
    return await supabase.auth.signOut();
  }

  async currentUser() {
    return await supabase.auth.getUser();
  }
}