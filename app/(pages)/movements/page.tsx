"use client";

import { MovementTypes } from "@/app/types/MovementTypes";
import {
  Clock,
  CreditCard,
  Files,
  Layers,
  RefreshCw,
  Search,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  UserMinus,
  UserPlus,
} from "lucide-react";
import StatCard from "@/app/components/StatCard/StatCard";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import { MovementParentCard } from "@/app/components/MovementCard/MovementParentCard";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { parseDate, resolveMovementStatus } from "@/app/utils/format";
import { getUserRole } from "@/services/auth";
import Link from "next/link";

type SortOrder = "asc" | "desc" | "";

type UserMovementItem = {
  idEmpresa: string;
  nomeEmpresa: string;
  cnpjEmpresa: string;
  idMovimentacao: string;
  nomeBeneficiario: string;
  tipoMovimentacao: string;
  observacao: string;
  dataMovimentacao: string;
  status: string;
};

const statusMap: Record<string, { label: string; className: string }> = {
  PENDENTE: { label: "Pendente", className: "bg-orange-50 text-orange-700 border-orange-200" },
  ANALISE: { label: "Em Análise", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ENVIADO_OPERADORA: { label: "Enviado", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  PENDENTE_OPERADORA: { label: "Pend. Operadora", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  DECLINIO: { label: "Declínio", className: "bg-red-50 text-red-700 border-red-200" },
  CONCLUIDO: { label: "Concluído", className: "bg-green-50 text-green-700 border-green-200" },
};

const tipoMap: Record<string, { label: string; Icon: React.ElementType; iconClass: string }> = {
  INCLUSAO: { label: "Inclusão", Icon: UserPlus, iconClass: "text-green-500" },
  EXCLUSAO: { label: "Exclusão", Icon: UserMinus, iconClass: "text-red-500" },
  ALTERACAO_DE_DADOS_CADASTRAIS: { label: "Alteração", Icon: RefreshCw, iconClass: "text-orange-500" },
  SEGUNDA_VIA_CARTEIRINHA: { label: "2ª Via", Icon: CreditCard, iconClass: "text-purple-500" },
};

export default function Page() {
  const [role, setRole] = useState<"USER" | "ADMIN" | null>(null);

  // Admin state
  const [movements, setMovements] = useState<MovementTypes[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("");
  const [sortDate, setSortDate] = useState<SortOrder>("");
  const [filterStatus, setFilterStatus] = useState("");

  // User state
  const [userMovements, setUserMovements] = useState<UserMovementItem[]>([]);
  const [userFilterStatus, setUserFilterStatus] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const r = (await getUserRole()) as "USER" | "ADMIN";
      setRole(r);
      try {
        setIsLoading(true);
        if (r === "ADMIN") {
          const res = await api.get("/movimentacao");
          setMovements(res.data || []);
        } else {
          const res = await api.get("/movimentacao/user");
          setUserMovements(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // ── Admin: stats + filtered ─────────────────────────────────────────────────
  const adminStats = useMemo(
    () => [
      { label: "Total", value: movements.length, icon: Files, color: "gray-icon" },
      {
        label: "Pendentes",
        value: movements.filter((m) => resolveMovementStatus(m.beneficiariosMovimentacao) === "pendente").length,
        icon: Layers,
        color: "orange-icon",
      },
      {
        label: "Em Análise",
        value: movements.filter((m) => resolveMovementStatus(m.beneficiariosMovimentacao) === "analise").length,
        icon: Clock,
        color: "blue-icon",
      },
      {
        label: "Concluídos",
        value: movements.filter((m) => resolveMovementStatus(m.beneficiariosMovimentacao) === "concluido").length,
        icon: Files,
        color: "green-icon",
      },
    ],
    [movements],
  );

  const filteredAdmin = useMemo(() => {
    const q = search.toLowerCase();
    let result = movements.filter((m) => {
      const matchSearch =
        !q ||
        m.nomeEmpresa.toLowerCase().includes(q) ||
        m.beneficiariosMovimentacao.some((b) => b.nome.toLowerCase().includes(q));
      const matchStatus =
        !filterStatus || resolveMovementStatus(m.beneficiariosMovimentacao) === filterStatus;
      return matchSearch && matchStatus;
    });
    if (sortOrder === "asc") result = [...result].sort((a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa));
    if (sortOrder === "desc") result = [...result].sort((a, b) => b.nomeEmpresa.localeCompare(a.nomeEmpresa));
    if (sortDate) {
      result = [...result].sort((a, b) => {
        const toTs = (d: string | number[]) =>
          Array.isArray(d)
            ? new Date(d[0], d[1] - 1, d[2], d[3] ?? 0, d[4] ?? 0).getTime()
            : new Date(d).getTime();
        return sortDate === "desc" ? toTs(b.dataMovimentacao) - toTs(a.dataMovimentacao) : toTs(a.dataMovimentacao) - toTs(b.dataMovimentacao);
      });
    }
    result = [...result].sort((a, b) => {
      const aCon = resolveMovementStatus(a.beneficiariosMovimentacao) === "concluido";
      const bCon = resolveMovementStatus(b.beneficiariosMovimentacao) === "concluido";
      if (aCon === bCon) return 0;
      return aCon ? 1 : -1;
    });
    return result;
  }, [movements, search, sortOrder, sortDate, filterStatus]);

  // ── User: stats + filtered ──────────────────────────────────────────────────
  const userStats = useMemo(
    () => [
      { label: "Total", value: userMovements.length, icon: Files, color: "gray-icon" },
      {
        label: "Pendentes",
        value: userMovements.filter((m) => m.status?.toUpperCase() === "PENDENTE").length,
        icon: Layers,
        color: "orange-icon",
      },
      {
        label: "Em Análise",
        value: userMovements.filter((m) => m.status?.toUpperCase() === "ANALISE").length,
        icon: Clock,
        color: "blue-icon",
      },
      {
        label: "Concluídos",
        value: userMovements.filter((m) => m.status?.toUpperCase() === "CONCLUIDO").length,
        icon: Files,
        color: "green-icon",
      },
    ],
    [userMovements],
  );

  const filteredUser = useMemo(() => {
    const q = search.toLowerCase();
    let result = userMovements.filter((m) => {
      const matchSearch =
        !q ||
        m.nomeEmpresa.toLowerCase().includes(q) ||
        m.nomeBeneficiario.toLowerCase().includes(q);
      const matchStatus =
        !userFilterStatus || m.status?.toUpperCase() === userFilterStatus;
      return matchSearch && matchStatus;
    });
    // Concluídos por último
    result = [...result].sort((a, b) => {
      const aCon = a.status?.toUpperCase() === "CONCLUIDO";
      const bCon = b.status?.toUpperCase() === "CONCLUIDO";
      if (aCon === bCon) return 0;
      return aCon ? 1 : -1;
    });
    return result;
  }, [userMovements, search, userFilterStatus]);

  const hasFilters = search || sortOrder || sortDate || filterStatus || userFilterStatus;
  const stats = role === "ADMIN" ? adminStats : userStats;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Movimentações</h1>
          <p className="opacity-60 text-sm sm:text-base">
            Acompanhe todas as movimentações realizadas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      {/* Lista */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4">
        <div>
          <p className="text-2xl font-semibold tracking-wide">Lista de movimentações</p>
          <p className="text-sm text-gray-500">
            {role === "ADMIN" ? movements.length : userMovements.length} movimentação(ões) no total
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col lg:flex-row gap-3 items-center">
          <div className="flex w-full items-center bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-1 gap-1">
            <Search className="p-1 m-1 text-gray-400 shrink-0" />
            <input
              id="search"
              type="text"
              placeholder="Buscar por empresa ou beneficiário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 border-b border-white hover:border-(--blue-icon) focus:border-(--blue-icon) focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-3 w-full lg:w-auto">
            {role === "ADMIN" && (
              <>
                <button
                  onClick={() => setSortOrder((p) => (p === "asc" ? "desc" : p === "desc" ? "" : "asc"))}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition cursor-pointer whitespace-nowrap
                    ${sortOrder ? "border-blue-200 bg-(--blue-icon)/10 text-(--azul)" : "border-gray-200 bg-white text-gray-600 hover:border-blue-200"}`}
                >
                  {sortOrder === "desc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
                  {sortOrder === "asc" ? "A → Z" : sortOrder === "desc" ? "Z → A" : "A - Z"}
                </button>

                <button
                  onClick={() => setSortDate((p) => (p === "desc" ? "asc" : p === "asc" ? "" : "desc"))}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition cursor-pointer whitespace-nowrap
                    ${sortDate ? "border-blue-200 bg-(--blue-icon)/10 text-(--azul)" : "border-gray-200 bg-white text-gray-600 hover:border-blue-200"}`}
                >
                  {sortDate === "asc" ? <ArrowUpNarrowWide className="h-4 w-4" /> : <ArrowDownNarrowWide className="h-4 w-4" />}
                  {sortDate === "desc" ? "Mais recente" : sortDate === "asc" ? "Mais antiga" : "Data"}
                </button>
              </>
            )}

            <div className="col-span-2 sm:col-span-1 sm:w-48">
              <CustomSelect
                id="filterStatus"
                label="Todos os status"
                value={role === "ADMIN" ? filterStatus : userFilterStatus}
                onChange={(val) => role === "ADMIN" ? setFilterStatus(val) : setUserFilterStatus(val)}
                options={[
                  { label: "Todos os status", value: "" },
                  { label: "Pendente", value: role === "ADMIN" ? "pendente" : "PENDENTE" },
                  { label: "Em Análise", value: role === "ADMIN" ? "analise" : "ANALISE" },
                  { label: "Enviado Operadora", value: role === "ADMIN" ? "enviado_operadora" : "ENVIADO_OPERADORA" },
                  { label: "Pend. Operadora", value: role === "ADMIN" ? "pendente_operadora" : "PENDENTE_OPERADORA" },
                  { label: "Declínio", value: role === "ADMIN" ? "declinio" : "DECLINIO" },
                  { label: "Concluído", value: role === "ADMIN" ? "concluido" : "CONCLUIDO" },
                ]}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-xl italic opacity-60 py-8">Carregando movimentações...</p>
        ) : role === "ADMIN" ? (
          filteredAdmin.length === 0 ? (
            <p className="text-center text-xl italic opacity-60 py-8">
              {hasFilters ? "Nenhuma movimentação encontrada para os filtros aplicados." : "Não há movimentações realizadas."}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAdmin.map((movement) => (
                <MovementParentCard
                  key={movement.idMovimentacao}
                  id={movement.idMovimentacao}
                  nomeEmpresa={movement.nomeEmpresa}
                  dataMovimentacao={movement.dataMovimentacao}
                  observacao={movement.observacao}
                  modalidade={movement.modalidade}
                  beneficiarios={movement.beneficiariosMovimentacao}
                />
              ))}
            </div>
          )
        ) : filteredUser.length === 0 ? (
          <p className="text-center text-xl italic opacity-60 py-8">
            {hasFilters ? "Nenhuma movimentação encontrada para os filtros aplicados." : "Não há movimentações realizadas."}
          </p>
        ) : (
          <ul className="grid gap-2">
            {filteredUser.map((m) => {
              const st = statusMap[m.status?.toUpperCase()] ?? { label: m.status, className: "bg-gray-50 text-gray-700 border-gray-200" };
              const tipo = tipoMap[m.tipoMovimentacao?.toUpperCase()] ?? null;
              const isConcluido = m.status?.toUpperCase() === "CONCLUIDO";
              return (
                <li key={`${m.idMovimentacao}-${m.nomeBeneficiario}`}>
                  <Link
                    href={`/movements/${m.idMovimentacao}`}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-100 inset-shadow-sm ${
                      isConcluido
                        ? "border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100"
                        : "border-gray-200 bg-(--light-gray) hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {tipo && <tipo.Icon className={`h-4 w-4 shrink-0 ${tipo.iconClass}`} />}
                        <p className="font-semibold text-sm truncate">{m.nomeBeneficiario}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {m.nomeEmpresa}
                        {m.observacao && <> &middot; {m.observacao}</>}
                      </p>
                      <p className="text-xs text-gray-400">{parseDate(m.dataMovimentacao)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {tipo && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {tipo.label}
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${st.className}`}>
                        {st.label}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
