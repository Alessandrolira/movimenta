"use client";

import { MovementTypes } from "@/app/types/MovementTypes";
import { api } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
  SearchAlert,
  Search,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

const statusOptions = [
  {
    value: "PENDENTE",
    key: "pendente",
    label: "Pendente",
    Icon: Clock,
    active: "bg-orange-100 border-orange-400 text-orange-700",
    hover: "hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600",
  },
  {
    value: "EM_ANALISE",
    key: "em_analise",
    label: "Em Análise",
    Icon: Search,
    active: "bg-blue-100 border-blue-400 text-blue-700",
    hover: "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600",
  },
  {
    value: "CONCLUIDO",
    key: "concluido",
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
  pendente: {
    label: "Pendente",
    className: "bg-orange-50 text-orange-700 border-orange-300",
  },
  em_analise: {
    label: "Em Análise",
    className: "bg-blue-50 text-blue-700 border-blue-300",
  },
  concluido: {
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
    className: "bg-green-50 text-(--green-icon) border rounded-lg border-green-200 p-2",
    label: "Inclusão",
  },
  EXCLUSAO: {
    Icon: UserMinus,
    className: "text-(--red-icon) bg-red-50 border rounded-lg border-red-200 p-2",
    label: "Exclusão",
  },
  ALTERACAO_DE_DADOS_CADASTRAIS: {
    Icon: RefreshCw,
    className: "text-(--blue-icon) bg-blue-50 border rounded-lg border-blue-200 p-2",
    label: "Alteração Cadastral",
  },
  SEGUNDA_VIA_CARTEIRINHA: {
    Icon: CreditCard,
    className: "text-purple-500 bg-purple-50 border rounded-lg border-purple-200 p-2",
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

  const handleStatusChange = async (idBeneficiario: string, newStatus: string) => {
    setUpdatingId(idBeneficiario);
    try {
      await api.put(`/movimentacao/alterStatus/${idBeneficiario}`, { status: newStatus });
      setMovement((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          beneficiariosMovimentacao: prev.beneficiariosMovimentacao.map((b) =>
            b.idBeneficiario === idBeneficiario ? { ...b, status: newStatus } : b,
          ),
        };
      });
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
        console.log("Movimentação:", res.data);
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
        (b) => b.status?.toLowerCase() === "em_analise",
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
              console.log(st);
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
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className={typeMov.className}>
                        <typeMov.Icon />
                      </div>
                      <p className="font-semibold text-sm truncate">{b.nome}</p>
                      <p className="text-xs text-gray-500">
                        {tipoLabel[b.tipoMovimentacao] ?? b.tipoMovimentacao}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0 ${st.className}`}
                    >
                      {st.label}
                    </span>
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
