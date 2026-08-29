"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type UserRole = "USER" | "ADMIN" | "DOCTOR";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  isAdmin: boolean;
  isDoctor: boolean;
  isUser: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message?: string;
    user?: AuthUser;
  }>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Get currently logged-in user
   */
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error(
        "Failed to fetch current user:",
        error
      );

      setUser(null);
    }
  };

  /**
   * Initial authentication check
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      await fetchCurrentUser();

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login
   */
  const login = async (
    email: string,
    password: string
  ) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setUser(null);

        return {
          success: false,
          message:
            data?.message ||
            "Invalid email or password.",
        };
      }

      if (!data?.user) {
        setUser(null);

        return {
          success: false,
          message:
            "Login succeeded but user information was not returned.",
        };
      }

      setUser(data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Login error:", error);

      setUser(null);

      return {
        success: false,
        message:
          "Something went wrong. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  /**
   * Refresh currently logged-in user
   */
  const refreshUser = async () => {
    try {
      await fetchCurrentUser();
    } catch (error) {
      console.error(
        "Failed to refresh user:",
        error
      );
    }
  };

  const isAuthenticated = !!user;

  const isAdmin =
    user?.role === "ADMIN";

  const isDoctor =
    user?.role === "DOCTOR";

  const isUser =
    user?.role === "USER";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,

        isAdmin,
        isDoctor,
        isUser,

        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Auth hook
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}