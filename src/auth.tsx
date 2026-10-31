/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { call, setToken, setUnauthorizedHandler } from "./api";
import type { Role, SessionUser } from "./types";

type AuthCtx = {
  user: SessionUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const r = await call<{ token: string; user: SessionUser }>("auth:login", { username, password });
    setToken(r.token);
    setUser(r.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await call("auth:logout");
    } catch {
      /* si no hay conexión igual se cierra la sesión local */
    }
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fuera de AuthProvider");
  return c;
}

export const homeFor = (role: Role) => (role === "admin" ? "/reloj" : "/justificaciones");

/** Protege un grupo de rutas: sin sesión -> login; rol no permitido -> inicio del rol. */
export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
