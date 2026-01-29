import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

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
  // LOGIN DISABLED - Always authenticated
  const [isAuthenticated] = useState(true); // Changed to true - no login required
  const [user] = useState<LoginResponse["user"] | null>({
    id: 999999,
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
  } as LoginResponse["user"]);
  const [loading] = useState(false); // Changed to false - no loading needed

  // useEffect(() => {
  //   // Check if user is already logged in
  //   const token = apiService.getToken();
  //   if (token) {
  //     // Token exists, but we need to verify it's valid
  //     // For now, we'll assume it's valid and set authenticated
  //     // In a real app, you might want to verify with the backend
  //     setIsAuthenticated(true);
  //   }
  //   setLoading(false);
  // }, []);

  // const login = async (email: string, password: string) => {
  //   try {
  //     const response = await apiService.login(email, password);
  //     if (response.user.role !== "admin") {
  //       apiService.logout();
  //       throw new Error("Access denied. Admin privileges required.");
  //     }
  //     setUser(response.user);
  //     setIsAuthenticated(true);
  //   } catch (error: any) {
  //     apiService.logout();
  //     throw error;
  //   }
  // };

  const login = async () => {
    // LOGIN DISABLED - No-op function
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
