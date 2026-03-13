import { MovementTypes } from "@/app/types/MovementTypes";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  LucideIcon,
  RefreshCw,
  Search,
  UserMinus,
  UserPlus,
} from "lucide-react";

interface MovementProps {
  id: string;
  tipo: "inclusao" | "exclusao" | "alteracao" | "segunda-via";
  beneficiario: string;
  data: string;
  status: "pendente" | "em_analise" | "concluido";
  descricao: string;
  arquivos?: string[];
}

interface tipoConfigProps {
  label: string;
  icon: LucideIcon;
  badgeClass: string;
}

interface statusConfigProps {
  label: string;
  icon: LucideIcon;
  className: string;
}

const tipoConfig: Record<MovementTypes["tipo"], tipoConfigProps> = {
  inclusao: {
    label: "Inclusão",
    icon: UserPlus,
    badgeClass: "bg-green-100 text-green-800 border-green-200",
  },
  exclusao: {
    label: "Exclusão",
    icon: UserMinus,
    badgeClass: "bg-red-100 text-red-800 border-red-200",
  },
  alteracao: {
    label: "Alteração",
    icon: RefreshCw,
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  "segunda-via": {
    label: "2ª Via",
    icon: CreditCard,
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

const statusConfig: Record<MovementProps["status"], statusConfigProps> = {
  pendente: {
    label: "Pendente",
    icon: Clock,
    className: "text-orange-600",
  },
  em_analise: {
    label: "Em Análise",
    icon: Search,
    className: "text-blue-600",
  },
  concluido: {
    label: "Concluído",
    icon: CheckCircle2,
    className: "text-green-600",
  },
};

export const MovementCard = ({
  id,
  tipo,
  beneficiario,
  data,
  descricao,
  status,
  arquivos,
}: MovementProps) => {
  const tipoInfo = tipoConfig[tipo];
  const statusInfo = statusConfig[status];
  const TipoIcon = tipoInfo.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 ">
      <div className="flex gap-4 items-center">
        <div className={`${tipoInfo.badgeClass} p-2 rounded-lg`}>
          <TipoIcon className="opacity-50" />
        </div>
        <div className="items-center">
          <div className="flex items-center justify-start gap-2">
            <p className="font-semibold text-sm lg:text-base">{beneficiario}</p>
            <p
              className={`text-xs rounded-full px-2 border-2 ${tipoInfo.badgeClass}`}
            >
              {tipoInfo.label}
            </p>
          </div>
          <p className="text-sm opacity-60">{descricao}</p>
        </div>
      </div>
      <div>
        <div className={`${statusInfo.className} flex items-center gap-2`}>
          <StatusIcon className="size-4" />
          <p>{statusInfo.label}</p>
        </div>
        <p className="text-xs opacity-60 text-end">{data}</p>
      </div>
    </div>
  );
};
