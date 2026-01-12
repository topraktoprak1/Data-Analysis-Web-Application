import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type User = {
  username: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  signin: (username: string, password?: string) => Promise<boolean>;
  signout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("__app_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("__app_user", JSON.stringify(user));
    else localStorage.removeItem("__app_user");
  }, [user]);

  async function signin(username: string, password?: string) {
    try {
      // Call backend login endpoint with username/password to validate credentials.
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return false;
      const payload = await res.json();
      if (payload && payload.success) {
        const role = payload.role || "user";
        const name = payload.name || username;
        const u: User = { username: name, isAdmin: role === "admin" };
        setUser(u);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function signout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
