"use client";

import { MovementTypes } from "@/app/types/MovementTypes";
import {
  Clock,
  Files,
  Layers,
  Plus,
  Search,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
} from "lucide-react";
import { Input } from "@/app/components/ui/Input/Input";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import StatCard from "@/app/components/StatCard/StatCard";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import NewMovementCard from "@/app/components/NewMovementCard/NewMovementCard";
import { verifyConnected } from "@/app/utils/verifyConnected";
import { MovementParentCard } from "@/app/components/MovementCard/MovementParentCard";
import { resolveMovementStatus } from "@/app/utils/format";

type SortOrder = "asc" | "desc" | "";
type StatusFilter = "pendente" | "em_analise" | "concluido" | "";

export default function Page() {
  const [movements, setMovements] = useState<MovementTypes[]>([]);
  const [toggleNewMovement, setToggleNewMovement] = useState<boolean>(false);
  const [companies, setCompanies] = useState<
    { label: string; value: string }[]
  >([]);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("");
  const [sortDate, setSortDate] = useState<SortOrder>("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("");

  const stats = [
    { label: "Total", value: movements.length, icon: Files, color: "gray-icon" },
    {
      label: "Pendentes",
      value: movements.filter((m) => resolveMovementStatus(m.beneficiariosMovimentacao) === "pendente").length,
      icon: Layers,
      color: "orange-icon",
    },
    {
      label: "Em Análise",
      value: movements.filter((m) => resolveMovementStatus(m.beneficiariosMovimentacao) === "em_analise").length,
      icon: Clock,
      color: "blue-icon",
    },
    {
      label: "Concluídos",
      value: movements.filter((m) => resolveMovementStatus(m.beneficiariosMovimentacao) === "concluido").length,
      icon: Files,
      color: "green-icon",
    },
  ];

  const filteredMovements = useMemo(() => {
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

  async function getCompanies() {
    try {
      const res = await api.get("/empresas");
      setCompanies(
        res.data.map((company: any) => ({
          label: company.nome,
          value: company.idEmpresa,
        })),
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function getMoviments() {
    try {
      const res = await api.get("/movimentacao");
      setMovements(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    verifyConnected(window.location.href);
    getMoviments();
    getCompanies();
  }, []);

  const hasFilters = search || sortOrder || sortDate || filterStatus;

  return (
    <div className="relative">
      {toggleNewMovement && (
        <NewMovementCard
          companies={companies}
          onClick={() => setToggleNewMovement(false)}
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
          <button
            onClick={() => setToggleNewMovement(true)}
            className="flex gap-2 bg-(--blue-button) p-2 text-white cursor-pointer rounded-lg hover:bg-(--azul) active:scale-95 transition duration-100"
          >
            <Plus className="scale-70" />
            <p className="hidden lg:block">Nova Movimentação</p>
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-3">
          {/* Linha 1: busca (largura total) */}
          <div className="relative w-full focus-within:scale-100">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
            <div className="[&_input]:pl-9">
              <Input
                id="search"
                type="text"
                placeholder="Buscar por empresa ou beneficiário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Linha 2: A-Z | data | status — empilha no mobile */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-3">
            {/* Ordenação A-Z */}
            <button
              onClick={() =>
                setSortOrder((prev) =>
                  prev === "asc" ? "desc" : prev === "desc" ? "" : "asc",
                )
              }
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition cursor-pointer whitespace-nowrap
                ${sortOrder ? "border-(--blue-icon) bg-(--blue-icon)/10 text-(--azul)" : "border-gray-200 bg-white text-gray-600 hover:border-(--blue-icon)"}`}
            >
              {sortOrder === "desc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
              {sortOrder === "asc" ? "A → Z" : sortOrder === "desc" ? "Z → A" : "A - Z"}
            </button>

            {/* Ordenação por data */}
            <button
              onClick={() =>
                setSortDate((prev) =>
                  prev === "desc" ? "asc" : prev === "asc" ? "" : "desc",
                )
              }
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition cursor-pointer whitespace-nowrap
                ${sortDate ? "border-(--blue-icon) bg-(--blue-icon)/10 text-(--azul)" : "border-gray-200 bg-white text-gray-600 hover:border-(--blue-icon)"}`}
            >
              {sortDate === "asc" ? (
                <ArrowUpNarrowWide className="h-4 w-4" />
              ) : (
                <ArrowDownNarrowWide className="h-4 w-4" />
              )}
              {sortDate === "desc" ? "Mais recente" : sortDate === "asc" ? "Mais antiga" : "Data"}
            </button>

            {/* Filtro de status — ocupa as 2 colunas no mobile */}
            <div className="col-span-2 sm:col-span-1 sm:w-48">
              <CustomSelect
                id="filterStatus"
                label="Todos os status"
                value={filterStatus}
                onChange={(val) => setFilterStatus(val as StatusFilter)}
                options={[
                  { label: "Todos os status", value: ""          },
                  { label: "Pendente",        value: "pendente"  },
                  { label: "Em Análise",      value: "em_analise"},
                  { label: "Concluído",       value: "concluido" },
                ]}
              />
            </div>
          </div>
        </div>

        {filteredMovements.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMovements.map((movement, i) => (
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
        ) : (
          <p className="text-center text-2xl italic opacity-60">
            {hasFilters
              ? "Nenhuma movimentação encontrada"
              : "Não há movimentações realizadas"}
          </p>
        )}
      </div>
    </div>
  );
}
