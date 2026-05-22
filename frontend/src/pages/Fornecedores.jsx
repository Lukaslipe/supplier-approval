import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Search } from "lucide-react";

function Fornecedores() {

  const [fornecedores, setFornecedores] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroRisco, setFiltroRisco] = useState("Todos");

  const navigate = useNavigate();

  async function carregarFornecedores() {

    try {

      const response = await api.get("/fornecedores");

      setFornecedores(response.data);

    } catch (error) {

      console.error(error);

    }

  }

  useEffect(() => {

    carregarFornecedores();

  }, []);

  function riscoClass(risco) {

    if (risco === "Baixo") {
      return "bg-green-100 text-green-700";
    }

    if (risco === "Médio") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  }

  const fornecedoresFiltrados = fornecedores.filter(
    (fornecedor) => {

      const buscaLower = busca.toLowerCase();

      const matchBusca =

        fornecedor.razao_social
          ?.toLowerCase()
          .includes(buscaLower)

        ||

        fornecedor.cnpj
          ?.includes(busca);

      const matchRisco =

        filtroRisco === "Todos"

        ||

        fornecedor.risco === filtroRisco;

      return matchBusca && matchRisco;

    }
  );

  return (

    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

      {/* HEADER */}

      <div className="p-6 border-b border-gray-200">

        <div className="flex justify-between items-center">

          <div>

            <h2 className="text-2xl font-bold text-gray-800">
              Fornecedores
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Gerencie e visualize fornecedores cadastrados
            </p>

          </div>

          <Link
            to="/novo-fornecedor"
            className="
              bg-gray-900
              hover:bg-gray-800
              text-white
              px-5
              py-3
              rounded-2xl
              text-sm
              font-medium
              transition
            "
          >
            Novo fornecedor
          </Link>

        </div>

      </div>

      {/* FILTROS */}

      <div className="p-6 border-b border-gray-100">

        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

          {/* BUSCA */}

          <div className="relative w-full md:w-96">

            <Search
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                w-4
                h-4
                text-gray-400
              "
            />

            <input
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
              placeholder="Buscar empresa ou CNPJ..."
              className="
                w-full
                pl-10
                pr-4
                py-3
                border
                border-gray-200
                rounded-2xl
                outline-none
                focus:ring-2
                focus:ring-gray-900
              "
            />

          </div>

          {/* FILTRO RISCO */}

          <select
            value={filtroRisco}
            onChange={(e) =>
              setFiltroRisco(e.target.value)
            }
            className="
              border
              border-gray-200
              rounded-2xl
              px-4
              py-3
              outline-none
              focus:ring-2
              focus:ring-gray-900
              bg-white
            "
          >

            <option value="Todos">
              Todos riscos
            </option>

            <option value="Baixo">
              Baixo
            </option>

            <option value="Médio">
              Médio
            </option>

            <option value="Alto">
              Alto
            </option>

          </select>

        </div>

      </div>

      {/* TABELA */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Empresa
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                CNPJ
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Score
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Risco
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Situação
              </th>

            </tr>

          </thead>

          <tbody>

            {fornecedoresFiltrados.map((fornecedor) => (

              <tr
                key={fornecedor.id}
                onClick={() =>
                  navigate(`/fornecedor/${fornecedor.id}`)
                }
                className="
                  border-t
                  border-gray-100
                  hover:bg-gray-50
                  transition
                  cursor-pointer
                "
              >

                <td className="px-6 py-5">

                  <p className="font-semibold text-gray-800">
                    {fornecedor.razao_social}
                  </p>

                </td>

                <td className="px-6 py-5 text-sm text-gray-600">
                  {fornecedor.cnpj}
                </td>

                <td className="px-6 py-5">

                  <div className="font-bold text-gray-800">
                    {fornecedor.score}
                  </div>

                </td>

                <td className="px-6 py-5">

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      ${riscoClass(fornecedor.risco)}
                    `}
                  >
                    {fornecedor.risco}
                  </span>

                </td>

                <td className="px-6 py-5 text-sm text-gray-600">
                  {fornecedor.situacao}
                </td>

              </tr>

            ))}

            {fornecedoresFiltrados.length === 0 && (

              <tr>

                <td
                  colSpan={5}
                  className="
                    text-center
                    py-16
                    text-gray-400
                  "
                >

                  Nenhum fornecedor encontrado

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );
}

export default Fornecedores;