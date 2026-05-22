import { useEffect, useMemo, useState } from "react";
import {
  Search,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Building2,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {

  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [filtroRisco, setFiltroRisco] = useState("Todos");

  const navigate = useNavigate();

  async function carregarFornecedores() {

    try {

      const response = await api.get("/fornecedores");

      setFornecedores(response.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregarFornecedores();

  }, []);

  const fornecedoresFiltrados = useMemo(() => {

    return fornecedores.filter((fornecedor) => {

      const buscaLower = busca.toLowerCase();

      const matchBusca =
        fornecedor.razao_social
          ?.toLowerCase()
          .includes(buscaLower) ||
        fornecedor.cnpj?.includes(busca);

      const matchRisco =
        filtroRisco === "Todos" ||
        fornecedor.risco === filtroRisco;

      return matchBusca && matchRisco;

    });

  }, [fornecedores, busca, filtroRisco]);

  const totalFornecedores = fornecedores.length;

  const riscoBaixo = fornecedores.filter(
    (f) => f.risco === "Baixo"
  ).length;

  const riscoMedio = fornecedores.filter(
    (f) => f.risco === "Médio"
  ).length;

  const riscoAlto = fornecedores.filter(
    (f) => f.risco === "Alto"
  ).length;

  const mediaScore = fornecedores.length
    ? (
        fornecedores.reduce(
          (acc, item) => acc + item.score,
          0
        ) / fornecedores.length
      ).toFixed(0)
    : 0;

  const chartData = [
    {
      name: "Baixo",
      value: riscoBaixo,
    },
    {
      name: "Médio",
      value: riscoMedio,
    },
    {
      name: "Alto",
      value: riscoAlto,
    },
  ];

  const COLORS = [
    "#22c55e",
    "#facc15",
    "#ef4444",
  ];

  function riscoClass(risco) {

    if (risco === "Baixo") {
      return "bg-green-100 text-green-700";
    }

    if (risco === "Médio") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  }

  if (loading) {

    return (
      <div className="p-10 text-gray-500">
        Carregando dashboard...
      </div>
    );

  }

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Gestão e análise de risco de fornecedores
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
            transition
          "
        >
          Novo fornecedor
        </Link>

      </div>

      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">

        <Link
            to="/fornecedores"
            className="
                bg-white
                rounded-3xl
                border
                border-gray-200
                p-6
                shadow-sm
                hover:border-gray-400
                transition
                block
            "
        >

          <div className="flex justify-between items-start">

            <div>

              <p className="text-sm text-gray-500">
                Total fornecedores
              </p>

              <h2 className="text-4xl font-bold mt-2 text-gray-900">
                {totalFornecedores}
              </h2>

            </div>

            <div className="bg-gray-100 p-3 rounded-2xl">
              <Building2 className="w-6 h-6 text-gray-700" />
            </div>

          </div>

        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-sm text-gray-500">
                Risco baixo
              </p>

              <h2 className="text-4xl font-bold mt-2 text-green-600">
                {riscoBaixo}
              </h2>

            </div>

            <div className="bg-green-100 p-3 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-green-700" />
            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-sm text-gray-500">
                Risco médio
              </p>

              <h2 className="text-4xl font-bold mt-2 text-yellow-500">
                {riscoMedio}
              </h2>

            </div>

            <div className="bg-yellow-100 p-3 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-yellow-700" />
            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-sm text-gray-500">
                Risco alto
              </p>

              <h2 className="text-4xl font-bold mt-2 text-red-500">
                {riscoAlto}
              </h2>

            </div>

            <div className="bg-red-100 p-3 rounded-2xl">
              <ShieldAlert className="w-6 h-6 text-red-700" />
            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

          <div>

            <p className="text-sm text-gray-500">
              Média score
            </p>

            <h2 className="text-4xl font-bold mt-2 text-gray-900">
              {mediaScore}
            </h2>

          </div>

        </div>

      </div>

      {/* GRÁFICO + ÚLTIMOS */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* CHART */}

        <div className="xl:col-span-1 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Distribuição de risco
              </h2>

              <p className="text-sm text-gray-500">
                Percentual de fornecedores por nível de risco
              </p>

            </div>

          </div>

          <div className="h-72">

            <ResponsiveContainer width="100%" height="100%">

              <PieChart>

                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                >

                  {chartData.map((entry, index) => (

                    <Cell
                      key={index}
                      fill={COLORS[index]}
                    />

                  ))}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* ÚLTIMOS */}

        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Últimos fornecedores
              </h2>

              <p className="text-sm text-gray-500">
                Cadastros recentes
              </p>

            </div>

          </div>

          <div className="space-y-4">

            {fornecedores
              .slice()
              .reverse()
              .slice(0, 5)
              .map((fornecedor) => (

                <div
                  key={fornecedor.id}
                  onClick={() =>
                    navigate(`/fornecedor/${fornecedor.id}`)
                  }
                  className="
                    flex
                    justify-between
                    items-center
                    border
                    border-gray-100
                    rounded-2xl
                    p-4
                    hover:bg-gray-50
                    cursor-pointer
                    transition
                  "
                >

                  <div>

                    <p className="font-medium text-gray-900">
                      {fornecedor.razao_social}
                    </p>

                    <p className="text-sm text-gray-500">
                      {fornecedor.cnpj}
                    </p>

                  </div>

                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${riscoClass(fornecedor.risco)}
                  `}>
                    {fornecedor.risco}
                  </span>

                </div>

              ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;