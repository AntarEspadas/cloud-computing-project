"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getCurrentUser,
  signIn,
  autoSignIn,
  signOut,
  signUp,
  AuthError,
  confirmSignUp,
} from "aws-amplify/auth";

import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";

console.log("Configuring Amplify ...");
Amplify.configure(outputs);

interface AuthContextType {
  user: { email: string; userId: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | boolean>;
  signup: (email: string, password: string) => Promise<string | boolean>;
  logout: () => void;
  confirmUser: (email: string, code: string) => Promise<string | boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  confirmUser: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
  confirmationPage: string;
}

export function AuthProvider({
  children,
  confirmationPage,
}: AuthProviderProps) {
  const [user, setUser] = useState<{ email: string; userId: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log(user);

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser({
          email: currentUser.signInDetails!.loginId!,
          userId: currentUser.userId,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signup = async (
    email: string,
    password: string
  ): Promise<string | boolean> => {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email },
        },
      });

      setUser({ email, userId: result.userId! });

      if (result.isSignUpComplete) {
        return true;
      }

      if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        router.push(confirmationPage);
        return false;
      }
      return "Signup failed. Please try again.";
    } catch (e) {
      if (e instanceof AuthError) {
        return e.message;
      }
      return "Signup failed. Please try again.";
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<string | boolean> => {
    try {
      const result = await signIn({
        username: email,
        password,
      });

      if (result.isSignedIn) {
        const user = await getCurrentUser();
        setUser({ email: user.username, userId: user.userId });
        return true;
      }

      if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
        router.push(confirmationPage);
        setUser({ email, userId: "" });
        return false;
      }
      return "Login failed. Please try again.";
    } catch (e) {
      if (e instanceof AuthError) {
        return e.message;
      }
      return "Login failed. Please try again.";
    }
  };

  const logout = () => {
    setUser(null);
    return signOut();
  };

  const confirmUser = async (
    email: string,
    code: string
  ): Promise<string | boolean> => {
    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      if (result.isSignUpComplete) {
        setUser({ email, userId: result.userId! });
        return true;
      }

      return "Confirmation failed. Please try again.";
    } catch (e) {
      if (e instanceof AuthError) {
        return e.message;
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, confirmUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
