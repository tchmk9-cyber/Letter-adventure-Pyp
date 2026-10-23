import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { setCustomVoices } from "@/lib/sound";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=anon, obj=auth
  const [child, setChild] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(false);
    }
  }, []);

  const loadVoices = useCallback(async () => {
    try {
      const { data } = await api.get("/voice");
      setCustomVoices(data);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const saved = localStorage.getItem("activeChildId");
    if (saved) setChild(JSON.parse(localStorage.getItem("activeChild") || "null"));
  }, [refresh]);

  useEffect(() => {
    if (user) loadVoices();
  }, [user, loadVoices]);

  useEffect(() => {
    if (!user) return;
    const id = localStorage.getItem("activeChildId");
    if (id) {
      api.get(`/children/${id}`)
        .then(({ data }) => selectChild(data))
        .catch((e) => { if (e.response?.status === 404) selectChild(null); });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectChild = (c) => {
    setChild(c);
    if (c) {
      localStorage.setItem("activeChildId", c.id);
      localStorage.setItem("activeChild", JSON.stringify(c));
    } else {
      localStorage.removeItem("activeChildId");
      localStorage.removeItem("activeChild");
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(false);
    selectChild(null);
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, child, selectChild, refresh, logout, loadVoices }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
