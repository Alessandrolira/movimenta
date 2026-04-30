"use client";

import { api } from "@/services/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, BanknoteArrowUp, TrendingUp } from "lucide-react";
import { FaturamentoModal, type EmpresaFaturamento } from "@/app/components/FaturamentoModal/FaturamentoModal";
import { verifyConnected } from "@/app/utils/verifyConnected";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";


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

type GraficoItem = {
  mes: string;
  despesa: number;
  sinistralidade: number;
  receitaLiquida: number;
};

type MatrizItem = {
  competencia: string;
  beneficiariosAtivos: number;
  receita: number;
  despesa: number;
  limiteUtilizacao: number;
  sinistralidade: number;
  diferencaReais: number;
  diferencaPorcentagem: number;
};

type CompetenciaItem = {
  competencia: string;
  mediaVidas: number;
  receita: number;
  despesa: number;
  limiteUtilizacao: number;
  sinistralidade: number;
  diferencaReais: number;
  diferencaPorcentagem: number;
};

type Relatorio = {
  sinistralidadeAtual: number;
  totalReceita: number;
  totalDespesa: number;
  diferenca: number;
  limiteTecnico: number;
  graficoBarras: GraficoItem[];
  dadosMatriz: MatrizItem[];
  competencias: CompetenciaItem[] | null;
};

function formatBRL(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(2).replace(".", ",")} Mi`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(2).replace(".", ",")} Mil`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMes(dateStr: string): string {
  const [ano, mes] = dateStr.split("-");
  const m = MESES.find((m) => m.value === String(Number(mes)));
  return `${m?.label.slice(0, 3) ?? mes}/${ano.slice(2)}`;
}

function percColor(perc: number): string {
  if (perc <= 70) return "text-green-600";
  if (perc <= 85) return "text-yellow-600";
  return "text-red-600";
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-2xl font-bold tabular-nums text-(--azul)">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function RelatorioPage() {
  const { idEmpresa } = useParams<{ idEmpresa: string }>();
  const router = useRouter();

  const mesAtual = new Date().getMonth() + 1;
  const [mesInicio, setMesInicio] = useState("1");
  const [anoInicio, setAnoInicio] = useState(String(ANO_ATUAL));
  const [mesFim, setMesFim] = useState(String(mesAtual));
  const [anoFim, setAnoFim] = useState(String(ANO_ATUAL));

  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaFaturamento | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function buildParams() {
    const dataInicio = `${anoInicio}-${String(mesInicio).padStart(2, "0")}-01`;
    const dataFim = `${anoFim}-${String(mesFim).padStart(2, "0")}-01`;
    return { dataInicio, dataFim };
  }

  async function fetchRelatorio() {
    setIsLoading(true);
    setError(null);
    try {
      const { dataInicio, dataFim } = buildParams();
      const res = await api.get(`/sinistro/${idEmpresa}`, {
        params: { dataInicio, dataFim },
      });
      setRelatorio(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erro ao carregar relatório.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    verifyConnected(window.location.href);
    fetchRelatorio();
    api.get("/empresas/buscarEmpresasReajuste").then((res) => {
      const found = (res.data ?? []).find((e: any) => e.idEmpresa === idEmpresa);
      if (found) setEmpresa({ idEmpresa: found.idEmpresa, nomeEmpresa: found.nomeEmpresa, cnpjEmpresa: found.cnpjEmpresa, vidasAtivas: found.vidasAtivas });
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <TrendingUp className="h-6 w-6 text-(--blue-icon)" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-(--black)">Relatório de Sinistralidade</h1>
          <p className="text-sm text-gray-500">{empresa?.nomeEmpresa ?? "Performance de utilização consolidada"}</p>
        </div>
        {empresa && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-(--azul) px-4 py-2 text-sm font-medium text-white hover:bg-(--azul-escuro) transition-colors cursor-pointer"
          >
            <BanknoteArrowUp className="h-4 w-4" />
            Registrar faturamento
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Mês início</p>
          <select
            value={mesInicio}
            onChange={(e) => setMesInicio(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-(--blue-icon) transition-all cursor-pointer"
          >
            {MESES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ano início</p>
          <select
            value={anoInicio}
            onChange={(e) => setAnoInicio(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-(--blue-icon) transition-all cursor-pointer"
          >
            {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Mês fim</p>
          <select
            value={mesFim}
            onChange={(e) => setMesFim(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-(--blue-icon) transition-all cursor-pointer"
          >
            {MESES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ano fim</p>
          <select
            value={anoFim}
            onChange={(e) => setAnoFim(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-(--blue-icon) transition-all cursor-pointer"
          >
            {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={fetchRelatorio}
          disabled={isLoading}
          className="rounded-lg bg-(--azul) px-5 py-2 text-sm font-medium text-white hover:bg-(--azul-escuro) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Carregando..." : "Aplicar"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      {isLoading && (
        <p className="text-center text-lg italic opacity-60 py-10">Carregando relatório...</p>
      )}

      {!isLoading && relatorio && (
        <div className="space-y-6">
          {/* Cards de totalizadores */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              label="Sinistralidade"
              value={`${relatorio.sinistralidadeAtual.toFixed(2).replace(".", ",")}%`}
            />
            <StatCard
              label="Limite Técnico"
              value={`${relatorio.limiteTecnico.toFixed(2).replace(".", ",")}%`}
            />
            <StatCard
              label="Total de Receita"
              value={formatBRL(relatorio.totalReceita)}
            />
            <StatCard
              label="Total de Despesa"
              value={formatBRL(relatorio.totalDespesa)}
            />
            <StatCard
              label="Diferença"
              value={`${relatorio.diferenca.toFixed(2).replace(".", ",")}%`}
            />
          </div>

          {/* Gráfico */}
          {relatorio.graficoBarras.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-4">Performance mensal</p>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={relatorio.graficoBarras.map((g) => ({
                  ...g,
                  mes: formatMes(g.mes),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === "Sinistralidade") return [`${value.toFixed(2)}%`, name];
                      return [formatBRL(value), name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="receitaLiquida" name="Receita Líquida" fill="#93c5fd" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="receitaLiquida" position="top" fontSize={10} fill="#6b7280" formatter={(v: number) => formatBRL(v)} />
                  </Bar>
                  <Bar yAxisId="left" dataKey="despesa" name="Despesa" fill="#1a3f7d" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="despesa" position="top" fontSize={10} fill="#6b7280" formatter={(v: number) => formatBRL(v)} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="sinistralidade" name="Sinistralidade" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }}>
                    <LabelList dataKey="sinistralidade" position="top" fontSize={10} fill="#f97316" formatter={(v: number) => `${v.toFixed(1)}%`} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabela de competências (matriz) */}
          {relatorio.dadosMatriz.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Detalhamento por competência</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-(--light-gray) text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <th className="px-4 py-3 text-left">Competência</th>
                      <th className="px-4 py-3 text-right">Benef. Ativos</th>
                      <th className="px-4 py-3 text-right">Receita</th>
                      <th className="px-4 py-3 text-right">Despesa</th>
                      <th className="px-4 py-3 text-right">Limite Utilização</th>
                      <th className="px-4 py-3 text-right">Sinistralidade</th>
                      <th className="px-4 py-3 text-right">Diferença R$</th>
                      <th className="px-4 py-3 text-right">Diferença %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.dadosMatriz.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-700">{formatMes(row.competencia)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">{row.beneficiariosAtivos}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">{formatBRL(row.receita)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">{formatBRL(row.despesa)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">{formatBRL(row.limiteUtilizacao)}</td>
                        <td className={`px-4 py-3 text-right tabular-nums font-semibold ${percColor(row.sinistralidade)}`}>
                          {row.sinistralidade.toFixed(2).replace(".", ",")}%
                        </td>
                        <td className={`px-4 py-3 text-right tabular-nums font-medium ${row.diferencaReais >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatBRL(row.diferencaReais)}
                        </td>
                        <td className={`px-4 py-3 text-right tabular-nums font-medium ${row.diferencaPorcentagem >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {row.diferencaPorcentagem.toFixed(2).replace(".", ",")}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resumo por períodos */}
          {relatorio.competencias && relatorio.competencias.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Resumo por período</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <th className="px-4 py-3 text-left">Competência</th>
                      <th className="px-4 py-3 text-right">Média Vidas</th>
                      <th className="px-4 py-3 text-right">Receita</th>
                      <th className="px-4 py-3 text-right">Despesa</th>
                      <th className="px-4 py-3 text-right">Limite Utilização</th>
                      <th className="px-4 py-3 text-right">Sinistralidade</th>
                      <th className="px-4 py-3 text-right">Diferença R$</th>
                      <th className="px-4 py-3 text-right">Diferença %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.competencias.map((row, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-(--azul) text-white" : "bg-white"}`}>
                        <td className="px-4 py-3 font-semibold">{row.competencia}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{row.mediaVidas}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatBRL(row.receita)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatBRL(row.despesa)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatBRL(row.limiteUtilizacao)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold">
                          {row.sinistralidade.toFixed(2).replace(".", ",")}%
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatBRL(row.diferencaReais)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {row.diferencaPorcentagem.toFixed(2).replace(".", ",")}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {modalOpen && empresa && (
        <FaturamentoModal
          empresa={empresa}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchRelatorio}
        />
      )}
    </div>
  );
}