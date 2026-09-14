import { useEffect, useState } from "react";
import { Users, UserPlus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

import api from "../services/api";
import { useAuth, ROLE_LABEL } from "../context/AuthContext";

const ROLES = ["admin", "rh", "juridico", "compras", "comum"];

function Admin() {

  const { usuario: usuarioLogado } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null); // usuário em edição ou null (novo)

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("comum");
  const [ativo, setAtivo] = useState(true);

  async function carregarUsuarios() {
    try {
      const response = await api.get("/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function abrirNovo() {
    setEditando(null);
    setNome("");
    setEmail("");
    setSenha("");
    setRole("comum");
    setAtivo(true);
    setModalAberto(true);
  }

  function abrirEdicao(u) {
    setEditando(u);
    setNome(u.nome);
    setEmail(u.email);
    setSenha("");
    setRole(u.role);
    setAtivo(u.ativo);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  async function salvar() {
    if (!nome || !email || (!editando && !senha)) {
      toast.error("Preencha nome, e-mail e senha");
      return;
    }

    try {
      setSalvando(true);

      if (editando) {
        const payload = { nome, email, role, ativo };
        if (senha) payload.senha = senha;
        await api.put(`/usuarios/${editando.id}`, payload);
        toast.success("Usuário atualizado");
      } else {
        await api.post("/usuarios", { nome, email, senha, role });
        toast.success("Usuário criado");
      }

      fecharModal();
      await carregarUsuarios();

    } catch (error) {
      console.error(error);
      if (error.response?.status === 409) {
        toast.error("E-mail já cadastrado");
      } else {
        toast.error("Erro ao salvar usuário");
      }
    } finally {
      setSalvando(false);
    }
  }

  async function remover(u) {
    if (u.id === usuarioLogado?.id) {
      toast.error("Você não pode remover o próprio usuário");
      return;
    }

    if (!window.confirm(`Remover o usuário ${u.nome}?`)) return;

    try {
      await api.delete(`/usuarios/${u.id}`);
      toast.success("Usuário removido");
      await carregarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover usuário");
    }
  }

  function roleBadge(r) {
    if (r === "admin") return "bg-purple-100 text-purple-700 border-purple-200";
    if (r === "comum") return "bg-gray-100 text-gray-700 border-gray-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="text-sm text-gray-500">Gerencie o acesso e os papéis da equipe</p>
          </div>
        </div>

        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <UserPlus size={18} />
          Novo usuário
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-6 space-y-3">
            <div className="h-12 bg-gray-100 animate-pulse rounded-xl" />
            <div className="h-12 bg-gray-100 animate-pulse rounded-xl" />
            <div className="h-12 bg-gray-100 animate-pulse rounded-xl" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">E-mail</th>
                <th className="px-6 py-4 font-medium">Papel</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0 text-sm">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${roleBadge(u.role)}`}>
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirEdicao(u)}
                        title="Editar"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => remover(u)}
                        title="Remover"
                        disabled={u.id === usuarioLogado?.id}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editando ? "Editar usuário" : "Novo usuário"}
              </h2>
              <button
                onClick={fecharModal}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha {editando && <span className="text-gray-400 font-normal">(deixe em branco para manter)</span>}
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder={editando ? "••••••••" : ""}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Papel</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                  ))}
                </select>
              </div>

              {editando && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    className="w-4 h-4 accent-gray-900"
                  />
                  <span className="text-sm text-gray-700">Usuário ativo</span>
                </label>
              )}

            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={fecharModal}
                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-2xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white py-3 rounded-2xl"
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;
