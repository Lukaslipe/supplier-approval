import { useEffect, useState } from "react";
import { CheckCircle, Clock, ShieldAlert, XCircle } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Homologacoes() {

  const [homologacoes, setHomologacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function carregarHomologacoes() {

    try {

      setLoading(true);

      const response = await api.get("/homologacoes");

      setHomologacoes(response.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {
    carregarHomologacoes();
  }, []);

  function riscoClass(risco) {

    if (risco === "Baixo") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (risco === "Médio") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    return "bg-red-100 text-red-700 border-red-200";
  }

  function statusClass(status) {

    if (
      status === "Aprovado" ||
      status === "Aprovado automaticamente"
    ) {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "Reprovado") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  function iconeStatus(status) {

    if (
      status === "Aprovado" ||
      status === "Aprovado automaticamente"
    ) {
      return <CheckCircle className="w-4 h-4" />;
    }

    if (status === "Reprovado") {
      return <XCircle className="w-4 h-4" />;
    }

    return <Clock className="w-4 h-4" />;
  }

  if (loading) {

    return (
      <div className="space-y-4">

        <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-xl" />

        <div className="bg-white rounded-3xl border border-gray-200 p-6">
          <div className="h-16 bg-gray-200 animate-pulse rounded-2xl" />
        </div>

      </div>
    );

  }

  return (

    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Homologações
        </h1>

        <p className="text-gray-500 mt-1">
          Acompanhe e aprove os fornecedores pendentes.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Fornecedor
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Risco
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Score
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Tipo
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  Ação
                </th>

              </tr>

            </thead>

            <tbody>

              {homologacoes.map((homologacao) => (

                <tr
                  key={homologacao.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >

                  <td className="px-6 py-5">

                    <p className="font-semibold text-gray-900">
                      {homologacao.razao_social}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {homologacao.cnpj}
                    </p>

                  </td>

                  <td className="px-6 py-5">

                    <span className={`
                      inline-flex
                      items-center
                      px-3
                      py-1
                      rounded-full
                      border
                      text-xs
                      font-semibold
                      ${riscoClass(homologacao.risco)}
                    `}>
                      {homologacao.risco}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <span className="font-semibold text-gray-900">
                      {homologacao.score}
                    </span>

                    <span className="text-gray-400">
                      /100
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <span className="text-sm text-gray-600">
                      {homologacao.tipo}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <span className={`
                      inline-flex
                      items-center
                      gap-1.5
                      px-3
                      py-1
                      rounded-full
                      border
                      text-xs
                      font-semibold
                      ${statusClass(homologacao.status)}
                    `}>
                      {iconeStatus(homologacao.status)}
                      {homologacao.status}
                    </span>

                  </td>

                  <td className="px-6 py-5 text-right">

                    <button
                      onClick={() =>
                        navigate(
                            `/homologacao/${homologacao.fornecedor_id}`
                        )
                      }
                      className="
                        bg-gray-900
                        hover:bg-gray-800
                        text-white
                        px-4
                        py-2
                        rounded-xl
                        text-sm
                        font-medium
                      "
                    >
                      Abrir
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {homologacoes.length === 0 && (

          <div className="p-12 text-center">

            <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto" />

            <p className="text-gray-500 mt-3">
              Nenhuma homologação encontrada.
            </p>

          </div>

        )}

      </div>

    </div>

  );
}

export default Homologacoes;