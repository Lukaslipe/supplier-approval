import { Routes, Route, Link, useLocation } from "react-router-dom";

import Fornecedores from "./pages/Fornecedores";
import FornecedorDetalhe from "./pages/FornecedorDetalhe";
import NovoFornecedor from "./pages/NovoFornecedor";
import Dashboard from "./pages/Dashboard";
import Homologacoes from "./pages/Homologacoes";
import HomologacaoDetalhe from "./pages/HomologacaoDetalhe";

import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Plus
} from "lucide-react";

function Header() {

  const location = useLocation();

  function navClass(path) {

    const active = location.pathname === path;

    return `
      flex
      items-center
      gap-2
      px-4
      py-2.5
      rounded-xl
      text-sm
      font-medium
      transition
      ${active
        ? "bg-gray-900 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }
    `;
  }

  return (

    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ESQUERDA */}
        <Link
          to="/"
          className="flex items-center gap-4 group"
        >

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-gray-900
            text-white
            flex
            items-center
            justify-center
            shadow-sm
            group-hover:bg-gray-800
            transition
          ">

            <ShieldCheck size={24} />

          </div>

          <div>

            <h1 className="text-2xl font-bold text-gray-800">
              SupplierGuard
            </h1>

            <p className="text-sm text-gray-500">
              Plataforma de homologação de fornecedores
            </p>

          </div>

        </Link>

        {/* DIREITA */}
        <nav className="flex items-center gap-3">

          <Link
            to="/"
            className={navClass("/")}
          >

            <LayoutDashboard size={18} />

            Dashboard

          </Link>

          <Link
            to="/homologacoes"
            className={navClass("/homologacoes")}
          >

            <LayoutDashboard size={18} />

            Homologações

          </Link>

          <Link
            to="/fornecedores"
            className={navClass("/fornecedores")}
          >

            <Building2 size={18} />

            Fornecedores

          </Link>

          <Link
            to="/novo-fornecedor"
            className="
              flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              bg-gray-900
              text-white
              text-sm
              font-medium
              hover:bg-gray-800
              transition
            "
          >

            <Plus size={18} />

            Novo fornecedor

          </Link>

        </nav>

      </div>

    </header>

  );

}

function App() {

  return (

    <div className="min-h-screen bg-gray-100">

      <Header />

      <main className="max-w-7xl mx-auto p-6">

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/fornecedores"
            element={<Fornecedores />}
          />

          <Route
            path="/fornecedor/:id"
            element={<FornecedorDetalhe />}
          />

          <Route
            path="/novo-fornecedor"
            element={<NovoFornecedor />}
          />

          <Route
            path="/homologacoes"
            element={<Homologacoes />}
          />

          <Route
            path="/homologacao/:id"
            element={<HomologacaoDetalhe />}
          />

        </Routes>

      </main>

    </div>

  );

}

export default App;