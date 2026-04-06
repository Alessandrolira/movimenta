"use client";

import { MovementTypes } from "@/app/types/MovementTypes";
import { api } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Search, Users } from "lucide-react";
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
    className: "bg-orange-50 text-orange-700 border-orange-100",
  },
  em_analise: {
    label: "Em Análise",
    className: "bg-blue-50 text-blue-700 border-blue-100",
  },
  concluido: {
    label: "Concluído",
    className: "bg-green-50 text-green-700 border-green-100",
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              return (
                <li
                  key={b.idBeneficiario}
                  className="rounded-md border border-gray-200 bg-(--light-gray) px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
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
