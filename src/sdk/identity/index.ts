import { IdentityManager } from "../../core/identity";

export const identity = {
  login(email: string, password: string) {
    return IdentityManager.auth.login(email, password);
  },

  logout() {
    return IdentityManager.auth.logout();
  },

  currentUser() {
    return IdentityManager.auth.getCurrentUser();
  },

  isAuthenticated() {
    return IdentityManager.auth.isAuthenticated();
  },
};