import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { endpoints } from "@/lib/api";
type Auth = { user: any; loading: boolean; login(email: string, password: string): Promise<void>; logout(): Promise<void>; can(permission: string): boolean };
const Ctx = createContext<Auth>(null as any);
export function AuthProvider({ children }: { children: React.ReactNode }) { const [user, setUser] = useState<any>(null); const [loading, setLoading] = useState(true); useEffect(() => { endpoints.me().then(setUser).catch(() => null).finally(() => setLoading(false)); }, []); const value = useMemo(() => ({ user, loading, async login(email: string, password: string) { const result = await endpoints.login(email, password); localStorage.setItem("aegis_token", result.token); setUser(result.user); }, async logout() { await endpoints.logout().catch(() => null); localStorage.removeItem("aegis_token"); setUser(null); }, can(permission: string) { return user?.permissions?.includes("*") || user?.permissions?.includes(permission); } }), [user, loading]); return <Ctx.Provider value={value}>{children}</Ctx.Provider>; }
export const useAuth = () => useContext(Ctx);
