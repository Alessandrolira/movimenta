"use client";

import { api } from "@/services/api";
import { parseCnpj } from "@/app/utils/format";
import { useState } from "react";
import { IoPeople } from "react-icons/io5";
import { CheckCircle2, X } from "lucide-react";

export type EmpresaFaturamento = {
  idEmpresa: string;
  nomeEmpresa: string;
  cnpjEmpresa: string;
  vidasAtivas: number;
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
const ANOS = Array.from({ length: 8 }, (_, i) => String(ANO_ATUAL + 2 - i));

function formatBRL(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBRL(value: string): number {
  return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
}

interface FaturamentoModalProps {
  empresa: EmpresaFaturamento;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FaturamentoModal({ empresa, onClose, onSuccess }: FaturamentoModalProps) {
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
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erro ao salvar faturamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
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
          <div className="flex items-center gap-2 rounded-lg bg-(--light-gray) border border-gray-200 px-3 py-2">
            <IoPeople className="h-4 w-4 text-(--blue-icon) shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Vidas ativas</p>
              <p className="text-lg font-bold tabular-nums text-(--azul)">{empresa.vidasAtivas}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mes</label>
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Receita liquida (R$)</label>
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

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-(--light-gray) px-4 py-3">
            <p className="text-sm font-semibold text-gray-600">Sinistralidade (%)</p>
            <p className={`text-2xl font-bold tabular-nums ${percColor}`}>
              {sinistroPerc !== null ? `${sinistroPerc.toFixed(1)}%` : "-"}
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
