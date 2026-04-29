"use client";

import { api } from "@/services/api";
import { parseCnpj } from "@/app/utils/format";
import { useEffect, useMemo, useState } from "react";
import { GiHealthNormal } from "react-icons/gi";
import { FaTooth } from "react-icons/fa";
import { IoPeople } from "react-icons/io5";
import { AlertTriangle, BanknoteArrowUp, CalendarClock, Search } from "lucide-react";
import { FaturamentoModal } from "@/app/components/FaturamentoModal/FaturamentoModal";
import { verifyConnected } from "@/app/utils/verifyConnected";
import { useRouter } from "next/navigation";

type EmpresaReajuste = {
  idEmpresa: string;
  nomeEmpresa: string;
  cnpjEmpresa: string;
  operadora: string;
  vidasAtivas: number;
  modalidade: string;
  dataUltimoSinistro: string | null;
};


const modalidadeMap: Record<string, { label: string; iconClass: string; badgeClass: string; Icon: React.ElementType }> = {
  SAUDE: {
    label: "Saúde",
    iconClass: "text-red-500",
    badgeClass: "bg-red-50 text-red-700 border-red-100",
    Icon: GiHealthNormal,
  },
  DENTAL: {
    label: "Dental",
    iconClass: "text-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
    Icon: FaTooth,
  },
};

function precisaFaturamento(dataUltimoSinistro: string | null): boolean {
  if (!dataUltimoSinistro) return true;
  const ultimo = new Date(dataUltimoSinistro);
  const umMesAtras = new Date();
  umMesAtras.setMonth(umMesAtras.getMonth() - 1);
  return ultimo <= umMesAtras;
}

function EmpresaCard({ e, onClick, onFaturamento }: { e: EmpresaReajuste; onClick: () => void; onFaturamento: () => void }) {
  const mod = modalidadeMap[e.modalidade] ?? {
    label: e.modalidade,
    iconClass: "text-gray-500",
    badgeClass: "bg-gray-50 text-gray-700 border-gray-200",
    Icon: GiHealthNormal,
  };
  const atrasado = precisaFaturamento(e.dataUltimoSinistro);

  return (
    <li
      onClick={onClick}
      className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 bg-white cursor-pointer ${
        atrasado ? "border-orange-300 hover:border-orange-400" : "border-gray-200 hover:border-(--blue-icon)"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-(--black) leading-snug">{e.nomeEmpresa}</p>
          <p className="font-mono text-xs text-gray-400 mt-0.5">{parseCnpj(e.cnpjEmpresa)}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${mod.badgeClass}`}>
          <mod.Icon className={`text-sm ${mod.iconClass}`} />
          {mod.label}
        </span>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Operadora</p>
          <p className="text-sm font-medium text-gray-800">{e.operadora}</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-(--light-gray) border border-gray-200 px-3 py-2">
          <IoPeople className="h-4 w-4 text-(--blue-icon) shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Vidas ativas</p>
            <p className="text-lg font-bold tabular-nums text-(--azul)">{e.vidasAtivas}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
          atrasado ? "bg-orange-50 border-orange-200" : "bg-(--light-gray) border-gray-200"
        }`}>
          <CalendarClock className={`h-4 w-4 shrink-0 ${atrasado ? "text-orange-500" : "text-(--blue-icon)"}`} />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Último faturamento</p>
            {e.dataUltimoSinistro ? (
              <p className={`text-sm font-medium ${atrasado ? "text-orange-700" : "text-gray-800"}`}>
                {new Date(`${e.dataUltimoSinistro}T12:00:00`).toLocaleDateString("pt-BR")}
              </p>
            ) : (
              <p className="text-sm italic text-orange-500 font-medium">Sem faturamento registrado</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={(ev) => { ev.stopPropagation(); onFaturamento(); }}
          className="w-full rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-500 hover:bg-(--light-gray) hover:text-(--azul) transition-colors cursor-pointer"
        >
          + Registrar faturamento
        </button>
      </div>
    </li>
  );
}

export default function LossRatioPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<EmpresaReajuste[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [empresaSelecionada, setEmpresaSelecionada] = useState<EmpresaReajuste | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().replace(/\D/g, "") || search.toLowerCase();
    return empresas.filter(
      (e) =>
        e.nomeEmpresa.toLowerCase().includes(search.toLowerCase()) ||
        e.cnpjEmpresa.replace(/\D/g, "").includes(q),
    );
  }, [empresas, search]);

  const pendentes = useMemo(() => filtered.filter((e) => precisaFaturamento(e.dataUltimoSinistro)), [filtered]);
  const emDia = useMemo(() => filtered.filter((e) => !precisaFaturamento(e.dataUltimoSinistro)), [filtered]);

  useEffect(() => {
    verifyConnected(window.location.href);
    api
      .get("/empresas/buscarEmpresasReajuste")
      .then((res) => setEmpresas(res.data ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BanknoteArrowUp className="h-6 w-6 text-(--blue-icon)" />
          <div>
            <h1 className="text-2xl font-bold text-(--black)">Sinistralidade</h1>
            <p className="text-sm text-gray-500">Acompanhamento mensal de faturamento e custo por empresa</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-(--blue-icon) transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-lg italic opacity-60 py-10">Carregando empresas...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-lg italic opacity-60 py-10">Nenhuma empresa encontrada.</p>
      ) : (
        <div className="space-y-8">
          {pendentes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold text-orange-700">Faturamento pendente ({pendentes.length})</h2>
                <div className="flex-1 h-px bg-orange-200" />
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pendentes.map((e) => (
                  <EmpresaCard key={e.cnpjEmpresa} e={e} onClick={() => router.push(`/loss-ratio/${e.idEmpresa}`)} onFaturamento={() => setEmpresaSelecionada(e)} />
                ))}
              </ul>
            </div>
          )}

          {emDia.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-500">Em dia ({emDia.length})</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {emDia.map((e) => (
                  <EmpresaCard key={e.cnpjEmpresa} e={e} onClick={() => router.push(`/loss-ratio/${e.idEmpresa}`)} onFaturamento={() => setEmpresaSelecionada(e)} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {empresaSelecionada && (
        <FaturamentoModal
          empresa={empresaSelecionada}
          onClose={() => setEmpresaSelecionada(null)}
        />
      )}
    </div>
  );
}
