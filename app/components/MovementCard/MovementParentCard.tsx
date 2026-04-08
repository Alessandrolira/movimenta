import { BeneficiaryMovimentsTypes } from "@/app/types/BeneficiaryMovimentsTypes";
import { parseDate, resolveMovementStatus } from "@/app/utils/format";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
  Search,
  Send,
  UserMinus,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { GiHealthNormal } from "react-icons/gi";
import { FaTooth } from "react-icons/fa";
import { IoPeople } from "react-icons/io5";
import { IconType } from "react-icons";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface MovementParentProps {
  id: string;
  nomeEmpresa: string;
  dataMovimentacao: string | number[];
  observacao: string;
  modalidade: string;
  beneficiarios: BeneficiaryMovimentsTypes[];
}

type ModalidadeConfig = {
  Icon: IconType;
  iconClass: string;
  badgeClass: string;
  label: string;
};

const modalidadeMap: Record<string, ModalidadeConfig> = {
  SAUDE: {
    Icon: GiHealthNormal,
    iconClass: "text-red-500",
    badgeClass: "bg-red-50 text-red-700 border-red-100",
    label: "Saúde",
  },
  DENTAL: {
    Icon: FaTooth,
    iconClass: "text-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
    label: "Dental",
  },
};

type TipoConfig = {
  Icon: LucideIcon;
  iconClass: string;
  textClass: string;
  label: string;
};

const tipoMap: Record<string, TipoConfig> = {
  INCLUSAO: {
    Icon: UserPlus,
    iconClass: "text-green-500",
    textClass: "text-green-700",
    label: "Inclusão",
  },
  EXCLUSAO: {
    Icon: UserMinus,
    iconClass: "text-red-500",
    textClass: "text-red-700",
    label: "Exclusão",
  },
  ALTERACAO_DE_DADOS_CADASTRAIS: {
    Icon: RefreshCw,
    iconClass: "text-orange-500",
    textClass: "text-orange-700",
    label: "Alteração",
  },
  SEGUNDA_VIA_CARTEIRINHA: {
    Icon: CreditCard,
    iconClass: "text-purple-500",
    textClass: "text-purple-700",
    label: "2ª Via",
  },
};

function getModalidade(modalidade: string): ModalidadeConfig {
  return (
    modalidadeMap[modalidade] ?? {
      Icon: GiHealthNormal,
      iconClass: "text-gray-400",
      badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
      label: modalidade,
    }
  );
}

type StatusConfig = { Icon: LucideIcon; label: string; badgeClass: string };

const statusDisplayMap: Record<string, StatusConfig> = {
  pendente: {
    Icon: Clock,
    label: "Pendente",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  analise: {
    Icon: Search,
    label: "Em Análise",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  enviado_operadora: {
    Icon: Send,
    label: "Enviado",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-300",
  },
  pendente_operadora: {
    Icon: AlertCircle,
    label: "Pendente OP",
    badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-300",
  },
  declinio: {
    Icon: X,
    label: "Declínio",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  concluido: {
    Icon: CheckCircle2,
    label: "Concluído",
    badgeClass: "bg-green-50 text-green-700 border-green-200",
  },
};

function groupByTipo(beneficiarios: BeneficiaryMovimentsTypes[]) {
  return beneficiarios.reduce<Record<string, number>>((acc, b) => {
    const key = b.tipoMovimentacao?.toUpperCase() ?? "OUTROS";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export const MovementParentCard = ({
  id,
  nomeEmpresa,
  dataMovimentacao,
  observacao,
  modalidade,
  beneficiarios,
}: MovementParentProps) => {
  const { Icon, iconClass } = getModalidade(modalidade);
  const tipoGroups = groupByTipo(beneficiarios);
  const {
    Icon: StatusIcon,
    label: statusLabel,
    badgeClass: statusBadgeClass,
  } = statusDisplayMap[resolveMovementStatus(beneficiarios)];

  const isConcluido = resolveMovementStatus(beneficiarios) === "concluido";

  return (
    <Link
      href={`/movements/${id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 lg:active:scale-96 active:scale-90 ${
        isConcluido
          ? "border-green-200 bg-green-50 hover:border-green-400 hover:shadow-md"
          : "border-gray-200 bg-white hover:border-(--blue-icon) hover:shadow-md"
      }`}
    >
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        {/* Header: nome + badge total */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Icon className={`shrink-0 text-xl ${iconClass}`} aria-hidden />
            <h2 className="text-lg font-bold leading-snug text-(--black) transition-colors group-hover:text-(--azul) sm:text-xl truncate">
              {nomeEmpresa}
            </h2>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--blue-icon)/40 bg-(--light-gray) px-2.5 py-1 text-xs font-semibold text-gray-600">
            <UsersRound
              className="h-3.5 w-3.5 text-(--blue-icon)"
              aria-hidden
            />
            {beneficiarios.length}
          </span>
        </div>

        {/* Breakdown por tipo */}
        {Object.keys(tipoGroups).length > 0 && (
          <div
            className={`flex flex-col gap-1.5 rounded-xl border px-3 py-2.5 inset-shadow-sm/20 ${isConcluido ? "bg-green-100 border-green-400 inset-shadow-green-900" : "bg-(--light-gray) border-gray-200"}`}
          >
            {Object.entries(tipoGroups).map(([tipo, count]) => {
              const config = tipoMap[tipo];
              if (!config)
                return (
                  <div
                    key={tipo}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-xs text-gray-500">{tipo}</span>
                    <span className="text-xs font-bold tabular-nums text-gray-600">
                      {count}
                    </span>
                  </div>
                );
              const {
                Icon: TipoIcon,
                iconClass: tipoIconClass,
                textClass,
                label,
              } = config;
              return (
                <div
                  key={tipo}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1.5">
                    <TipoIcon
                      className={`h-3.5 w-3.5 shrink-0 ${tipoIconClass}`}
                      aria-hidden
                    />
                    <span className={`text-xs font-medium ${textClass}`}>
                      {label}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold tabular-nums ${textClass}`}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Observação */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Observação
          </p>
          <p className="mt-1 text-sm font-medium text-gray-700">
            {observacao || (
              <span className="italic text-gray-400">Sem observação</span>
            )}
          </p>
        </div>
      </div>

      {/* Footer: data + status */}
      <div
        className={`flex items-center justify-between gap-3 border-t px-4 py-3 sm:px-5 ${isConcluido ? "border-green-200 bg-green-100" : "border-gray-100 bg-(--light-gray)"}`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
            <IoPeople className="text-base text-(--blue-icon)" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Data da movimentação
            </p>
            <p className="text-sm font-medium tabular-nums text-(--azul)">
              {parseDate(dataMovimentacao)}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass}`}
        >
          <StatusIcon className="h-3.5 w-3.5" aria-hidden />
          {statusLabel}
        </span>
      </div>
    </Link>
  );
};
