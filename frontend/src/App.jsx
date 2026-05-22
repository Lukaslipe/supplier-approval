import { Routes, Route } from "react-router-dom";

import Fornecedores from "./pages/Fornecedores";
import FornecedorDetalhe from "./pages/FornecedorDetalhe";
import NovoFornecedor from "./pages/NovoFornecedor";
import Dashboard from "./pages/Dashboard";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

function App() {

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">

          {/* ÍCONE + LINK HOME */}
          <Link
            to="/"
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            <ShieldCheck size={24} />
          </Link>

          {/* TEXTO */}
          <div>

            <h1 className="text-2xl font-bold text-gray-800">
              SupplierGuard
            </h1>

            <p className="text-sm text-gray-500">
              Plataforma de homologação de fornecedores
            </p>

          </div>

        </div>

      </header>

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

        </Routes>

      </main>

    </div>
  );
}

export default App;