"use client";

import { dadosEquipeType } from "@/app/types/dadosEquipeType";
import { api } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  Files,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import TransferirAnalistaModal from "@/app/components/TransferirAnalistaModal/TransferirAnalistaModal";
import StatCard from "@/app/components/StatCard/StatCard";
import { parseCnpj } from "@/app/utils/format";
import Link from "next/link";
import { FaUserPlus } from "react-icons/fa";

const responsabilidadeLabel: Record<string, string> = {
  AUXILIAR: "Auxiliar",
  JUNIOR: "Junior",
  PLENO: "Pleno",
  SENIOR: "Senior",
};

const responsabilidadeBadge: Record<string, string> = {
  AUXILIAR: "bg-gray-100 text-gray-700 border-gray-200",
  JUNIOR: "bg-blue-50 text-blue-700 border-blue-100",
  PLENO: "bg-yellow-50 text-yellow-700 border-yellow-100",
  SENIOR: "bg-green-50 text-green-700 border-green-100",
};

export default function Page() {
  const params = useParams();
  const idEquipe = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dadosEquipe, setDadosEquipe] = useState<dadosEquipeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [analistaParaTransferir, setAnalistaParaTransferir] = useState<{
    idAnalista: string;
    nome: string;
  } | null>(null);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleDeleteAnalista(idAnalista: string) {
    if (!confirm("Tem certeza que deseja excluir este analista?")) return;
    setDeletingId(idAnalista);
    console.log("Excluindo analista com ID:", idAnalista);
    try {
      await api.delete(`/analista/${idAnalista}`);
      setDadosEquipe((prev) =>
        prev
          ? {
              ...prev,
              analistas: prev.analistas.filter(
                (a) => a.idAnalista !== idAnalista,
              ),
            }
          : prev,
      );
      showToast("success", "Analista excluído com sucesso.");
    } catch (err) {
      console.error(err);
      showToast("error", "Erro ao excluir analista. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    async function loadPageData() {
      try {
        setIsLoading(true);
        const res = await api.get(`/equipes/${idEquipe}`);
        setDadosEquipe(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPageData();
  }, [idEquipe]);

  const stats = [
    {
      label: "Analistas",
      value: dadosEquipe?.analistas?.length,
      icon: Users,
      color: "blue-icon",
    },
    {
      label: "Empresas",
      value: dadosEquipe?.empresasAtribuida?.length,
      icon: Building2,
      color: "gray-icon",
    },
    {
      label: "Movimentacoes Finalizadas",
      value: dadosEquipe?.numeroDeMovimentacoesFinalizadas,
      icon: Files,
      color: "green-icon",
    },
  ];

  const analistaSelecionado = analistaParaTransferir;

  return (
    <>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium transition-all ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            {toast.message}
          </div>
        )}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold wrap-break-word">
                  {dadosEquipe?.nomeEquipe || "Equipe"}
                </h1>
              </div>

              <p className="opacity-60 text-sm sm:text-base">
                Detalhes da equipe e suas atribuições
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Total de analistas
                  </p>
                  <p className="font-semibold">
                    {dadosEquipe?.analistas?.length || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Empresas atribuidas
                  </p>
                  <p className="font-semibold">
                    {dadosEquipe?.empresasAtribuida?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-linear-to-r to-blue-50 from-(--light-gray) px-4 py-3 min-w-52 inset-shadow-sm/20">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Vidas ativas
              </p>
              <p className="text-3xl font-bold text-(--azul)">
                {dadosEquipe?.numeroVidasAtivas ?? 0}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-(--blue-icon)" />
                <span>Total de beneficiarios ativos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-semibold tracking-wide">
                  Analistas
                </p>
                <p className="text-sm text-gray-500">
                  {dadosEquipe?.analistas?.length || 0} analista(s) nesta equipe
                </p>
              </div>

              <Link
                href={`/pre-register?idEquipe=${idEquipe}`}
                className="bg-(--azul) hover:bg-(--blue-icon) text-white rounded-lg py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-all duration-100 active:scale-95 w-full sm:w-auto text-sm whitespace-nowrap"
              >
                Adicionar acesso
                <FaUserPlus />
              </Link>
            </div>

            {isLoading ? (
              <p className="text-center text-lg italic opacity-60 py-6">
                Carregando informacoes...
              </p>
            ) : dadosEquipe?.analistas?.length ? (
              <div className="max-h-80 overflow-y-auto pr-1">
                <ul className="grid gap-2">
                  {dadosEquipe.analistas.map((analista) => (
                    <li
                      key={analista.idAnalista}
                      className="rounded-md border border-gray-200 bg-(--light-gray) px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {analista.nome}
                          </p>
                          <p className="text-xs text-gray-500 break-all">
                            {analista.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                              responsabilidadeBadge[
                                analista.responsabilidade
                              ] || "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {responsabilidadeLabel[analista.responsabilidade] ||
                              analista.responsabilidade}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setAnalistaParaTransferir({
                                idAnalista: analista.idAnalista,
                                nome: analista.nome,
                              })
                            }
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Transferir para outra equipe"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAnalista(analista.idAnalista)
                            }
                            disabled={deletingId === analista.idAnalista}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center text-lg italic opacity-60 py-6">
                Nenhum analista cadastrado nesta equipe.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-wide">Empresas</p>
              <p className="text-sm text-gray-500">
                {dadosEquipe?.empresasAtribuida?.length || 0} empresa(s)
                atribuida(s) a esta equipe
              </p>
            </div>

            {isLoading ? (
              <p className="text-center text-lg italic opacity-60 py-6">
                Carregando informacoes...
              </p>
            ) : dadosEquipe?.empresasAtribuida?.length ? (
              <div className="max-h-80 overflow-y-auto pr-1">
                <ul className="grid gap-2">
                  {dadosEquipe.empresasAtribuida.map((empresa) => (
                    <li key={empresa.idEmpresa}>
                      <Link
                        href={`/companies/${empresa.idEmpresa}`}
                        className="block rounded-md border border-gray-200 bg-(--light-gray) px-3 py-3 hover:border-gray-300 hover:bg-gray-100 transition-all duration-100"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {empresa.nome}
                            </p>
                            <p className="text-xs text-gray-500">
                              {parseCnpj(empresa.cnpj)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Vidas</p>
                              <p className="font-bold text-sm text-(--azul)">
                                {empresa.qtdVidasAtivas ?? 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center text-lg italic opacity-60 py-6">
                Nenhuma empresa atribuida a esta equipe.
              </p>
            )}
          </div>
        </div>
      </div>

      {analistaSelecionado && (
        <TransferirAnalistaModal
          idAnalista={analistaSelecionado.idAnalista}
          idEquipeAtual={idEquipe!}
          nomeAnalista={analistaSelecionado.nome}
          onClose={() => setAnalistaParaTransferir(null)}
          onSuccess={() => {
            setDadosEquipe((prev) =>
              prev
                ? {
                    ...prev,
                    analistas: prev.analistas.filter(
                      (a) => a.idAnalista !== analistaSelecionado.idAnalista,
                    ),
                  }
                : prev,
            );
            showToast("success", "Analista transferido com sucesso.");
          }}
        />
      )}
    </>
  );
}
