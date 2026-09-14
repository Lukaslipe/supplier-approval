import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, LogIn } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destino = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !senha) {
      toast.error("Informe e-mail e senha");
      return;
    }

    try {
      setLoading(true);
      await login(email, senha);
      toast.success("Bem-vindo!");
      navigate(destino, { replace: true });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("E-mail ou senha inválidos");
      } else if (error.response?.status === 403) {
        toast.error("Usuário inativo");
      } else {
        toast.error("Erro ao entrar");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-sm mb-4">
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">SupplierGuard</h1>
          <p className="text-sm text-gray-500">Plataforma de homologação de fornecedores</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-5"
        >

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white py-3 rounded-2xl font-medium"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;
