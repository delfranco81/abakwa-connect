import type { ECOSUser } from "./types";

export class AuthorizationService {
  private currentUser: ECOSUser | null = null;

  login(user: ECOSUser) {
    this.currentUser = user;
  }

  logout() {
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}