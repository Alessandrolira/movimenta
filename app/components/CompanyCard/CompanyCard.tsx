import Link from "next/link";
import { parseCnpj } from "@/app/utils/format";
import { GiHealthNormal } from "react-icons/gi";
import { FaTooth } from "react-icons/fa";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";
import { IoPeople } from "react-icons/io5";

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
interface modalideConfigProps {
  value: IconType;
  className: string;
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
  const modalidadeIcon: Record<
    CompanyProps["modalidade"],
    modalideConfigProps
  > = {
    SAUDE: {
      value: GiHealthNormal,
      className: "text-red-500",
    },
    DENTAL: {
      value: FaTooth,
      className: "text-blue-500",
    },
  };

  const Icon = modalidadeIcon[modalidade].value;

  return (
    <Link
      href={`/companies/${idEmpresa}`}
      className="grid grid-cols-2 gap-4 px-4 py-2 h-full bg-white border-(--blue-icon) 
      rounded-xl hover:border-r-6 transition-all duration-100 cursor-pointer
      border-r-4 lg:border-0 active:border-r-8 lg:active:scale-95 items-center"
    >
      <div>
        <h2 className="text-2xl font-bold">{nome}</h2>
        <p className="text-sm text-gray-600">{parseCnpj(cnpj)}</p>
      </div>

      <p className="text-end">Equipe: {nomeEquipeResponsavel}</p>
      <div className="col-span-2">
        <p>Logins</p>
        {acessos.map((acesso, index) => (
          <div key={index}>{acesso}</div>
        ))}
      </div>
      <div>
        <p>{operadora}</p>
        <Icon className={modalidadeIcon[modalidade].className} />
      </div>
      <div className="flex flex-row items-center justify-end gap-3 w-full">
        <p className="text-2xl">{qtdVidasAtivas}</p>
        <IoPeople className="text-xl" />
      </div>
    </Link>
  );
};
