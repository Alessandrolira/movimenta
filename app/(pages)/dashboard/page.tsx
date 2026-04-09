"use client";

import { MovementTypes } from "@/app/types/MovementTypes";
import {
  Clock,
  CreditCard,
  Files,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  ArrowRight,
  UserMinus,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import StatCard from "@/app/components/StatCard/StatCard";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import NewMovementCard from "@/app/components/NewMovementCard/NewMovementCard";
import { verifyConnected } from "@/app/utils/verifyConnected";
import { MovementParentCard } from "@/app/components/MovementCard/MovementParentCard";
import { parseDate, resolveMovementStatus } from "@/app/utils/format";
import { getUserRole } from "@/services/auth";

type SortOrder = "asc" | "desc" | "";

type UserMovementItem = {
  idEmpresa: string;
  nomeEmpresa: string;
  cnpjEmpresa: string;
  idMovimentacao: string;
  idBeneficiario: string;
  nomeBeneficiario: string;
  tipoMovimentacao: string;
  observacao: string;
  dataMovimentacao: string;
  status: string;
};

const statusMap: Record<string, { label: string; className: string }> = {
  PENDENTE: {
    label: "Pendente",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  ANALISE: {
    label: "Em Análise",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ENVIADO_OPERADORA: {
    label: "Enviado",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  PENDENTE_OPERADORA: {
    label: "Pend. Operadora",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  DECLINIO: {
    label: "Declínio",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  CONCLUIDO: {
    label: "Concluído",
    className: "bg-green-50 text-green-700 border-green-200",
  },
};

const tipoMap: Record<
  string,
  { label: string; Icon: React.ElementType; className: string }
> = {
  INCLUSAO: {
    label: "Inclusão",
    Icon: UserPlus,
    className:
      "bg-green-50 text-(--green-icon) border rounded-lg border-green-200 p-2",
  },
  EXCLUSAO: {
    label: "Exclusão",
    Icon: UserMinus,
    className:
      "text-(--red-icon) bg-red-50 border rounded-lg border-red-200 p-2",
  },
  ALTERACAO_DE_DADOS_CADASTRAIS: {
    label: "Alteração",
    Icon: RefreshCw,
    className:
      "text-(--blue-icon) bg-blue-50 border rounded-lg border-blue-200 p-2",
  },
  SEGUNDA_VIA_CARTEIRINHA: {
    label: "2ª Via",
    Icon: CreditCard,
    className:
      "text-purple-500 bg-purple-50 border rounded-lg border-purple-200 p-2",
  },
};

export default function Page() {
  const [role, setRole] = useState<"USER" | "ADMIN" | null>(null);

  // Admin state
  const [movements, setMovements] = useState<MovementTypes[]>([]);
  const [toggleNewMovement, setToggleNewMovement] = useState(false);
  const [companies, setCompanies] = useState<
    { label: string; value: string }[]
  >([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("");
  const [sortDate, setSortDate] = useState<SortOrder>("");
  const [filterStatus, setFilterStatus] = useState("");

  // User state
  const [userMovements, setUserMovements] = useState<UserMovementItem[]>([]);
  const [userFilterStatus, setUserFilterStatus] = useState("");

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verifyConnected(window.location.href);

    async function load() {
      const r = (await getUserRole()) as "USER" | "ADMIN";
      setRole(r);
      setIsLoading(true);
      try {
        if (r === "ADMIN") {
          await Promise.all([
            api
              .get("/movimentacao")
              .then((res) => setMovements(res.data || [])),
            api.get("/empresas").then((res) =>
              setCompanies(
                res.data.map((c: any) => ({
                  label: c.nome,
                  value: c.idEmpresa,
                })),
              ),
            ),
          ]);
        } else {
          await Promise.all([
            api.get("/movimentacao/user").then((res) => {
              setUserMovements(res.data || []);
              console.log(res.data);
            }),
            api.get("/empresas/user").then((res) =>
              setCompanies(
                (res.data || []).map((c: any) => ({
                  label: c.nome,
                  value: c.idEmpresa,
                })),
              ),
            ),
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // ── Admin ───────────────────────────────────────────────────────────────────
  const adminStats = useMemo(
    () => [
      {
        label: "Total",
        value: movements.length,
        icon: Files,
        color: "gray-icon",
      },
      {
        label: "Pendentes",
        value: movements.filter(
          (m) =>
            resolveMovementStatus(m.beneficiariosMovimentacao) === "pendente",
        ).length,
        icon: Layers,
        color: "orange-icon",
      },
      {
        label: "Em Análise",
        value: movements.filter(
          (m) =>
            resolveMovementStatus(m.beneficiariosMovimentacao) === "analise",
        ).length,
        icon: Clock,
        color: "blue-icon",
      },
      {
        label: "Concluídos",
        value: movements.filter(
          (m) =>
            resolveMovementStatus(m.beneficiariosMovimentacao) === "concluido",
        ).length,
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
        m.beneficiariosMovimentacao.some((b) =>
          b.nome.toLowerCase().includes(q),
        );
      const matchStatus =
        !filterStatus ||
        resolveMovementStatus(m.beneficiariosMovimentacao) === filterStatus;
      return matchSearch && matchStatus;
    });
    if (sortOrder === "asc")
      result = [...result].sort((a, b) =>
        a.nomeEmpresa.localeCompare(b.nomeEmpresa),
      );
    if (sortOrder === "desc")
      result = [...result].sort((a, b) =>
        b.nomeEmpresa.localeCompare(a.nomeEmpresa),
      );
    if (sortDate) {
      result = [...result].sort((a, b) => {
        const toTs = (d: string | number[]) =>
          Array.isArray(d)
            ? new Date(d[0], d[1] - 1, d[2], d[3] ?? 0, d[4] ?? 0).getTime()
            : new Date(d).getTime();
        return sortDate === "desc"
          ? toTs(b.dataMovimentacao) - toTs(a.dataMovimentacao)
          : toTs(a.dataMovimentacao) - toTs(b.dataMovimentacao);
      });
    }
    return result;
  }, [movements, search, sortOrder, sortDate, filterStatus]);

  // ── User ────────────────────────────────────────────────────────────────────
  const userStats = useMemo(
    () => [
      {
        label: "Total",
        value: userMovements.length,
        icon: Files,
        color: "gray-icon",
      },
      {
        label: "Pendentes",
        value: userMovements.filter(
          (m) => m.status?.toUpperCase() === "PENDENTE",
        ).length,
        icon: Layers,
        color: "orange-icon",
      },
      {
        label: "Em Análise",
        value: userMovements.filter(
          (m) => m.status?.toUpperCase() === "ANALISE",
        ).length,
        icon: Clock,
        color: "blue-icon",
      },
      {
        label: "Concluídos",
        value: userMovements.filter(
          (m) => m.status?.toUpperCase() === "CONCLUIDO",
        ).length,
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

  const stats = role === "USER" ? userStats : adminStats;
  const hasFilters =
    search || sortOrder || sortDate || filterStatus || userFilterStatus;

  return (
    <div className="relative">
      {toggleNewMovement && (
        <NewMovementCard
          companies={companies}
          onClick={() => setToggleNewMovement(false)}
          onSuccess={() => {
            if (role === "ADMIN") {
              api
                .get("/movimentacao")
                .then((res) => setMovements(res.data || []));
            } else {
              api
                .get("/movimentacao/user")
                .then((res) => setUserMovements(res.data || []));
            }
          }}
        />
      )}

      <div className="space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Visão Geral</h1>
          <h2 className="opacity-60">
            Gerencie as movimentações do seu plano de saúde
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        <div className="flex justify-between items-center p-2 w-full">
          <h2 className="text-2xl font-semibold tracking-wide">
            Movimentações
          </h2>
          {role === "USER" && (
            <button
              onClick={() => setToggleNewMovement(true)}
              className="flex gap-2 bg-(--blue-button) p-2 text-white cursor-pointer rounded-lg hover:bg-(--azul) active:scale-95 transition duration-100"
            >
              <Plus className="scale-70" />
              <p className="hidden lg:block">Nova Movimentação</p>
            </button>
          )}
        </div>

        {/* ── Filtros ── */}
        <div className="flex flex-col lg:flex-row gap-3 items-center">
          <div className="flex w-full items-center bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-1 gap-1">
            <Search className="p-1 m-1 text-gray-400" />
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
                  onClick={() =>
                    setSortOrder((p) =>
                      p === "asc" ? "desc" : p === "desc" ? "" : "asc",
                    )
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition cursor-pointer whitespace-nowrap
                    ${sortOrder ? "border-blue-200 bg-(--blue-icon)/10 text-(--azul)" : "border-gray-200 bg-white text-gray-600 hover:border-blue-200"}`}
                >
                  {sortOrder === "desc" ? (
                    <ArrowUpAZ className="h-4 w-4" />
                  ) : (
                    <ArrowDownAZ className="h-4 w-4" />
                  )}
                  {sortOrder === "asc"
                    ? "A → Z"
                    : sortOrder === "desc"
                      ? "Z → A"
                      : "A - Z"}
                </button>
                <button
                  onClick={() =>
                    setSortDate((p) =>
                      p === "desc" ? "asc" : p === "asc" ? "" : "desc",
                    )
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition cursor-pointer whitespace-nowrap
                    ${sortDate ? "border-blue-200 bg-(--blue-icon)/10 text-(--azul)" : "border-gray-200 bg-white text-gray-600 hover:border-blue-200"}`}
                >
                  {sortDate === "asc" ? (
                    <ArrowUpNarrowWide className="h-4 w-4" />
                  ) : (
                    <ArrowDownNarrowWide className="h-4 w-4" />
                  )}
                  {sortDate === "desc"
                    ? "Mais recente"
                    : sortDate === "asc"
                      ? "Mais antiga"
                      : "Data"}
                </button>
              </>
            )}
            <div className="col-span-2 sm:col-span-1 sm:w-48">
              <CustomSelect
                id="filterStatus"
                label="Todos os status"
                value={role === "USER" ? userFilterStatus : filterStatus}
                onChange={(val) =>
                  role === "USER"
                    ? setUserFilterStatus(val)
                    : setFilterStatus(val)
                }
                options={[
                  { label: "Todos os status", value: "" },
                  {
                    label: "Pendente",
                    value: role === "USER" ? "PENDENTE" : "pendente",
                  },
                  {
                    label: "Em Análise",
                    value: role === "USER" ? "ANALISE" : "analise",
                  },
                  {
                    label: "Enviado Operadora",
                    value:
                      role === "USER"
                        ? "ENVIADO_OPERADORA"
                        : "enviado_operadora",
                  },
                  {
                    label: "Pend. Operadora",
                    value:
                      role === "USER"
                        ? "PENDENTE_OPERADORA"
                        : "pendente_operadora",
                  },
                  {
                    label: "Declínio",
                    value: role === "USER" ? "DECLINIO" : "declinio",
                  },
                  {
                    label: "Concluído",
                    value: role === "USER" ? "CONCLUIDO" : "concluido",
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* ── Lista ── */}
        {isLoading ? (
          <p className="text-center text-2xl italic opacity-60 py-8">
            Carregando...
          </p>
        ) : role === "USER" ? (
          filteredUser.length === 0 ? (
            <p className="text-center text-2xl italic opacity-60">
              {hasFilters
                ? "Nenhuma movimentação encontrada"
                : "Não há movimentações realizadas"}
            </p>
          ) : (
            <ul className="grid gap-2">
              {filteredUser.map((m) => {
                const st = statusMap[m.status?.toUpperCase()] ?? {
                  label: m.status,
                  className: "bg-gray-50 text-gray-700 border-gray-200",
                };
                const tipo = tipoMap[m.tipoMovimentacao?.toUpperCase()] ?? null;
                const isConcluido = m.status?.toUpperCase() === "CONCLUIDO";
                return (
                  <li key={`${m.idMovimentacao}-${m.nomeBeneficiario}`}>
                    <Link
                      href={`/beneficiarios/${m.idBeneficiario}`}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md border px-3 py-3 transition-all duration-100 inset-shadow-sm ${
                        isConcluido
                          ? "border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100"
                          : "border-gray-200 bg-(--light-gray) hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {tipo && (
                          <div className={`shrink-0 ${tipo.className}`}>
                            <tipo.Icon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {m.nomeBeneficiario}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {tipo?.label}
                            {m.nomeEmpresa && <> &middot; {m.nomeEmpresa}</>}
                          </p>
                          <p className="text-xs text-gray-400">
                            {parseDate(m.dataMovimentacao)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${st.className}`}
                        >
                          {st.label}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )
        ) : filteredAdmin.length === 0 ? (
          <p className="text-center text-2xl italic opacity-60">
            {hasFilters
              ? "Nenhuma movimentação encontrada"
              : "Não há movimentações realizadas"}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAdmin.slice(0, 8).map((movement, i) => (
              <MovementParentCard
                key={i}
                dataMovimentacao={movement.dataMovimentacao}
                id={movement.idMovimentacao}
                nomeEmpresa={movement.nomeEmpresa}
                observacao={movement.observacao}
                modalidade={movement.modalidade}
                beneficiarios={movement.beneficiariosMovimentacao}
              />
            ))}
            {filteredAdmin.length > 8 && (
              <Link
                href="/movements"
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-white text-gray-500 transition-all duration-200 hover:border-(--blue-icon) hover:text-(--azul) hover:shadow-md active:scale-95 min-h-40 p-6"
              >
                <ArrowRight className="h-8 w-8" />
                <span className="text-base font-semibold">
                  Ver todas as movimentações
                </span>
                <span className="text-sm opacity-70">
                  {filteredAdmin.length - 8} restantes
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
