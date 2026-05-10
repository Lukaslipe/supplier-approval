import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Fornecedores() {

  const [fornecedores, setFornecedores] = useState([]);
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

  return (

    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Fornecedores
          </h2>

          <Link
            to="/novo-fornecedor"
            className="
              bg-gray-900
              text-white
              px-4
              py-2
              rounded-xl
              text-sm
            "
          >
            Novo fornecedor
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Empresa
              </th>

              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                CNPJ
              </th>

              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Score
              </th>

              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Risco
              </th>

              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Situação
              </th>

            </tr>

          </thead>

          <tbody>

            {fornecedores.map((fornecedor) => (

                <tr
                    key={fornecedor.id}
                    onClick={() => navigate(`/fornecedor/${fornecedor.id}`)}
                    className="border-t border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                >

                <td className="px-6 py-4">

                  <div>

                    <p className="font-medium text-gray-800">
                      {fornecedor.razao_social}
                    </p>

                    <p className="text-sm text-gray-500">
                      {fornecedor.nome_fantasia}
                    </p>

                  </div>

                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {fornecedor.cnpj}
                </td>

                <td className="px-6 py-4">

                  <div className="font-semibold text-gray-800">
                    {fornecedor.score}
                  </div>

                </td>

                <td className="px-6 py-4">

                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${riscoClass(fornecedor.risco)}
                  `}>
                    {fornecedor.risco}
                  </span>

                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {fornecedor.situacao}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Fornecedores;