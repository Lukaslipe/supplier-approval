import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// Mapeia o papel do usuário ao setor da homologação (espelha o backend)
export const ROLE_PARA_SETOR = {
  rh: "RH",
  juridico: "Jurídico",
  compras: "Compras",
};

export const ROLE_LABEL = {
  admin: "Administrador",
  rh: "RH",
  juridico: "Jurídico",
  compras: "Compras",
  comum: "Usuário comum",
};

export function AuthProvider({ children }) {

  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  async function login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });

    const { token, usuario: dadosUsuario } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(dadosUsuario));

    setUsuario(dadosUsuario);

    return dadosUsuario;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  // Setor que este usuário pode aprovar (null se não for aprovador)
  const setorDoUsuario = usuario ? ROLE_PARA_SETOR[usuario.role] || null : null;

  const value = {
    usuario,
    login,
    logout,
    isAutenticado: !!usuario,
    isAdmin: usuario?.role === "admin",
    setorDoUsuario,
    // admin pode aprovar qualquer setor; aprovadores só o seu
    podeAprovarSetor: (setor) =>
      usuario?.role === "admin" || setorDoUsuario === setor,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
