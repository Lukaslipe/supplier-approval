import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../services/api";

function FornecedorDetalhe() {

  const { id } = useParams();

  const [fornecedor, setFornecedor] = useState(null);
  const [analises, setAnalises] = useState([]);
  const [loadingIA, setLoadingIA] = useState(false);
  const [tipoOcorrencia, setTipoOcorrencia] = useState("");
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState("");
  const [impactoOcorrencia, setImpactoOcorrencia] = useState("");
  const [ocorrencias, setOcorrencias] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState(null);

  function riscoClass(risco) {

    if (risco === "Baixo") {
      return "bg-green-100 text-green-700";
    }

    if (risco === "Médio") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
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

  async function gerarAnaliseIA() {

    try {

      setGlobalLoading(true);

      await api.post(
        `/fornecedores/${id}/analise-ia`
      );

      await carregarAnalises();
      await carregarFornecedor();
      await carregarOcorrencias();

    } catch (error) {

      console.error(error);

    } finally {

      setGlobalLoading(false);

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

  async function adicionarOcorrencia() {

    if (!tipoOcorrencia) {
      return;
    }

    if (
      impactoOcorrencia === "" ||
      isNaN(Number(impactoOcorrencia))
    ) {
      setErro("Informe um impacto válido");
      return;
    }

    const impacto = Number(impactoOcorrencia);

    if (impacto < 0 || impacto > 100) {
      setErro("Impacto deve estar entre 0 e 100");
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
      setImpactoOcorrencia(10);

      await carregarOcorrencias();
      await carregarAnalises();
      await carregarFornecedor()

      setGlobalLoading(false);

    } catch (error) {

      console.error(error);

    }

  }

  useEffect(() => {

    carregarFornecedor();
    carregarAnalises();
    carregarOcorrencias();

  }, []);

  if (!fornecedor) {

    return (
      <div>
        Carregando...
      </div>
    );

  }

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-2xl font-bold text-gray-800">
              {fornecedor.razao_social}
            </h1>

            <p className="text-gray-500 mt-1">
              {fornecedor.cnpj}
            </p>

          </div>

          <span className={`px-4 py-2 rounded-full ${riscoClass(fornecedor.risco)}`}>
            Risco - {fornecedor.risco}
          </span>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">

          <p className="text-sm text-gray-500">
            Score
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {fornecedor.score}
          </h2>

        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">

          <p className="text-sm text-gray-500">
            Situação
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-2">
            {fornecedor.situacao}
          </h2>

        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">

          <p className="text-sm text-gray-500">
            Cidade
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-2">
            {fornecedor.cidade} - {fornecedor.uf}
          </h2>

        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">

          <p className="text-sm text-gray-500">
            Porte
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-2">
            {fornecedor.porte}
          </h2>

        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">

        <div className="p-6 border-b border-gray-200">

          <h2 className="text-lg font-semibold text-gray-800">
            Ocorrências
          </h2>

        </div>

        <div className="p-6">

          <div className="space-y-4 mb-6">

            <input
              type="text"
              placeholder="Tipo da ocorrência"
              value={tipoOcorrencia}
              onChange={(e) => setTipoOcorrencia(e.target.value)}
              className="
                w-full
                border
                border-gray-300
                rounded-xl
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
              onChange={(e) => setDescricaoOcorrencia(e.target.value)}
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-gray-900
                min-h-30
              "
            />

            <input
              type="number"
              placeholder="Impacto (0 a 100)"
              value={impactoOcorrencia}
              min={0}
              max={100}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  setImpactoOcorrencia("");
                  return;
                }

                const numeric = Number(value);

                // bloqueia fora do range
                if (numeric < 0) {
                  setImpactoOcorrencia(0);
                  return;
                }

                if (numeric > 100) {
                  setImpactoOcorrencia(100);
                  return;
                }

                setImpactoOcorrencia(numeric);
              }}
              className="
                w-full
                border
                border-gray-300
                rounded-xl
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
                bg-gray-900
                hover:bg-gray-800
                text-white
                px-5
                py-3
                rounded-xl
                transition
              "
            >
              Adicionar ocorrência
            </button>

          </div>

          <div className="space-y-3">

            {ocorrencias.map((ocorrencia) => (
              <div
                key={ocorrencia.id}
                onClick={() => setOcorrenciaSelecionada(ocorrencia)}
                className="
                  border
                  border-gray-200
                  rounded-xl
                  p-4
                  bg-gray-50
                  cursor-pointer
                  hover:bg-gray-100
                  transition
                  flex
                  items-center
                  justify-between
                "
              >

                {/* esquerda */}
                <p className="text-gray-800 font-medium">
                  {ocorrencia.tipo}
                </p>

                {/* direita (impacto) */}
                <span className="text-sm font-semibold text-gray-700">
                  {ocorrencia.impacto}
                </span>

              </div>
            ))}

          </div>

        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">

        <div className="p-6 border-b border-gray-200 flex items-center justify-between">

          <h2 className="text-lg font-semibold text-gray-800">
            Análises IA
          </h2>

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
              font-medium
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >

            {loadingIA
              ? "Gerando análise..."
              : "Gerar análise IA"
            }

          </button>

        </div>

        <div className="p-6 space-y-4">

          {analises.map((analise) => (

            <div
              key={analise.id}
              className="bg-gray-50 rounded-xl p-4 border border-gray-200"
            >

              <p className="text-gray-700 leading-relaxed">
                {analise.parecer}
              </p>

            </div>

          ))}

        </div>

      </div>

      {globalLoading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-3">

            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>

            <span className="text-gray-700 font-medium">
              Processando IA...
            </span>

          </div>

        </div>
      )}

      {ocorrenciaSelecionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">

            {/* HEADER */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Detalhes da Ocorrência
                </h2>

                <p className="text-sm text-gray-500">
                  Registro de impacto no fornecedor
                </p>
              </div>

              <button
                onClick={() => setOcorrenciaSelecionada(null)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>

            </div>

            {/* BODY */}
            <div className="p-6 space-y-5">

              {/* Tipo */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  Tipo
                </p>
                <p className="text-base text-gray-800 font-semibold">
                  {ocorrenciaSelecionada.tipo}
                </p>
              </div>

              {/* Descrição */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  Descrição
                </p>
                <p className="text-sm text-gray-800 leading-relaxed font-semibold">
                  {ocorrenciaSelecionada.descricao || "Sem descrição informada"}
                </p>
              </div>

              {/* Impacto */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  Impacto no Score
                </p>

                <p className="text-2xl text-gray-800 font-semibold">
                  {ocorrenciaSelecionada.impacto}
                </p>
              </div>

            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">

              <button
                onClick={() => setOcorrenciaSelecionada(null)}
                className="
                  px-4 py-2
                  rounded-xl
                  bg-gray-900
                  text-white
                  hover:bg-gray-800
                  transition
                "
              >
                Fechar
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default FornecedorDetalhe;