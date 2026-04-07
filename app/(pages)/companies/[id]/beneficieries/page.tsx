"use client";

import { api } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  Heart,
} from "lucide-react";
import StatCard from "@/app/components/StatCard/StatCard";
import { Input } from "@/app/components/ui/Input/Input";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import { parseDate } from "@/app/utils/format";
import Link from "next/link";

type BeneficiarioItem = {
  idBeneficiario: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  dependencia: "TITULAR" | "CONJUGE" | "FILHO" | "AGREGADO";
  planoAtual: string;
  status: string;
  tipoMovimentacao: string;
};

const dependenciaMap: Record<string, { label: string; className: string }> = {
  TITULAR: {
    label: "Titular",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  CONJUGE: {
    label: "Cônjuge",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  FILHO: {
    label: "Filho(a)",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  AGREGADO: {
    label: "Agregado",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

const statusMap: Record<string, { label: string; className: string }> = {
  PENDENTE: {
    label: "Pendente",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  ANALISE: {
    label: "Análise",
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
  ATIVO: {
    label: "Ativo",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  INATIVO: {
    label: "Inativo",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function Page() {
  const params = useParams();
  const idEmpresa = Array.isArray(params.id) ? params.id[0] : params.id;

  const [beneficiarios, setBeneficiarios] = useState<BeneficiarioItem[]>([]);
  const [nomeEmpresa, setNomeEmpresa] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dependenciaFilter, setDependenciaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [benRes, empRes] = await Promise.all([
          api.get(`/beneficiarios/empresa/${idEmpresa}`),
          api.get(`/empresas/${idEmpresa}`),
        ]);
        setBeneficiarios(benRes.data || []);
        setNomeEmpresa(empRes.data?.nome ?? "");
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [idEmpresa]);

  const stats = useMemo(
    () => [
      {
        label: "Total",
        value: beneficiarios.length,
        icon: Users,
        color: "gray-icon",
      },
      {
        label: "Titulares",
        value: beneficiarios.filter((b) => b.dependencia === "TITULAR").length,
        icon: UserCheck,
        color: "blue-icon",
      },
      {
        label: "Dependentes",
        value: beneficiarios.filter((b) => b.dependencia !== "TITULAR").length,
        icon: Heart,
        color: "orange-icon",
      },
      {
        label: "Ativos",
        value: beneficiarios.filter(
          (b) => b.status?.toUpperCase() === "ATIVO" || b.status?.toUpperCase() === "CONCLUIDO",
        ).length,
        icon: UserCheck,
        color: "green-icon",
      },
    ],
    [beneficiarios],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return beneficiarios.filter((b) => {
      const matchSearch =
        !q ||
        b.nome.toLowerCase().includes(q) ||
        b.cpf.includes(q);
      const matchDep =
        !dependenciaFilter || b.dependencia === dependenciaFilter;
      const matchStatus =
        !statusFilter || b.status?.toUpperCase() === statusFilter;
      return matchSearch && matchDep && matchStatus;
    });
  }, [beneficiarios, search, dependenciaFilter, statusFilter]);

  const uniqueStatuses = useMemo(
    () => Array.from(new Set(beneficiarios.map((b) => b.status?.toUpperCase()).filter(Boolean))).sort(),
    [beneficiarios],
  );

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Hero card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Empresa
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold break-words">
            {nomeEmpresa || "Beneficiários"}
          </h1>
          <p className="opacity-60 text-sm sm:text-base">
            Lista de beneficiários cadastrados nesta empresa
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Lista */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-wide">Beneficiários</p>
            <p className="text-sm text-gray-500">
              {beneficiarios.length} beneficiário(s) cadastrado(s)
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
            <div className="[&_input]:pl-9">
              <Input
                id="search-benef"
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="sm:w-44">
              <CustomSelect
                id="filter-dep"
                label="Todas as dependências"
                value={dependenciaFilter}
                onChange={setDependenciaFilter}
                options={[
                  { label: "Todas as dependências", value: "" },
                  { label: "Titular", value: "TITULAR" },
                  { label: "Cônjuge", value: "CONJUGE" },
                  { label: "Filho(a)", value: "FILHO" },
                  { label: "Agregado", value: "AGREGADO" },
                ]}
              />
            </div>
            <div className="sm:w-44">
              <CustomSelect
                id="filter-status"
                label="Todos os status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: "Todos os status", value: "" },
                  ...uniqueStatuses.map((s) => ({
                    label: statusMap[s]?.label ?? s,
                    value: s,
                  })),
                ]}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-lg italic opacity-60 py-6">
            Carregando beneficiários...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-lg italic opacity-60 py-6">
            {search || dependenciaFilter || statusFilter
              ? "Nenhum beneficiário encontrado para os filtros aplicados."
              : "Nenhum beneficiário cadastrado nesta empresa."}
          </p>
        ) : (
          <ul className="grid gap-2">
            {filtered.map((b) => {
              const dep = dependenciaMap[b.dependencia] ?? {
                label: b.dependencia,
                className: "bg-gray-50 text-gray-700 border-gray-200",
              };
              const st = statusMap[b.status?.toUpperCase()] ?? {
                label: b.status,
                className: "bg-gray-50 text-gray-700 border-gray-200",
              };
              return (
                <li key={b.idBeneficiario}>
                  <Link
                    href={`/companies/${idEmpresa}/beneficieries/${b.idBeneficiario}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-gray-200 bg-(--light-gray) px-4 py-3 hover:border-gray-300 hover:bg-gray-100 transition-all duration-100 inset-shadow-sm"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-semibold text-sm truncate">{b.nome}</p>
                      <p className="text-xs text-gray-500">
                        CPF: {b.cpf}
                        {b.dataNascimento && (
                          <> &middot; Nasc.: {parseDate(b.dataNascimento)}</>
                        )}
                      </p>
                      {b.planoAtual && (
                        <p className="text-xs text-gray-500">
                          Plano: {b.planoAtual}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${dep.className}`}
                      >
                        {dep.label}
                      </span>
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
        )}
      </div>
    </div>
  );
}
