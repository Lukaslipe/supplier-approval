import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    FileCheck,
    MapPin,
    ShieldAlert,
    XCircle
} from "lucide-react";

import api from "../services/api";

function HomologacaoDetalhe() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [homologacao, setHomologacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processando, setProcessando] = useState(false);
    const [modalReprovacao, setModalReprovacao] = useState(false);
    const [setorReprovacao, setSetorReprovacao] = useState("");
    const [motivoReprovacao, setMotivoReprovacao] = useState("");

    async function carregarHomologacao() {

        try {

            const response = await api.get(
                `/fornecedores/${id}/homologacao`
            );

            setHomologacao(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    function abrirModalReprovacao(setor) {

        setSetorReprovacao(setor);
        setMotivoReprovacao("");
        setModalReprovacao(true);

    }

    async function atualizarAprovacao(setor, status, observacao = null) {

        try {

            setProcessando(true);

            await api.post(
                `/fornecedores/${homologacao.fornecedor_id}/aprovacao`,
                {
                    setor,
                    status,
                    observacao
                }
            );

            setModalReprovacao(false);
            setSetorReprovacao("");
            setMotivoReprovacao("");

            await carregarHomologacao();

        } catch (error) {

            console.error(error);

        } finally {

            setProcessando(false);

        }

    }

    async function atualizarHomologacao(dados) {

        try {

            setProcessando(true);

            await api.put(
                `/fornecedores/${homologacao.fornecedor_id}/homologacao`,
                dados
            );

            await carregarHomologacao();

        } catch (error) {

            console.error(error);

        } finally {

            setProcessando(false);

        }

    }

    useEffect(() => {

        carregarHomologacao();

    }, [id]);

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

    if (loading || !homologacao) {

        return (
            <div className="h-64 bg-gray-200 animate-pulse rounded-3xl" />
        );

    }

    const setores = homologacao.aprovacoes || [];

    return (

        <div className="space-y-6">

            {/* VOLTAR */}

            <button
                onClick={() => navigate("/homologacoes")}
                className="
          flex
          items-center
          gap-2
          text-gray-600
          hover:text-gray-900
          text-sm
        "
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar para homologações
            </button>

            {/* HEADER */}

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                    <div>

                        <p className="text-sm text-gray-500 mb-2">
                            Homologação #{homologacao.id}
                        </p>

                        <h1 className="text-3xl font-bold text-gray-900">
                            {homologacao.razao_social}
                        </h1>

                        <p className="text-gray-500 mt-2">
                            CNPJ: {homologacao.cnpj}
                        </p>

                    </div>

                    <div className="flex items-center gap-3">

                        <span className="
                            px-4
                            py-2
                            rounded-full
                            bg-gray-100
                            text-gray-700
                            text-sm
                            font-semibold
                            ">
                            Score {homologacao.score}/100
                        </span>

                        <span className="
                        px-4
                        py-2
                        rounded-full
                        bg-red-100
                        text-red-700
                        text-sm
                        font-semibold
                        ">
                            Risco {homologacao.risco}
                        </span>

                    </div>

                </div>

            </div>

            {/* STATUS */}

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

                <div className="flex items-center gap-3 mb-6">

                    <ShieldAlert className="w-5 h-5 text-gray-700" />

                    <div>

                        <h2 className="text-lg font-semibold text-gray-900">
                            Status da homologação
                        </h2>

                        <p className="text-sm text-gray-500">
                            {homologacao.tipo}
                        </p>

                    </div>

                </div>

                <span className={`
          inline-flex
          items-center
          gap-2
          px-4
          py-2
          rounded-full
          border
          font-semibold
          ${statusClass(homologacao.status)}
        `}>

                    {homologacao.status === "Aprovado" ||
                        homologacao.status === "Aprovado automaticamente"
                        ? <CheckCircle className="w-5 h-5" />
                        : homologacao.status === "Reprovado"
                            ? <XCircle className="w-5 h-5" />
                            : <Clock className="w-5 h-5" />
                    }

                    {homologacao.status}

                </span>

            </div>

            {/* APROVAÇÕES */}

            {(homologacao.risco === "Médio" || homologacao.risco === "Alto") && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Aprovações dos setores
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {setores.map((aprovacao) => (

                            <div
                                key={aprovacao.setor}
                                className="bg-gray-50 rounded-2xl border border-gray-200 p-5"
                            >

                                <div className="flex items-center justify-between mb-5">

                                    <h3 className="font-semibold text-gray-900">
                                        {aprovacao.setor}
                                    </h3>

                                    <span className={`
                    px-2
                    py-1
                    rounded-full
                    border
                    text-xs
                    font-semibold
                    ${statusClass(aprovacao.status)}
                  `}>
                                        {aprovacao.status}
                                    </span>

                                </div>

                                <div className="flex gap-2">

                                    <button
                                        disabled={processando}
                                        onClick={() =>
                                            atualizarAprovacao(
                                                aprovacao.setor,
                                                "Aprovado"
                                            )
                                        }
                                        className="
                                            flex-1
                                            bg-green-500
                                            hover:bg-green-600
                                            disabled:opacity-50
                                            text-white
                                            py-2
                                            rounded-xl
                                            text-sm
                                        "
                                    >
                                        Aprovar
                                    </button>

                                    <button
                                        disabled={processando}
                                        onClick={() => abrirModalReprovacao(aprovacao.setor)}
                                        className="
                                            flex-1
                                            bg-red-500
                                            hover:bg-red-600
                                            disabled:opacity-50
                                            text-white
                                            py-2
                                            rounded-xl
                                            text-sm
                                        "
                                    >
                                        Reprovar
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            )}

            {/* RISCO ALTO */}

            {homologacao.risco === "Alto" && (

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Homologação de alto risco
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* VISITA */}

                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">

                            <div className="flex items-center gap-3 mb-4">

                                <MapPin className="w-5 h-5 text-gray-700" />

                                <div>

                                    <h3 className="font-semibold text-gray-900">
                                        Visita técnica
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        Confirme se a visita foi realizada.
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center justify-between">

                                <span className={`
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-semibold
                  ${homologacao.visita_realizada
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }
                `}>
                                    {homologacao.visita_realizada
                                        ? "Realizada"
                                        : "Pendente"
                                    }
                                </span>

                                {!homologacao.visita_realizada && (

                                    <button
                                        disabled={processando}
                                        onClick={() =>
                                            atualizarHomologacao({
                                                visita_realizada: true
                                            })
                                        }
                                        className="
                      bg-gray-900
                      hover:bg-gray-800
                      disabled:opacity-50
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      text-sm
                    "
                                    >
                                        Confirmar visita
                                    </button>

                                )}

                            </div>

                        </div>

                        {/* DOCUMENTOS */}

                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">

                            <div className="flex items-center gap-3 mb-4">

                                <FileCheck className="w-5 h-5 text-gray-700" />

                                <div>

                                    <h3 className="font-semibold text-gray-900">
                                        Documentação
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        Confirme se os documentos foram validados.
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center justify-between">

                                <span className={`
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-semibold
                  ${homologacao.documentos_ok
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }
                `}>
                                    {homologacao.documentos_ok
                                        ? "Documentos OK"
                                        : "Pendente"
                                    }
                                </span>

                                {!homologacao.documentos_ok && (

                                    <button
                                        disabled={processando}
                                        onClick={() =>
                                            atualizarHomologacao({
                                                documentos_ok: true
                                            })
                                        }
                                        className="
                      bg-gray-900
                      hover:bg-gray-800
                      disabled:opacity-50
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      text-sm
                    "
                                    >
                                        Validar documentos
                                    </button>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {modalReprovacao && (

                <div className="
        fixed
        inset-0
        bg-black/40
        backdrop-blur-sm
        flex
        items-center
        justify-center
        z-50
        p-4
    ">

                    <div className="
            bg-white
            rounded-3xl
            shadow-xl
            w-full
            max-w-lg
            p-6
        ">

                        <div className="flex items-center gap-3 mb-6">

                            <div className="
                    w-10
                    h-10
                    rounded-full
                    bg-red-100
                    flex
                    items-center
                    justify-center
                ">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Reprovar fornecedor
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Setor: {setorReprovacao}
                                </p>
                            </div>

                        </div>

                        <label className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-2
            ">
                            Motivo da reprovação
                        </label>

                        <textarea
                            value={motivoReprovacao}
                            onChange={(e) => setMotivoReprovacao(e.target.value)}
                            placeholder="Informe o motivo da reprovação..."
                            className="
                    w-full
                    min-h-32
                    border
                    border-gray-200
                    rounded-2xl
                    px-4
                    py-3
                    outline-none
                    resize-none
                    focus:ring-2
                    focus:ring-gray-900
                "
                        />

                        <div className="flex gap-3 mt-6">

                            <button
                                disabled={processando}
                                onClick={() => {
                                    setModalReprovacao(false);
                                    setSetorReprovacao("");
                                    setMotivoReprovacao("");
                                }}
                                className="
                        flex-1
                        border
                        border-gray-200
                        text-gray-700
                        py-3
                        rounded-2xl
                        hover:bg-gray-50
                    "
                            >
                                Cancelar
                            </button>

                            <button
                                disabled={
                                    processando ||
                                    !motivoReprovacao.trim()
                                }
                                onClick={() =>
                                    atualizarAprovacao(
                                        setorReprovacao,
                                        "Reprovado",
                                        motivoReprovacao.trim()
                                    )
                                }
                                className="
                        flex-1
                        bg-red-500
                        hover:bg-red-600
                        disabled:opacity-50
                        text-white
                        py-3
                        rounded-2xl
                    "
                            >
                                Confirmar reprovação
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}

export default HomologacaoDetalhe;