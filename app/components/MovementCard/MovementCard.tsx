import { BeneficiaryTypes } from "@/app/types/BeneficiaryTypes";
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
  beneficiario: BeneficiaryTypes;
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
  beneficiario,
  data,
  descricao,
  status,
  arquivos,
}: MovementProps) => {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 ">
      <div className="flex gap-4 items-center">
        {/* <div className={`${tipoInfo.badgeClass} p-2 rounded-lg`}>
          <TipoIcon className="opacity-50" />
        </div> */}
        <div className="items-center">
          <div className="flex items-center justify-start gap-2">
            <p className="font-semibold text-sm lg:text-base">{beneficiario.nome}</p>
            {/* <p
              className={`text-xs rounded-full px-2 border-2 ${tipoInfo.badgeClass}`}
            >
              {tipoInfo.label}
            </p> */}
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
