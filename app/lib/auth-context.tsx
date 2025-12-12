"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  user: { email: string; userId: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string; userId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);
  }, []);

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem("auth_users");
      const users = usersData ? JSON.parse(usersData) : {};

      // Check if user already exists
      if (users[email]) {
        throw new Error("User already exists");
      }

      // Store new user
      users[email] = {
        password,
        userId: `user_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("auth_users", JSON.stringify(users));

      // Auto login
      const newUser = {
        email,
        userId: users[email].userId,
      };
      setUser(newUser);
      localStorage.setItem("auth_user", JSON.stringify(newUser));

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem("auth_users");
      const users = usersData ? JSON.parse(usersData) : {};

      // Check credentials
      if (!users[email] || users[email].password !== password) {
        throw new Error("Invalid credentials");
      }

      // Set user
      const loggedInUser = {
        email,
        userId: users[email].userId,
      };
      setUser(loggedInUser);
      localStorage.setItem("auth_user", JSON.stringify(loggedInUser));

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const refreshUser = async () => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
