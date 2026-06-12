import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vault_token");
    if (token) {
      api
        .get("/auth/verify")
        .then(() => setIsAuthenticated(true))
        .catch(() => localStorage.removeItem("vault_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (password) => {
    const { data } = await api.post("/auth/login", { password });
    localStorage.setItem("vault_token", data.token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("vault_token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
