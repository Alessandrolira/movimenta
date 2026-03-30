import Link from "next/link";
import { parseCnpj } from "@/app/utils/format";
import { GiHealthNormal } from "react-icons/gi";
import { FaTooth } from "react-icons/fa";
import { IconType } from "react-icons";
import { IoPeople } from "react-icons/io5";
import { ChevronRight, UsersRound } from "lucide-react";

interface CompanyProps {
  idEmpresa: string;
  nome: string;
  cnpj: string;
  modalidade: string;
  operadora: string;
  acessos: string[];
  nomeEquipeResponsavel: string;
  qtdVidasAtivas: number;
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

function getModalidade(modalidade: string): ModalidadeConfig {
  return (
    modalidadeMap[modalidade] ?? {
      Icon: GiHealthNormal,
      iconClass: "text-(--gray-icon)",
      badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
      label: modalidade,
    }
  );
}

export const CompanyCard = ({
  idEmpresa,
  nome,
  cnpj,
  modalidade,
  operadora,
  acessos,
  nomeEquipeResponsavel,
  qtdVidasAtivas,
}: CompanyProps) => {
  const { Icon, iconClass, badgeClass, label: modalidadeLabel } =
    getModalidade(modalidade);

  return (
    <Link
      href={`/companies/${idEmpresa}`}
      className="group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-(--blue-icon) hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-snug text-(--black) transition-colors group-hover:text-(--azul) sm:text-xl">
              {nome}
            </h2>
            <p className="mt-1 font-mono text-xs text-gray-500 sm:text-sm">
              {parseCnpj(cnpj)}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
          >
            <Icon className={`text-base ${iconClass}`} aria-hidden />
            {modalidadeLabel}
          </span>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Operadora
            </p>
            <p className="mt-0.5 text-sm font-medium text-gray-800">
              {operadora}
            </p>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-(--light-gray) px-3 py-2">
            <UsersRound
              className="mt-0.5 h-4 w-4 shrink-0 text-(--blue-icon)"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Equipe responsável
              </p>
              <p className="text-sm font-medium text-gray-800 wrap-break-word">
                {nomeEquipeResponsavel}
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Logins ({acessos.length})
          </p>
          <div className="mt-2 max-h-24 overflow-y-auto pr-1">
            {acessos.length === 0 ? (
              <p className="text-sm italic text-gray-400">Nenhum login</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {acessos.map((acesso, index) => (
                  <li
                    key={index}
                    className="rounded-md border border-gray-100 bg-white px-2.5 py-1.5 text-xs text-gray-700 break-all shadow-sm"
                  >
                    {acesso}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-(--light-gray) px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
            <IoPeople className="text-lg text-(--blue-icon)" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Vidas ativas
            </p>
            <p className="text-xl font-bold tabular-nums text-(--azul) sm:text-2xl">
              {qtdVidasAtivas}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-0.5 text-sm font-semibold text-(--blue-icon) opacity-80 transition-opacity group-hover:opacity-100">
          Detalhes
          <ChevronRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
};
