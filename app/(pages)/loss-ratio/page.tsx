"use client";

import { api } from "@/services/api";
import { parseCnpj } from "@/app/utils/format";
import { useEffect, useMemo, useState } from "react";
import { GiHealthNormal } from "react-icons/gi";
import { FaTooth } from "react-icons/fa";
import { IoPeople } from "react-icons/io5";
import { AlertTriangle, BanknoteArrowUp, CalendarClock, CheckCircle2, Search, X } from "lucide-react";
import { verifyConnected } from "@/app/utils/verifyConnected";

type EmpresaReajuste = {
  idEmpresa: string;
  nomeEmpresa: string;
  cnpjEmpresa: string;
  operadora: string;
  vidasAtivas: number;
  modalidade: string;
  dataUltimoSinistro: string | null;
};

const MESES = [
  { label: "Janeiro", value: "1" },
  { label: "Fevereiro", value: "2" },
  { label: "Março", value: "3" },
  { label: "Abril", value: "4" },
  { label: "Maio", value: "5" },
  { label: "Junho", value: "6" },
  { label: "Julho", value: "7" },
  { label: "Agosto", value: "8" },
  { label: "Setembro", value: "9" },
  { label: "Outubro", value: "10" },
  { label: "Novembro", value: "11" },
  { label: "Dezembro", value: "12" },
];

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 5 }, (_, i) => String(ANO_ATUAL - i));

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

function formatBRL(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBRL(value: string): number {
  return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
}

function FaturamentoModal({ empresa, onClose }: { empresa: EmpresaReajuste; onClose: () => void }) {
  const mesAtual = String(new Date().getMonth() + 1);
  const [mes, setMes] = useState(mesAtual);
  const [ano, setAno] = useState(String(ANO_ATUAL));
  const [receitaLiquida, setReceitaLiquida] = useState("");
  const [sinistro, setSinistro] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const receitaNum = parseBRL(receitaLiquida);
  const sinistroNum = parseBRL(sinistro);
  const sinistroPerc = receitaNum > 0 ? (sinistroNum / receitaNum) * 100 : null;

  const percColor =
    sinistroPerc === null
      ? "text-gray-400"
      : sinistroPerc <= 70
        ? "text-green-600"
        : sinistroPerc <= 85
          ? "text-yellow-600"
          : "text-red-600";

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!receitaLiquida || !sinistro) {
      setError("Preencha todos os campos.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const mesFormatado = String(Number(mes)).padStart(2, "0");
      await api.post("/sinistro", {
        idEmpresa: empresa.idEmpresa,
        mes: `${ano}-${mesFormatado}-01`,
        receitaLiquida: receitaNum,
        sinistro: sinistroNum,
        sinistralidadePorcentagem: sinistroPerc ?? 0,
        vidasAtuais: empresa.vidasAtivas,
      });
      setSuccess(true);
      setTimeout(onClose, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erro ao salvar faturamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-(--black)">Registrar faturamento</h2>
            <p className="text-xs text-gray-500 mt-0.5">{empresa.nomeEmpresa} &middot; {parseCnpj(empresa.cnpjEmpresa)}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Vidas ativas */}
          <div className="flex items-center gap-2 rounded-lg bg-(--light-gray) border border-gray-200 px-3 py-2">
            <IoPeople className="h-4 w-4 text-(--blue-icon) shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Vidas ativas</p>
              <p className="text-lg font-bold tabular-nums text-(--azul)">{empresa.vidasAtivas}</p>
            </div>
          </div>

          {/* Mês e Ano */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mês</label>
              <select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-(--blue-icon) transition-all cursor-pointer"
              >
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ano</label>
              <select
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-(--blue-icon) transition-all cursor-pointer"
              >
                {ANOS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Receita Líquida */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Receita líquida (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={receitaLiquida}
                onChange={(e) => setReceitaLiquida(formatBRL(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-(--blue-icon) transition-all"
              />
            </div>
          </div>

          {/* Sinistro */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sinistro (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={sinistro}
                onChange={(e) => setSinistro(formatBRL(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-(--blue-icon) transition-all"
              />
            </div>
          </div>

          {/* Sinistro % calculado */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-(--light-gray) px-4 py-3">
            <p className="text-sm font-semibold text-gray-600">Sinistralidade (%)</p>
            <p className={`text-2xl font-bold tabular-nums ${percColor}`}>
              {sinistroPerc !== null ? `${sinistroPerc.toFixed(1)}%` : "—"}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Faturamento registrado com sucesso!
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || success}
              className="flex-1 rounded-lg bg-(--azul) px-4 py-2 text-sm font-medium text-white hover:bg-(--azul-escuro) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Salvando..." : "Salvar faturamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmpresaCard({ e, onClick }: { e: EmpresaReajuste; onClick: () => void }) {
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
      </div>
    </li>
  );
}

export default function LossRatioPage() {
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
                  <EmpresaCard key={e.cnpjEmpresa} e={e} onClick={() => setEmpresaSelecionada(e)} />
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
                  <EmpresaCard key={e.cnpjEmpresa} e={e} onClick={() => setEmpresaSelecionada(e)} />
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
