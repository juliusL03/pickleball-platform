"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ME_QUERY } from "@juls/pickleball-kit/graphql";
import { createGraphQLClient } from "@juls/pickleball-kit/sdk";
import { clearToken, getToken } from "@/lib/auth";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  permissions: string[];
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: () => {},
});

const client = createGraphQLClient({
  url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/graphql",
  getToken,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await client.request<{ me: User }>(ME_QUERY);
        if (data.me.role !== "staff" && data.me.role !== "owner") {
          clearToken();
          setUser(null);
          router.push("/login");
          return;
        }
        setUser(data.me);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function logout() {
    clearToken();
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
