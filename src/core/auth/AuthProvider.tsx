import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "@supabase/supabase-js";

import { AuthenticationService } from "./AuthenticationService";

import type {
  AuthContextType,
  ProfileUpdates,
} from "./auth.types";

const AuthContext =
  createContext<AuthContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: Props) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const {
          data,
          error,
        } =
          await AuthenticationService.session();

        if (error) {
          throw error;
        }

        if (mounted) {
          setUser(
            data.session?.user ?? null
          );
        }
      } catch (error) {
        console.error(
          "Auth session error:",
          error
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    const {
      data: {
        subscription,
      },
    } =
      AuthenticationService.onAuthStateChange(
        (_event, session) => {
          if (mounted) {
            setUser(
              session?.user ?? null
            );
          }

          return Promise.resolve();
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login(
    email: string,
    password: string
  ) {
    const {
      error,
    } =
      await AuthenticationService.login(
        email,
        password
      );

    if (error) {
      throw error;
    }
  }

  async function register(
    email: string,
    password: string,
    fullName: string
  ) {
    const {
      error,
    } =
      await AuthenticationService.signUp(
        email,
        password,
        fullName
      );

    if (error) {
      throw error;
    }
  }

  async function logout() {
    const {
      error,
    } =
      await AuthenticationService.logout();

    if (error) {
      throw error;
    }

    setUser(null);
  }

  async function updateProfile(
    updates: ProfileUpdates
  ) {
    console.log(
      "AUTH: Updating profile:",
      updates
    );

    const {
      data,
      error,
    } =
      await AuthenticationService.updateProfile(
        updates
      );

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error(
        "Supabase did not return the updated user."
      );
    }

    console.log(
      "AUTH: Profile updated:",
      data.user.user_metadata
    );

    setUser(data.user);

    /*
     * Get the latest user from Supabase.
     * This guarantees that the Navbar and
     * the rest of the application receive
     * the newest profile information.
     */
    const {
      data: refreshedData,
      error: refreshError,
    } =
      await AuthenticationService.currentUser();

    if (refreshError) {
      console.warn(
        "AUTH: Could not refresh user after profile update:",
        refreshError
      );

      return;
    }

    if (refreshedData.user) {
      setUser(
        refreshedData.user
      );
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
