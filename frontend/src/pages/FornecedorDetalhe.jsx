import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  AlertTriangle,
  Brain,
  Building2,
  FileWarning,
  MapPin,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import api from "../services/api";

function FornecedorDetalhe() {

  const { id } = useParams();

  const [fornecedor, setFornecedor] = useState(null);
  const [analises, setAnalises] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [loadingIA, setLoadingIA] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  const [tipoOcorrencia, setTipoOcorrencia] = useState("");
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState("");
  const [impactoOcorrencia, setImpactoOcorrencia] = useState("");

  const [aprovacoes, setAprovacoes] = useState({
    rh: "Pendente",
    juridico: "Pendente",
    compras: "Pendente"
  });

  const [aba, setAba] = useState("overview");

  function statusClass(status) {

    if (status === "Aprovado") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "Pendente") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    return "bg-red-100 text-red-700 border-red-200";
  }

  async function salvarAprovacao(setor, status) {
    try {
      await api.post(`/fornecedores/${id}/aprovacao`, {
        setor,
        status
      });

      await carregarAprovacoes();

    } catch (error) {
      console.error(error);
    }
  }

  async function carregarAprovacoes() {
    try {
      const response = await api.get(`/fornecedores/${id}/aprovacoes`);

      const dados = {
        rh: "Pendente",
        juridico: "Pendente",
        compras: "Pendente"
      };

      response.data.forEach((item) => {
        dados[item.setor.toLowerCase()] = item.status;
      });

      setAprovacoes(dados);

    } catch (error) {
      console.error(error);
    }
  }

  function riscoClass(risco) {

    if (risco === "Baixo") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (risco === "Médio") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    return "bg-red-100 text-red-700 border-red-200";
  }

  function riscoBarClass(risco) {

    if (risco === "Baixo") {
      return "bg-green-500";
    }

    if (risco === "Médio") {
      return "bg-yellow-500";
    }

    return "bg-red-500";
  }

  async function carregarHistoricoScore() {

    try {

      const response = await api.get(
        `/fornecedores/${id}/historico-score`
      );

      const data = response.data.map(item => ({
        nome: item.label,
        score: Number(item.score) || 0
      }));

      setChartData(data);

    } catch (error) {

      console.error(error);

    }

  }

  async function carregarFornecedor() {

    try {

      const response = await api.get(`/fornecedores/${id}`);

      setFornecedor(response.data);

    } catch (error) {

      console.error(error);

    }

  }

  async function carregarAnalises() {

    try {

      const response = await api.get(
        `/fornecedores/${id}/analises-ia`
      );

      setAnalises(response.data);

    } catch (error) {

      console.error(error);

    }

  }

  async function carregarOcorrencias() {

    try {

      const response = await api.get(
        `/fornecedores/${id}/ocorrencias`
      );

      setOcorrencias(response.data);

    } catch (error) {

      console.error(error);

    }

  }

  async function gerarAnaliseIA() {

    try {

      setLoadingIA(true);

      await api.post(
        `/fornecedores/${id}/analise-ia`
      );

      await carregarAnalises();

    } catch (error) {

      console.error(error);

    } finally {

      setLoadingIA(false);

    }

  }

  async function adicionarOcorrencia() {

    if (!tipoOcorrencia) {
      return;
    }

    try {

      setGlobalLoading(true);

      await api.post("/ocorrencias", {

        fornecedor_id: fornecedor.id,

        tipo: tipoOcorrencia,

        descricao: descricaoOcorrencia,

        impacto: Number(impactoOcorrencia || 0)

      });

      setTipoOcorrencia("");
      setDescricaoOcorrencia("");
      setImpactoOcorrencia("");

      await carregarFornecedor();
      await carregarOcorrencias();
      await carregarAnalises();
      await carregarHistoricoScore();

    } catch (error) {

      console.error(error);

    } finally {

      setGlobalLoading(false);

    }

  }

  useEffect(() => {

    carregarFornecedor();
    carregarAnalises();
    carregarOcorrencias();
    carregarHistoricoScore();
    carregarAprovacoes();

  }, []);
  
  if (!fornecedor) {

    return (

      <div className="space-y-4">

        <div className="h-52 bg-gray-200 animate-pulse rounded-3xl"></div>

        <div className="grid grid-cols-4 gap-4">

          <div className="h-32 bg-gray-200 animate-pulse rounded-3xl"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-3xl"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-3xl"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-3xl"></div>

        </div>

      </div>

    );

  }

  return (

    <div className="space-y-6">

      {/* HERO */}

      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

        <div className="p-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            {/* ESQUERDA */}

            <div className="flex items-start gap-5">

              <div className="
                w-16
                h-16
                rounded-2xl
                bg-gray-100
                flex
                items-center
                justify-center
              ">

                <Building2 className="w-8 h-8 text-gray-700" />

              </div>

              <div>

                <h1 className="text-3xl font-bold text-gray-900">
                  {fornecedor.razao_social}
                </h1>

                <p className="text-gray-500 mt-1">
                  {fornecedor.cnpj}
                </p>

                <div className="flex items-center gap-2 mt-4">

                  <span className={`
                    px-4
                    py-2
                    rounded-full
                    border
                    text-sm
                    font-semibold
                    ${riscoClass(fornecedor.risco)}
                  `}>

                    {fornecedor.risco}

                  </span>

                  <span className="
                    px-4
                    py-2
                    rounded-full
                    bg-gray-100
                    text-sm
                    text-gray-700
                  ">

                    {fornecedor.situacao}

                  </span>

                </div>

              </div>

            </div>

            {/* SCORE */}

            <div className="flex flex-col items-center">

              <div className="
                w-40
                h-40
                rounded-full
                border-[12px]
                border-gray-100
                flex
                items-center
                justify-center
                relative
              ">

                <div
                  className={`
                    absolute
                    inset-0
                    rounded-full
                    border-[12px]
                    ${fornecedor.risco === "Baixo"
                      ? "border-green-500"
                      : fornecedor.risco === "Médio"
                      ? "border-yellow-500"
                      : "border-red-500"
                    }
                    border-r-transparent
                    border-b-transparent
                    rotate-45
                  `}
                />

                <div className="text-center">

                  <p className="text-5xl font-bold text-gray-900">
                    {fornecedor.score}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    SCORE
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* BARRA */}

          <div className="mt-8">

            <div className="flex justify-between text-sm mb-2">

              <span className="text-gray-500">
                Nível de confiabilidade
              </span>

              <span className="font-semibold text-gray-800">
                {fornecedor.score}/100
              </span>

            </div>

            <div className="w-full h-4 rounded-full bg-gray-100 overflow-hidden">

              <div
                style={{
                  width: `${fornecedor.score}%`
                }}
                className={`
                  h-full
                  ${riscoBarClass(fornecedor.risco)}
                `}
              />

            </div>

          </div>

        </div>

      </div>

      {/* KPIS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Ocorrências
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {ocorrencias.length}
              </h2>

            </div>

            <FileWarning className="w-8 h-8 text-gray-400" />

          </div>

        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Análises IA
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {analises.length}
              </h2>

            </div>

            <Brain className="w-8 h-8 text-gray-400" />

          </div>

        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Cidade
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-2">
                {fornecedor.cidade}
              </h2>

            </div>

            <MapPin className="w-8 h-8 text-gray-400" />

          </div>

        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Porte
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-2">
                {fornecedor.porte}
              </h2>

            </div>

            <ShieldAlert className="w-8 h-8 text-gray-400" />

          </div>

        </div>

      </div>

      {/* TABS */}

      <div className="flex gap-3">

        <button
          onClick={() => setAba("overview")}
          className={`
            px-5
            py-3
            rounded-2xl
            text-sm
            font-medium
            transition
            ${aba === "overview"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-700"
            }
          `}
        >
          Visão geral
        </button>

        <button
          onClick={() => setAba("ocorrencias")}
          className={`
            px-5
            py-3
            rounded-2xl
            text-sm
            font-medium
            transition
            ${aba === "ocorrencias"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-700"
            }
          `}
        >
          Ocorrências
        </button>

        <button
          onClick={() => setAba("ia")}
          className={`
            px-5
            py-3
            rounded-2xl
            text-sm
            font-medium
            transition
            ${aba === "ia"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-700"
            }
          `}
        >
          IA
        </button>

      </div>

      {/* OVERVIEW */}

      {aba === "overview" && (

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* GRAFICO */}

          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-2 mb-6">

              <TrendingDown className="w-5 h-5 text-gray-700" />

              <h2 className="text-lg font-semibold text-gray-900">
                Evolução do score
              </h2>

            </div>

            <div className="h-80 min-w-0">

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="nome" />

                  <YAxis domain={[0, 100]} />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Score"
                    stroke="#111827"
                    strokeWidth={3}
                  />
                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* IA */}

          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-2">

                <Brain className="w-5 h-5 text-gray-700" />

                <h2 className="text-lg font-semibold text-gray-900">
                  Última IA
                </h2>

              </div>

              <button
                onClick={gerarAnaliseIA}
                disabled={loadingIA}
                className="
                  bg-gray-900
                  hover:bg-gray-800
                  text-white
                  px-4
                  py-2
                  rounded-xl
                  text-sm
                "
              >

                {loadingIA
                  ? "Gerando..."
                  : "Gerar"}

              </button>

            </div>

            <div className="
              bg-gray-50
              rounded-2xl
              p-5
              border
              border-gray-200
            ">

              <p className="text-gray-700 leading-relaxed">

                {analises[0]?.parecer ||
                  "Nenhuma análise disponível."}

              </p>

            </div>

          </div>

        </div>

      )}

      {/* OCORRENCIAS */}

      {aba === "ocorrencias" && (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* FORM */}

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Nova ocorrência
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Tipo"
                value={tipoOcorrencia}
                onChange={(e) =>
                  setTipoOcorrencia(e.target.value)
                }
                className="
                  w-full
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-gray-900
                "
              />

              <textarea
                placeholder="Descrição"
                value={descricaoOcorrencia}
                onChange={(e) =>
                  setDescricaoOcorrencia(e.target.value)
                }
                className="
                  w-full
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-gray-900
                  min-h-32
                "
              />

              <input
                type="number"
                placeholder="Impacto"
                value={impactoOcorrencia}
                onChange={(e) =>
                  setImpactoOcorrencia(e.target.value)
                }
                className="
                  w-full
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-gray-900
                "
              />

              <button
                onClick={adicionarOcorrencia}
                className="
                  w-full
                  bg-gray-900
                  hover:bg-gray-800
                  text-white
                  py-3
                  rounded-2xl
                  font-medium
                "
              >
                Registrar ocorrência
              </button>

            </div>

          </div>

          {/* TIMELINE */}

          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

            <h2 className="text-lg font-semibold text-gray-900 mb-8">
              Timeline de ocorrências
            </h2>

            <div className="space-y-8">

              {ocorrencias.map((ocorrencia) => (

                <div
                  key={ocorrencia.id}
                  className="flex gap-5"
                >

                  <div className="flex flex-col items-center">

                    <div className="
                      w-12
                      h-12
                      rounded-full
                      bg-red-100
                      flex
                      items-center
                      justify-center
                    ">

                      <AlertTriangle className="w-5 h-5 text-red-600" />

                    </div>

                    <div className="w-px flex-1 bg-gray-200 mt-2"></div>

                  </div>

                  <div className="
                    flex-1
                    pb-8
                  ">

                    <div className="
                      bg-gray-50
                      border
                      border-gray-200
                      rounded-2xl
                      p-5
                    ">

                      <div className="
                        flex
                        items-start
                        justify-between
                      ">

                        <div>

                          <h3 className="font-semibold text-gray-900">
                            {ocorrencia.tipo}
                          </h3>

                          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                            {ocorrencia.descricao}
                          </p>

                        </div>

                        <span className="
                          bg-red-100
                          text-red-700
                          px-3
                          py-1
                          rounded-full
                          text-sm
                          font-semibold
                        ">

                          -{ocorrencia.impacto}

                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      )}

      {/* IA */}

      {aba === "ia" && (

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-xl font-semibold text-gray-900">
              Histórico de análises IA
            </h2>

            <button
              onClick={gerarAnaliseIA}
              className="
                bg-gray-900
                hover:bg-gray-800
                text-white
                px-5
                py-3
                rounded-2xl
              "
            >
              {loadingIA
                  ? "Gerando..."
                  : "Gerar"}
            </button>

          </div>

          <div className="space-y-4">

            {analises.map((analise) => (

              <div
                key={analise.id}
                className="
                  bg-gray-50
                  border
                  border-gray-200
                  rounded-2xl
                  p-5
                "
              >

                <p className="text-gray-700 leading-relaxed">
                  {analise.parecer}
                </p>

              </div>

            ))}

          </div>

        </div>

      )}

      {/* LOADING */}

      {globalLoading && (

        <div className="
          fixed
          inset-0
          bg-black/40
          backdrop-blur-sm
          flex
          items-center
          justify-center
          z-50
        ">

          <div className="
            bg-white
            rounded-3xl
            p-8
            shadow-xl
            flex
            items-center
            gap-4
          ">

            <div className="
              w-6
              h-6
              border-2
              border-gray-900
              border-t-transparent
              rounded-full
              animate-spin
            "></div>

            <span className="font-medium text-gray-700">
              Processando...
            </span>

          </div>

        </div>

      )}

    </div>
  );
}

export default FornecedorDetalhe;