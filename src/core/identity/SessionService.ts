export class SessionService {
  static save(token: string) {
    localStorage.setItem("ecos_session", token);
  }

  static get() {
    return localStorage.getItem("ecos_session");
  }

  static clear() {
    localStorage.removeItem("ecos_session");
  }
}