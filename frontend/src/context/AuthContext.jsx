// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ id: "user123", email: "user@example.com" }); // Placeholder
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/login", credentials);
      localStorage.setItem("token", response.data.token);
      setUser({ id: response.data.user.id, email: response.data.user.email });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
