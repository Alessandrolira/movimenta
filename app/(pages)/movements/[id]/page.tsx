"use client";

import { MovementTypes } from "@/app/types/MovementTypes";
import { api } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
  SearchAlert,
  Search,
  Send,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";

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
import StatCard from "@/app/components/StatCard/StatCard";
import { parseDate, resolveMovementStatus } from "@/app/utils/format";
import { GiHealthNormal } from "react-icons/gi";
import { FaTooth } from "react-icons/fa";

const tipoLabel: Record<string, string> = {
  INCLUSAO: "Inclusão",
  EXCLUSAO: "Exclusão",
  ALTERACAO_DE_DADOS_CADASTRAIS: "Alteração Cadastral",
  SEGUNDA_VIA_CARTEIRINHA: "2ª Via Carteirinha",
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
  SEGUNDA_VIA_CARTEIRINHA: {
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
  const [declinioText, setDeclinioText] = useState<Record<string, string>>({});

  const handleStatusChange = async (
    idBeneficiario: string,
    newStatus: string,
    descricao?: string,
  ) => {
    setUpdatingId(idBeneficiario);
    try {
      await api.patch(`/movimentacao/alterStatus/${idBeneficiario}`, {
        novoStatus: newStatus,
        descricaoDevolutivaOperadora: descricao ?? "",
      });
      setMovement((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          beneficiariosMovimentacao: prev.beneficiariosMovimentacao.map((b) =>
            b.idBeneficiario === idBeneficiario
              ? { ...b, status: newStatus }
              : b,
          ),
        };
      });
      if (newStatus !== "DECLINIO") {
        setDeclinioText((prev) => ({ ...prev, [idBeneficiario]: "" }));
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    } finally {
      setUpdatingId(null);
    }
  };
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

  const beneficiarios = movement?.beneficiariosMovimentacao ?? [];
  const overallStatus = resolveMovementStatus(beneficiarios);
  const modalidade = modalidadeMap[movement?.modalidade ?? ""] ?? null;

  const stats = [
    {
      label: "Total",
      value: beneficiarios.length,
      icon: Users,
      color: "gray-icon",
    },
    {
      label: "Pendentes",
      value: beneficiarios.filter((b) => b.status?.toLowerCase() === "pendente")
        .length,
      icon: Clock,
      color: "orange-icon",
    },
    {
      label: "Em Análise",
      value: beneficiarios.filter(
        (b) => b.status?.toLowerCase() === "analise",
      ).length,
      icon: Search,
      color: "blue-icon",
    },
    {
      label: "Concluídos",
      value: beneficiarios.filter(
        (b) => b.status?.toLowerCase() === "concluido",
      ).length,
      icon: CheckCircle2,
      color: "green-icon",
    },
  ];

  const overallBadge = statusMap[overallStatus];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
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
              <div className="rounded-lg bg-(--light-gray) px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Data
                </p>
                <p className="font-semibold">
                  {movement ? parseDate(movement.dataMovimentacao) : "—"}
                </p>
              </div>
              {modalidade && (
                <div className="rounded-lg bg-(--light-gray) px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Modalidade
                  </p>
                  <p className="font-semibold">{modalidade.label}</p>
                </div>
              )}
            </div>
          </div>

          {movement?.observacao && (
            <div className="rounded-xl border border-gray-200 bg-(--light-gray) px-4 py-3 lg:min-w-64 lg:max-w-80">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Observação
              </p>
              <p className="text-sm text-gray-700">{movement.observacao}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Beneficiários */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4">
        <div>
          <p className="text-2xl font-semibold tracking-wide">Beneficiários</p>
          <p className="text-sm text-gray-500">
            {beneficiarios.length} beneficiário(s) nesta movimentação
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-lg italic opacity-60 py-6">
            Carregando informações...
          </p>
        ) : beneficiarios.length ? (
          <ul className="grid gap-2">
            {beneficiarios.map((b) => {
              const st =
                statusMap[b.status?.toLowerCase()] ?? statusMap["pendente"];
              const typeMov = tipoMap[b.tipoMovimentacao] ?? {
                Icon: SearchAlert,
                className: "text-gray-500",
                label: b.tipoMovimentacao ?? "Desconhecido",
              };
              return (
                <li
                  key={b.idBeneficiario}
                  className="rounded-md border border-gray-200 bg-(--light-gray) px-3 py-3 inset-shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="min-w-0 flex items-center gap-3">
                        <div className={typeMov.className}>
                          <typeMov.Icon />
                        </div>
                        <p className="font-semibold text-sm truncate">
                          {b.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tipoLabel[b.tipoMovimentacao] ?? b.tipoMovimentacao}
                        </p>
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
                                if (opt.value === "PENDENTE_OPERADORA") {
                                  setDeclinioText((prev) => ({
                                    ...prev,
                                    [b.idBeneficiario]: prev[b.idBeneficiario] ?? "",
                                  }));
                                  setMovement((prev) => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      beneficiariosMovimentacao:
                                        prev.beneficiariosMovimentacao.map((ben) =>
                                          ben.idBeneficiario === b.idBeneficiario
                                            ? { ...ben, status: "PENDENTE_OPERADORA" }
                                            : ben,
                                        ),
                                    };
                                  });
                                } else {
                                  handleStatusChange(b.idBeneficiario, opt.value);
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
                            updatingId === b.idBeneficiario
                          }
                          onClick={() =>
                            handleStatusChange(
                              b.idBeneficiario,
                              "PENDENTE_OPERADORA",
                              declinioText[b.idBeneficiario],
                            )
                          }
                          className="rounded-xl border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
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
    </div>
  );
}
