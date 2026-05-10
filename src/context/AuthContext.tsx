import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { UsersAPI } from "@/services/api";
import type { User } from "@/data/mock";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; locationId: number; universityId?: number }) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) try { setUser(JSON.parse(raw)); } catch {}
  }, []);

  const persist = (u: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", token);
    setUser(u);
  };

  const login: AuthCtx["login"] = async (email, password) => {
    setLoading(true);
    try { const { user, token } = await UsersAPI.login(email, password); persist(user, token); }
    finally { setLoading(false); }
  };

  const register: AuthCtx["register"] = async (data) => {
    setLoading(true);
    try { const { user, token } = await UsersAPI.register(data); persist(user, token); }
    finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
