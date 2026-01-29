import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiService } from "../categories/api";
import type { LoginResponse } from "../types";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = apiService.getToken();
    if (token) {
      // Token exists, but we need to verify it's valid
      // For now, we'll assume it's valid and set authenticated
      // In a real app, you might want to verify with the backend
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      if (response.user.role !== "admin") {
        apiService.logout();
        throw new Error("Access denied. Admin privileges required.");
      }
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      apiService.logout();
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
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
