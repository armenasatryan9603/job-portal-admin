import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { LoginResponse } from "../types";
import { apiService } from "../categories/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: LoginResponse["user"] | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // LOGIN DISABLED - Auto-login with hardcoded credentials
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-login with hardcoded credentials
    const autoLogin = async () => {
      try {
        // Hardcoded admin credentials (matching backend)
        const HARDCODED_ADMIN_EMAIL = "admin@example.com";
        const HARDCODED_ADMIN_PASSWORD = "admin123";

        // Check if token already exists
        const existingToken = apiService.getToken();
        if (existingToken) {
          // Token exists, set authenticated
          setIsAuthenticated(true);
          setUser({
            id: 999999,
            email: HARDCODED_ADMIN_EMAIL,
            name: "Admin User",
            role: "admin",
          } as LoginResponse["user"]);
          setLoading(false);
          return;
        }

        // Auto-login with hardcoded credentials
        const response = await apiService.login(HARDCODED_ADMIN_EMAIL, HARDCODED_ADMIN_PASSWORD);
        if (response.user.role !== "admin") {
          apiService.logout();
          throw new Error("Access denied. Admin privileges required.");
        }
        setUser(response.user);
        setIsAuthenticated(true);
      } catch (error: any) {
        console.error("Auto-login failed:", error);
        // Even if auto-login fails, set authenticated to allow access
        setIsAuthenticated(true);
        setUser({
          id: 999999,
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
        } as LoginResponse["user"]);
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, []);

  const login = async (_email: string, _password: string) => {
    // LOGIN DISABLED - Auto-login is handled in useEffect
    // This function is kept for compatibility but does nothing
    return Promise.resolve();
  };

  const logout = () => {
    // LOGIN DISABLED - No-op function
    // apiService.logout();
    // setUser(null);
    // setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
