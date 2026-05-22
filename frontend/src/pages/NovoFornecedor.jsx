import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function limparCNPJ(valor) {
  return valor.replace(/\D/g, "");
}

function formatarCNPJ(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

function NovoFornecedor() {

  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [fornecedor, setFornecedor] = useState(null);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  async function consultarCNPJ() {

    setErro("");

    if (!cnpj || cnpj.trim() === "") {
      setErro("Informe um CNPJ");
      return;
    }

    const cnpjLimpo = limparCNPJ(cnpj);

    if (cnpjLimpo.length !== 14) {
      setErro("CNPJ inválido");
      return;
    }

    try {

      setLoading(true);

      const response = await api.get(
        `/consulta-cnpj/${cnpjLimpo}`
      );

      setFornecedor(response.data);

    } catch (error) {

    console.error(error);

    if (error.response?.status === 409) {

      setErro("Fornecedor já cadastrado");

    } else if (error.response?.status === 400) {

      setErro("Erro ao consultar CNPJ");

    } else {

      setErro("Erro inesperado");

    }

  } finally {
      setLoading(false);
    }
  }

  async function irParaFornecedor(id) {

    navigate(`/fornecedor/${id}`);

  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Novo fornecedor
      </h2>

      <div className="flex gap-3 mb-6">

        <input
          value={cnpj}
          onChange={(e) => {
            setCnpj(formatarCNPJ(e.target.value));
          }}
          placeholder="Digite o CNPJ"
          className={`
            flex-1
            border
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-gray-900
            ${erro ? "border-red-400" : "border-gray-300"}
          `}
        />

        <button
          onClick={consultarCNPJ}
          disabled={loading}
          className="
            bg-gray-900
            hover:bg-gray-800
            text-white
            px-5
            rounded-xl
            disabled:opacity-50
          "
        >
          {loading ? "Consultando..." : "Consultar"}
        </button>

      </div>

      {erro && (
        <p className="text-sm text-red-500 mt-2">
          {erro}
        </p>
      )}
      
      {fornecedor && fornecedor.fornecedor && (

        <div className="border rounded-xl p-5 bg-gray-50">

          <h3 className="text-lg font-semibold text-gray-800">
            {fornecedor.fornecedor.razao_social}
          </h3>

          <p className="text-sm text-gray-500">
            {fornecedor.fornecedor.cnpj}
          </p>

          <p className="mt-2 text-sm">
            Score: {fornecedor.fornecedor.score}
          </p>

          <p className="text-sm">
            Risco: {fornecedor.fornecedor.risco}
          </p>

          <button
            onClick={() =>
              irParaFornecedor(fornecedor.fornecedor.id)
            }
            className="
              mt-4
              bg-green-600
              hover:bg-green-700
              text-white
              px-4
              py-2
              rounded-xl
            "
          >
            Acessar fornecedor
          </button>

        </div>

      )}

    </div>
  );
}

export default NovoFornecedor;