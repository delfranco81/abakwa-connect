import { IdentityManager } from "../../core/identity";

export class IdentityService {
  login(email: string, password: string) {
    return IdentityManager.auth.login(email, password);
  }

  logout() {
    return IdentityManager.auth.logout();
  }

  currentUser() {
    return IdentityManager.auth.getCurrentUser();
  }
}