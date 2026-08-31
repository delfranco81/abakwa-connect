import { SupabaseAuthAdapter } from "../../infrastructure/supabase/auth";
import type { ECOSUser } from "./types";

export class AuthenticationService {
  private adapter = new SupabaseAuthAdapter();

  private currentUser: ECOSUser | null = null;

  async login(email: string, password: string) {
    const result = await this.adapter.signIn(email, password);

    return result;
  }

  async logout() {
    this.currentUser = null;

    await this.adapter.signOut();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}