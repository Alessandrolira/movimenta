"use client";

import { MovementTypes } from "@/app/types/MovementTypes";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  UserMinus,
  UserPlus,
  CheckCircle2,
  Building2,
  UsersRound,
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
  modalidade?: string;
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

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition hover:border-(--blue-icon) hover:text-(--azul) disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-gray-600">
        Página <span className="font-semibold">{page + 1}</span> de{" "}
        <span className="font-semibold">{totalPages}</span>
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition hover:border-(--blue-icon) hover:text-(--azul) disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function Page() {
  const [role, setRole] = useState<"USER" | "ADMIN" | null>(null);

  // Admin state
  const [movements, setMovements] = useState<MovementTypes[]>([]);
  const [toggleNewMovement, setToggleNewMovement] = useState(false);
  const [companies, setCompanies] = useState<
    { label: string; value: string }[]
  >([]);
  const [totalTeams, setTotalTeams] = useState<number | null>(null);
  const [companyCounts, setCompanyCounts] = useState<{ saude: number; dental: number }>({ saude: 0, dental: 0 });
  const [sortOrder, setSortOrder] = useState<SortOrder>("");
  const [sortDate, setSortDate] = useState<SortOrder>("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // User state
  const [userMovements, setUserMovements] = useState<UserMovementItem[]>([]);
  const [userFilterStatus, setUserFilterStatus] = useState("");

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConcluidos, setShowConcluidos] = useState(false);

  async function fetchAdminMovements(p: number) {
    const res = await api.get(`/movimentacao?page=${p}`);
    setMovements(res.data?.content ?? res.data ?? []);
    setTotalPages(res.data?.totalPages ?? 0);
  }

  async function fetchUserMovements() {
    const res = await api.get("/movimentacao/user");
    setUserMovements(res.data ?? []);
  }

  useEffect(() => {
    verifyConnected(window.location.href);

    async function load() {
      const r = (await getUserRole()) as "USER" | "ADMIN";
      setRole(r);
      setIsLoading(true);
      try {
        if (r === "ADMIN") {
          await Promise.all([
            fetchAdminMovements(0),
            api.get("/empresas").then((res) => {
              const data: any[] = res.data ?? [];
              setCompanies(data.map((c) => ({ label: c.nome, value: c.idEmpresa })));
              setCompanyCounts({
                saude: data.filter((c) => c.modalidade?.toUpperCase() === "SAUDE").length,
                dental: data.filter((c) => c.modalidade?.toUpperCase() === "DENTAL").length,
              });
            }),
            api.get("/equipes").then((res) =>
              setTotalTeams(
                Array.isArray(res.data) ? res.data.length : (res.data?.totalElements ?? res.data?.content?.length ?? 0),
              ),
            ).catch(() => setTotalTeams(0)),
          ]);
        } else {
          await Promise.all([
            fetchUserMovements(),
            api.get("/empresas/user").then((res) => {
              const data: any[] = res.data ?? [];
              setCompanies(data.map((c) => ({ label: c.nome, value: c.idEmpresa })));
              setCompanyCounts({
                saude: data.filter((c) => c.modalidade?.toUpperCase() === "SAUDE").length,
                dental: data.filter((c) => c.modalidade?.toUpperCase() === "DENTAL").length,
              });
            }),
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

  async function handleAdminPageChange(p: number) {
    setPage(p);
    setIsLoading(true);
    try {
      await fetchAdminMovements(p);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

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
      const status = resolveMovementStatus(m.beneficiariosMovimentacao);
      const matchSearch =
        !q ||
        m.nomeEmpresa.toLowerCase().includes(q) ||
        m.beneficiariosMovimentacao.some((b) =>
          b.nome.toLowerCase().includes(q),
        );
      const matchStatus = filterStatus
        ? status === filterStatus
        : status !== "concluido";
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

  const concludedAdmin = useMemo(() => {
    const q = search.toLowerCase();
    return movements.filter((m) => {
      const matchSearch =
        !q ||
        m.nomeEmpresa.toLowerCase().includes(q) ||
        m.beneficiariosMovimentacao.some((b) =>
          b.nome.toLowerCase().includes(q),
        );
      return (
        resolveMovementStatus(m.beneficiariosMovimentacao) === "concluido" &&
        matchSearch
      );
    });
  }, [movements, search]);

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
    return userMovements.filter((m) => {
      const isConcluido = m.status?.toUpperCase() === "CONCLUIDO";
      const matchSearch =
        !q ||
        m.nomeEmpresa.toLowerCase().includes(q) ||
        m.nomeBeneficiario.toLowerCase().includes(q);
      const matchStatus = userFilterStatus
        ? m.status?.toUpperCase() === userFilterStatus
        : !isConcluido;
      return matchSearch && matchStatus;
    });
  }, [userMovements, search, userFilterStatus]);

  const concludedUser = useMemo(() => {
    const q = search.toLowerCase();
    return userMovements.filter((m) => {
      const matchSearch =
        !q ||
        m.nomeEmpresa.toLowerCase().includes(q) ||
        m.nomeBeneficiario.toLowerCase().includes(q);
      return m.status?.toUpperCase() === "CONCLUIDO" && matchSearch;
    });
  }, [userMovements, search]);

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
              fetchAdminMovements(page);
            } else {
              fetchUserMovements();
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

        <div className={`grid gap-4 grid-cols-2 ${role === "ADMIN" ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 flex items-center gap-4 hover:shadow-sm/20 transition-shadow">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
              <Building2 className="h-5 w-5 text-(--azul)" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Empresas</p>
              <p className="text-2xl font-bold text-(--black)">
                {isLoading ? "—" : companies.length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 shadow-red-300 shadow-sm p-4 sm:p-5 flex items-center gap-4 hover:shadow-md/100 transition-shadow">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-red-100">
              <Building2 className="h-5 w-5 text-(--azul)" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-red-600">Saúde</p>
              <p className="text-2xl font-bold text-red-800">
                {isLoading ? "—" : companyCounts.saude}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 shadow-blue-300 shadow-sm p-4 sm:p-5 flex items-center gap-4 hover:shadow-md/100 transition-all">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-600">Dental</p>
              <p className="text-2xl font-bold text-blue-800">
                {isLoading ? "—" : companyCounts.dental}
              </p>
            </div>
          </div>

          {role === "ADMIN" && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 flex items-center gap-4 hover:shadow-md/20 transition-shadow">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100">
                <UsersRound className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Equipes ativas</p>
                <p className="text-2xl font-bold text-(--black)">
                  {isLoading ? "—" : (totalTeams ?? "—")}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 flex items-center gap-4 hover:shadow-md/20 transition-shadow">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 border border-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Concluídas</p>
              <p className="text-2xl font-bold text-(--black)">
                {isLoading ? "—" : (role === "ADMIN" ? concludedAdmin.length : concludedUser.length)}
              </p>
            </div>
          </div>
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
        {!isLoading && (filterStatus === "concluido" || userFilterStatus === "CONCLUIDO") && (
          <p className="text-sm text-gray-500 italic -mb-2">
            Exibindo apenas movimentações concluídas.
          </p>
        )}
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
            <div className="space-y-4">
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
            </div>
          )
        ) : filteredAdmin.length === 0 ? (
          <p className="text-center text-2xl italic opacity-60">
            {hasFilters
              ? "Nenhuma movimentação encontrada"
              : "Não há movimentações realizadas"}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAdmin.map((movement, i) => (
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
            </div>
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={handleAdminPageChange}
              />
            )}
          </div>
        )}
        {/* ── Concluídos ── */}
        {!isLoading &&
          filterStatus !== "concluido" &&
          userFilterStatus !== "CONCLUIDO" && (
            (() => {
              const list = role === "USER" ? concludedUser : concludedAdmin;
              if (list.length === 0) return null;
              return (
                <div className="rounded-2xl border border-green-200 bg-green-50 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowConcluidos((p) => !p)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      <span className="font-semibold text-green-800">
                        Concluídos
                      </span>
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-white px-2 py-0.5 text-xs font-semibold text-green-700">
                        {list.length}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-green-600 transition-transform duration-200 ${showConcluidos ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showConcluidos && (
                    <div className="border-t border-green-200 p-4 sm:p-5">
                      {role === "USER" ? (
                        <ul className="grid gap-2">
                          {(list as typeof concludedUser).map((m) => {
                            const tipo = tipoMap[m.tipoMovimentacao?.toUpperCase()] ?? null;
                            return (
                              <li key={`${m.idMovimentacao}-${m.nomeBeneficiario}`}>
                                <Link
                                  href={`/beneficiarios/${m.idBeneficiario}`}
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md border border-green-200 bg-white px-3 py-3 hover:border-green-300 hover:bg-green-50 transition-all duration-100"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    {tipo && (
                                      <div className={`shrink-0 ${tipo.className}`}>
                                        <tipo.Icon className="h-4 w-4" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm truncate">{m.nomeBeneficiario}</p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {tipo?.label}{m.nomeEmpresa && <> &middot; {m.nomeEmpresa}</>}
                                      </p>
                                      <p className="text-xs text-gray-400">{parseDate(m.dataMovimentacao)}</p>
                                    </div>
                                  </div>
                                  <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 shrink-0">
                                    Concluído
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(list as typeof concludedAdmin).map((movement, i) => (
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
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          )}
      </div>
    </div>
  );
}
