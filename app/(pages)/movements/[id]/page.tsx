"use client";

import { MovementTypes } from "@/app/types/MovementTypes";
import { api } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  SearchAlert,
  Search,
  Send,
  UserMinus,
  UserPlus,
  Users,
  X,
  Group,
} from "lucide-react";
import { BeneficiaryTypes } from "@/app/types/BeneficiaryTypes";

type BeneficiarioDetail = BeneficiaryTypes & {
  idBeneficiario: string;
  idMovimentacao: string;
};

const dependenciaMap: Record<string, string> = {
  TITULAR: "Titular",
  CONJUGE: "Cônjuge",
  FILHO: "Filho(a)",
  AGREGADO: "Agregado",
};

const statusOptions = [
  {
    value: "PENDENTE",
    label: "Pendente",
    Icon: Clock,
    active: "bg-orange-100 border-orange-400 text-orange-700",
    hover: "hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600",
  },
  {
    value: "ANALISE",
    label: "Análise",
    Icon: Search,
    active: "bg-blue-100 border-blue-400 text-blue-700",
    hover: "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600",
  },
  {
    value: "ENVIADO_OPERADORA",
    label: "Enviado",
    Icon: Send,
    active: "bg-indigo-100 border-indigo-400 text-indigo-700",
    hover: "hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600",
  },
  {
    value: "PENDENTE_OPERADORA",
    label: "Pend. Operadora",
    Icon: AlertCircle,
    active: "bg-yellow-100 border-yellow-400 text-yellow-700",
    hover: "hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-600",
  },
  {
    value: "DECLINIO",
    label: "Declínio",
    Icon: X,
    active: "bg-red-100 border-red-400 text-red-700",
    hover: "hover:bg-red-50 hover:border-red-300 hover:text-red-600",
  },
  {
    value: "CONCLUIDO",
    label: "Concluído",
    Icon: CheckCircle2,
    active: "bg-green-100 border-green-400 text-green-700",
    hover: "hover:bg-green-50 hover:border-green-300 hover:text-green-600",
  },
];
import {
  formatCPF,
  parseDate,
  parseDateTime,
  resolveMovementStatus,
} from "@/app/utils/format";
import { GiHealthNormal } from "react-icons/gi";
import { FaTooth } from "react-icons/fa";
import Link from "next/link";

const tipoLabel: Record<string, string> = {
  INCLUSAO: "Inclusão",
  EXCLUSAO: "Exclusão",
  ALTERACAO_DE_DADOS_CADASTRAIS: "Alteração Cadastral",
  SEGUNDA_VIA_DE_CARTEIRINHA: "2ª Via Carteirinha",
};

const statusMap: Record<string, { label: string; className: string }> = {
  PENDENTE: {
    label: "Pendente",
    className: "bg-orange-50 text-orange-700 border-orange-300 inset-shadow-sm",
  },
  ANALISE: {
    label: "Análise",
    className: "bg-blue-50 text-blue-700 border-blue-300",
  },
  ENVIADO_OPERADORA: {
    label: "Enviado Operadora",
    className: "bg-indigo-50 text-indigo-700 border-indigo-300",
  },
  PENDENTE_OPERADORA: {
    label: "Pend. Operadora",
    className: "bg-yellow-50 text-yellow-700 border-yellow-300",
  },
  DECLINIO: {
    label: "Declínio",
    className: "bg-red-50 text-red-700 border-red-300",
  },
  CONCLUIDO: {
    label: "Concluído",
    className: "bg-green-50 text-green-700 border-green-300",
  },
};

const tipoMap: Record<
  string,
  { Icon: React.ElementType; className: string; label: string }
> = {
  INCLUSAO: {
    Icon: UserPlus,
    className:
      "bg-green-50 text-(--green-icon) border rounded-lg border-green-200 p-2",
    label: "Inclusão",
  },
  EXCLUSAO: {
    Icon: UserMinus,
    className:
      "text-(--red-icon) bg-red-50 border rounded-lg border-red-200 p-2",
    label: "Exclusão",
  },
  ALTERACAO_DE_DADOS_CADASTRAIS: {
    Icon: RefreshCw,
    className:
      "text-(--blue-icon) bg-blue-50 border rounded-lg border-blue-200 p-2",
    label: "Alteração Cadastral",
  },
  SEGUNDA_VIA_DE_CARTEIRINHA: {
    Icon: CreditCard,
    className:
      "text-purple-500 bg-purple-50 border rounded-lg border-purple-200 p-2",
    label: "2ª Via Carteirinha",
  },
};

const modalidadeMap: Record<
  string,
  { Icon: React.ElementType; className: string; label: string }
> = {
  SAUDE: { Icon: GiHealthNormal, className: "text-red-500", label: "Saúde" },
  DENTAL: { Icon: FaTooth, className: "text-blue-500", label: "Dental" },
};

export default function Page() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [movement, setMovement] = useState<MovementTypes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [emailToast, setEmailToast] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [todosConcluidosModal, setTodosConcluidosModal] = useState(false);
  const [feedbackPendente, setFeedbackPendente] = useState(false);
  const [declinioText, setDeclinioText] = useState<Record<string, string>>({});
  const [carteirinhaText, setCarteirinhaText] = useState<
    Record<string, string>
  >({});
  const [carteirinhaConfirmada, setCarteirinhaConfirmada] = useState<
    Record<string, boolean>
  >({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<
    Record<string, BeneficiarioDetail>
  >({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  async function toggleExpand(idBeneficiario: string) {
    if (expandedId === idBeneficiario) {
      setExpandedId(null);
      return;
    }
    setExpandedId(idBeneficiario);
    if (detailsCache[idBeneficiario]) return;
    try {
      setLoadingDetailId(idBeneficiario);
      const res = await api.get(`/movimentacao/beneficiario/${idBeneficiario}`);
      setDetailsCache((prev) => ({ ...prev, [idBeneficiario]: res.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetailId(null);
    }
  }

  const handleStatusChange = async (
    idBeneficiario: string,
    newStatus: string,
    descricao?: string,
  ) => {
    const beneficiario = movement?.beneficiariosMovimentacao.find(
      (b) => b.idBeneficiario === idBeneficiario,
    );
    if (
      newStatus === "CONCLUIDO" &&
      beneficiario?.tipoMovimentacao === "INCLUSAO" &&
      !descricao?.trim()
    ) {
      return;
    }
    setUpdatingId(idBeneficiario);
    try {
      await api.patch(`/movimentacao/alterStatus/${idBeneficiario}`, {
        novoStatus: newStatus,
        statusDesc: descricao ?? "",
      });
      setMovement((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          beneficiariosMovimentacao: prev.beneficiariosMovimentacao.map((b) =>
            b.idBeneficiario === idBeneficiario
              ? {
                  ...b,
                  status: newStatus,
                  statusDesc: descricao ?? b.statusDesc,
                }
              : b,
          ),
        };
      });
      setDeclinioText((prev) => ({ ...prev, [idBeneficiario]: "" }));
      setCarteirinhaText((prev) => ({ ...prev, [idBeneficiario]: "" }));
      if (newStatus === "CONCLUIDO") {
        setCarteirinhaConfirmada((prev) => ({
          ...prev,
          [idBeneficiario]: true,
        }));
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmarComEmail = async (
    idBeneficiario: string,
    novoStatus: string,
    descricao?: string,
  ) => {
    setSendingId(idBeneficiario);
    try {
      await api.patch(`/movimentacao/alterStatus/${idBeneficiario}`, {
        novoStatus,
        statusDesc: descricao ?? declinioText[idBeneficiario] ?? "",
      });
      setMovement((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          beneficiariosMovimentacao: prev.beneficiariosMovimentacao.map((b) =>
            b.idBeneficiario === idBeneficiario
              ? {
                  ...b,
                  status: novoStatus,
                  statusDesc:
                    descricao ?? declinioText[idBeneficiario] ?? b.statusDesc,
                }
              : b,
          ),
        };
      });
      setDeclinioText((prev) => ({ ...prev, [idBeneficiario]: "" }));
      setCarteirinhaText((prev) => ({ ...prev, [idBeneficiario]: "" }));
      setEmailToast(true);
      setTimeout(() => setEmailToast(false), 3500);
    } catch (err) {
      console.error("Erro ao enviar:", err);
    } finally {
      setSendingId(null);
    }
  };
  useEffect(() => {
    if (isLoading) return;
    const lista = movement?.beneficiariosMovimentacao ?? [];
    if (
      lista.length > 0 &&
      lista.every((b) => {
        if (b.status?.toUpperCase() !== "CONCLUIDO") return false;
        if (
          b.tipoMovimentacao === "INCLUSAO" &&
          !carteirinhaConfirmada[b.idBeneficiario]
        )
          return false;
        return true;
      })
    ) {
      setTodosConcluidosModal(true);
    }
  }, [movement, isLoading, carteirinhaConfirmada]);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await api.get(`/movimentacao/${id}`);
        setMovement(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleEnviarFeedback() {
    setSendingFeedback(true);
    try {
      await api.post("/movimentacao/enviarFeedBackMovimentacao", {
        idMovimentacao: id,
      });
      setFeedbackModal(false);
      setFeedbackPendente(false);
      setEmailToast(true);
      setTimeout(() => setEmailToast(false), 3500);
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
    } finally {
      setSendingFeedback(false);
    }
  }

  const beneficiarios = movement?.beneficiariosMovimentacao ?? [];
  const overallStatus = resolveMovementStatus(beneficiarios);
  const modalidade = modalidadeMap[movement?.modalidade ?? ""] ?? null;

  const stats = [
    {
      label: "Pendentes",
      value: beneficiarios.filter((b) => b.status?.toLowerCase() === "pendente")
        .length,
      icon: Clock,
      colorStyle: "var(--orange-icon)",
    },
    {
      label: "Em Análise",
      value: beneficiarios.filter((b) => b.status?.toLowerCase() === "analise")
        .length,
      icon: Search,
      colorStyle: "var(--blue-icon)",
    },
    {
      label: "Enviados",
      value: beneficiarios.filter(
        (b) => b.status?.toLowerCase() === "enviado_operadora",
      ).length,
      icon: Send,
      colorStyle: "var(--indigo-icon)",
    },
    {
      label: "Pend. Operadora",
      value: beneficiarios.filter(
        (b) => b.status?.toLowerCase() === "pendente_operadora",
      ).length,
      icon: AlertCircle,
      colorStyle: "var(--yellow-icon)",
    },
    {
      label: "Declínio",
      value: beneficiarios.filter((b) => b.status?.toLowerCase() === "declinio")
        .length,
      icon: X,
      colorStyle: "var(--red-icon)",
    },
    {
      label: "Concluídos",
      value: beneficiarios.filter(
        (b) => b.status?.toLowerCase() === "concluido",
      ).length,
      icon: CheckCircle2,
      colorStyle: "var(--green-icon)",
    },
  ];

  const overallBadge = statusMap[overallStatus];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {emailToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border bg-green-50 border-green-200 text-green-700 px-4 py-3 shadow-lg text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Email enviado com sucesso.
        </div>
      )}
      {/* Hero card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {modalidade && (
                <modalidade.Icon
                  className={`h-6 w-6 shrink-0 ${modalidade.className}`}
                />
              )}
              <h1 className="text-2xl sm:text-3xl font-bold break-words">
                {movement?.nomeEmpresa || "Movimentação"}
              </h1>
              {overallBadge && (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0 ${overallBadge.className}`}
                >
                  {overallBadge.label}
                </span>
              )}
            </div>

            <p className="opacity-60 text-sm sm:text-base">
              Detalhes da movimentação e seus beneficiários
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Data
                </p>
                <p className="font-semibold">
                  {movement ? parseDateTime(movement.dataMovimentacao) : "—"}
                </p>
              </div>
              {modalidade && (
                <div className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Modalidade
                  </p>
                  <p className="font-semibold">{modalidade.label}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-(--light-gray) px-4 py-3 min-w-52 inset-shadow-sm/20">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Beneficiários
            </p>
            <p className="text-3xl font-bold text-(--azul)">
              {beneficiarios.length}
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-(--blue-icon)" />
              <span>Total nesta movimentação</span>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap border-t border-gray-200 pt-3">
              {stats.map((stat, i) => (
                <div key={i} className="relative group">
                  <div
                    className="flex items-center justify-center rounded-lg p-1.5 bg-white border border-gray-200"
                    style={{ color: stat.colorStyle }}
                  >
                    <stat.icon className="h-4 w-4" />
                    {stat.value > 0 && (
                      <span className="ml-1 text-xs font-semibold">
                        {stat.value}
                      </span>
                    )}
                  </div>
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {stat.label}: {stat.value}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {movement?.observacao && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Observação
          </p>
          <p className="text-sm text-gray-700">{movement.observacao}</p>
        </div>
      )}

      {/* Beneficiários */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-2xl font-semibold tracking-wide">
              Beneficiários
            </p>
            <p className="text-sm text-gray-500">
              {beneficiarios.length} beneficiário(s) nesta movimentação
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackModal(true)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
              feedbackPendente
                ? "bg-green-500 hover:bg-green-600 text-white ring-2 ring-green-300 ring-offset-2 animate-pulse"
                : "bg-(--azul) hover:bg-(--blue-icon) text-white"
            }`}
          >
            <Send className="h-4 w-4" />
            Enviar feedback ao cliente
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-lg italic opacity-60 py-6">
            Carregando informações...
          </p>
        ) : beneficiarios.length ? (
          <ul className="grid gap-2">
            {beneficiarios.map((b) => {
              const typeMov = tipoMap[b.tipoMovimentacao] ?? {
                Icon: SearchAlert,
                className: "text-gray-500",
                label: b.tipoMovimentacao ?? "Desconhecido",
              };
              return (
                <li
                  key={b.idBeneficiario}
                  className="rounded-md border border-gray-200 bg-(--light-gray) px-3 py-3 inset-shadow-sm/20 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="min-w-0 flex items-center gap-3">
                        <div className={typeMov.className}>
                          <typeMov.Icon />
                        </div>
                        <Link
                          href={`/beneficiarios/${b.idBeneficiario}`}
                          className="font-semibold text-sm truncate hover:underline hover:text-(--azul)"
                        >
                          {b.nome}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {tipoLabel[b.tipoMovimentacao] ?? b.tipoMovimentacao}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleExpand(b.idBeneficiario)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-(--azul) transition-colors cursor-pointer"
                          title={
                            expandedId === b.idBeneficiario
                              ? "Ocultar dados"
                              : "Ver dados do beneficiário"
                          }
                        >
                          {loadingDetailId === b.idBeneficiario ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : expandedId === b.idBeneficiario ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {b.statusDesc && (
                          <p
                            className={`text-xs font-semibold border rounded-md px-2 py-0.5 truncate max-w-xs ${statusMap[b.status?.toUpperCase()]?.className ?? "bg-gray-50 text-gray-700 border-gray-300"}`}
                          >
                            {b.statusDesc}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 shrink-0">
                        {statusOptions.map((opt) => {
                          const isActive =
                            b.status?.toUpperCase() === opt.value;
                          const isUpdating = updatingId === b.idBeneficiario;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isUpdating}
                              onClick={() => {
                                if (
                                  opt.value === "CONCLUIDO" &&
                                  b.tipoMovimentacao === "INCLUSAO"
                                ) {
                                  setCarteirinhaText((prev) => ({
                                    ...prev,
                                    [b.idBeneficiario]:
                                      prev[b.idBeneficiario] ?? "",
                                  }));
                                  setMovement((prev) => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      beneficiariosMovimentacao:
                                        prev.beneficiariosMovimentacao.map(
                                          (ben) =>
                                            ben.idBeneficiario ===
                                            b.idBeneficiario
                                              ? {
                                                  ...ben,
                                                  status: opt.value,
                                                }
                                              : ben,
                                        ),
                                    };
                                  });
                                } else if (
                                  opt.value === "PENDENTE_OPERADORA" ||
                                  opt.value === "DECLINIO"
                                ) {
                                  setDeclinioText((prev) => ({
                                    ...prev,
                                    [b.idBeneficiario]:
                                      prev[b.idBeneficiario] ?? "",
                                  }));
                                  setMovement((prev) => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      beneficiariosMovimentacao:
                                        prev.beneficiariosMovimentacao.map(
                                          (ben) =>
                                            ben.idBeneficiario ===
                                            b.idBeneficiario
                                              ? {
                                                  ...ben,
                                                  status: opt.value,
                                                }
                                              : ben,
                                        ),
                                    };
                                  });
                                } else {
                                  handleStatusChange(
                                    b.idBeneficiario,
                                    opt.value,
                                  );
                                }
                              }}
                              title={opt.label}
                              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                                ${isActive ? opt.active : `border-gray-200 bg-white text-gray-400 ${opt.hover}`}`}
                            >
                              <opt.Icon className="h-3.5 w-3.5" />
                              {isActive && <span>{opt.label}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {expandedId === b.idBeneficiario &&
                      (() => {
                        const d = detailsCache[b.idBeneficiario];
                        if (loadingDetailId === b.idBeneficiario) {
                          return (
                            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Carregando dados...
                            </div>
                          );
                        }
                        if (!d) return null;
                        const fields = [
                          { label: "CPF", value: formatCPF(d.cpf) },
                          {
                            label: "Nascimento",
                            value: parseDate(d.dataNascimento),
                          },
                          {
                            label: "Dependência",
                            value:
                              dependenciaMap[d.dependencia] ?? d.dependencia,
                          },
                          d.dependencia !== "TITULAR" && d.nomeTitular
                            ? { label: "Titular", value: d.nomeTitular }
                            : null,
                          d.planoAtual
                            ? { label: "Plano Atual", value: d.planoAtual }
                            : null,
                          d.endereco?.logradouro
                            ? {
                                label: "Endereço",
                                value: [
                                  d.endereco.logradouro,
                                  d.endereco.numero,
                                  d.endereco.complemento,
                                  d.endereco.bairro,
                                  d.endereco.cidade,
                                  d.endereco.estado,
                                  d.endereco.cep,
                                ]
                                  .filter(Boolean)
                                  .join(", "),
                              }
                            : null,
                          d.observacao
                            ? { label: "Observação", value: d.observacao }
                            : null,
                        ].filter(Boolean) as { label: string; value: string }[];
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 border-t border-gray-300">
                            {fields.map(({ label, value }) => (
                              <div
                                key={label}
                                className="rounded-lg bg-white border border-gray-300 px-3 py-2 text-xs"
                              >
                                <p className="uppercase tracking-wide text-(--blue-icon) mb-0.5">
                                  {label}
                                </p>
                                <p className="font-semibold text-gray-700 break-words">
                                  {value}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                    {b.status?.toUpperCase() === "PENDENTE_OPERADORA" && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Descreva a pendência junto à operadora..."
                          value={declinioText[b.idBeneficiario] ?? ""}
                          onChange={(e) =>
                            setDeclinioText((prev) => ({
                              ...prev,
                              [b.idBeneficiario]: e.target.value,
                            }))
                          }
                          className="flex-1 border border-yellow-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:border-yellow-400 transition-all"
                        />
                        <button
                          type="button"
                          disabled={
                            !declinioText[b.idBeneficiario]?.trim() ||
                            sendingId === b.idBeneficiario
                          }
                          onClick={() =>
                            handleConfirmarComEmail(
                              b.idBeneficiario,
                              "PENDENTE_OPERADORA",
                            )
                          }
                          className="flex items-center gap-1.5 rounded-xl border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {sendingId === b.idBeneficiario ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Confirmar
                        </button>
                      </div>
                    )}

                    {b.status?.toUpperCase() === "DECLINIO" && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Informe o motivo do declínio para o cliente..."
                          value={declinioText[b.idBeneficiario] ?? ""}
                          onChange={(e) =>
                            setDeclinioText((prev) => ({
                              ...prev,
                              [b.idBeneficiario]: e.target.value,
                            }))
                          }
                          className="flex-1 border border-red-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:border-red-400 transition-all"
                        />
                        <button
                          type="button"
                          disabled={
                            !declinioText[b.idBeneficiario]?.trim() ||
                            sendingId === b.idBeneficiario
                          }
                          onClick={() =>
                            handleConfirmarComEmail(
                              b.idBeneficiario,
                              "DECLINIO",
                            )
                          }
                          className="flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {sendingId === b.idBeneficiario ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Confirmar
                        </button>
                      </div>
                    )}

                    {b.status?.toUpperCase() === "CONCLUIDO" &&
                      b.tipoMovimentacao === "INCLUSAO" && (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            required
                            minLength={1}
                            maxLength={50}
                            placeholder="Informe o número da carteirinha..."
                            value={carteirinhaText[b.idBeneficiario] ?? ""}
                            onChange={(e) =>
                              setCarteirinhaText((prev) => ({
                                ...prev,
                                [b.idBeneficiario]: e.target.value,
                              }))
                            }
                            className="flex-1 border border-green-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:border-green-400 transition-all"
                          />
                          <button
                            type="button"
                            disabled={
                              !carteirinhaText[b.idBeneficiario]?.trim() ||
                              sendingId === b.idBeneficiario
                            }
                            onClick={() => {
                              const valor = carteirinhaText[b.idBeneficiario]?.trim();
                              if (!valor) return;
                              handleStatusChange(
                                b.idBeneficiario,
                                "CONCLUIDO",
                                valor,
                              );
                            }}
                            className="flex items-center gap-1.5 rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {sendingId === b.idBeneficiario ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            Confirmar
                          </button>
                        </div>
                      )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-lg italic opacity-60 py-6">
            Nenhum beneficiário nesta movimentação.
          </p>
        )}
      </div>

      {todosConcluidosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold">
                  Movimentação concluída
                </h2>
              </div>
            </div>

            <div className="px-6 py-5 space-y-2">
              <p className="text-sm text-gray-700 font-medium">
                Todos os beneficiários foram concluídos.
              </p>
              <p className="text-sm text-gray-600">
                É importante enviar o feedback completo da movimentação ao
                cliente para informá-lo sobre a conclusão. Deseja enviar agora?
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => {
                  setTodosConcluidosModal(false);
                  setFeedbackPendente(true);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Agora não
              </button>
              <button
                onClick={() => {
                  setTodosConcluidosModal(false);
                  setFeedbackModal(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-green-500 hover:bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
                Enviar agora
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-(--azul)" />
                <h2 className="text-lg font-semibold">Enviar feedback</h2>
              </div>
              <button
                onClick={() => !sendingFeedback && setFeedbackModal(false)}
                disabled={sendingFeedback}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">
                O status atual de{" "}
                <span className="font-semibold text-gray-900">
                  todos os beneficiários
                </span>{" "}
                desta movimentação será enviado por email ao cliente que fez a
                solicitação. Deseja continuar?
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setFeedbackModal(false)}
                disabled={sendingFeedback}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarFeedback}
                disabled={sendingFeedback}
                className="flex items-center gap-2 rounded-lg bg-(--azul) px-4 py-2 text-sm font-medium text-white hover:bg-(--blue-icon) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingFeedback ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sendingFeedback ? "Enviando..." : "Confirmar envio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
