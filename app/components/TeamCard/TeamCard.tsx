import { AnalistsTypes } from "@/app/types/AnalistsTypes";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { IoPeople } from "react-icons/io5";

interface TeamCardProps {
  nome: string;
  id: string;
  analistas: AnalistsTypes[];
}

export const TeamCard = ({ nome, id, analistas }: TeamCardProps) => {

  const handleSeniorAnalist = analistas.find((analista) => analista.responsabilidade === "SENIOR")
  return (
    <Link
      href={`/teams/${id}`}
      className="group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm
      transition-all duration-200 hover:border-(--blue-icon) hover:shadow-md active:scale-[0.99]"
    >
      <div className="space-y-2 border-b border-gray-200 p-4">
        <h2 className="text-lg font-bold leading-snug text-(--black) transition-colors group-hover:text-(--azul) sm:text-xl">
          {nome}
        </h2>
        <p className="text-xs font-mono text-xs text-gray-500 sm:text-sm">
          {handleSeniorAnalist?.nome || "SEM RESPONSÁVEL"}
        </p>
      </div>
      <div className="flex-1 p-4 space-y-2">
        <p className="text-xs font-semibold text-(--cinza)">ANALISTAS:</p>
        <ul className="items-start gap-2 rounded-lg bg-(--light-gray) px-3 py-2 border border-gray-200 inset-shadow-sm/10 text-sm text-gray-600 overflow-y-auto max-h-32">
          {analistas && analistas.length > 0 ? (
            analistas.map((analista, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-600" />
                <span>{analista.nome}</span>
              </div>
            ))
          ) : (
            <li className="opacity-60">Não há analistas</li>
          )}
        </ul>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-(--light-gray) px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
            <IoPeople className="text-lg text-(--blue-icon)" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Total
            </p>
            <p className="text-xl font-bold tabular-nums text-(--azul) sm:text-2xl">
              {analistas.length}
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
