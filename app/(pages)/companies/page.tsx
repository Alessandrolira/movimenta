"use client";

import { CompanyCard } from "@/app/components/CompanyCard/CompanyCard";
import StatCard from "@/app/components/StatCard/StatCard";
import { CompanyTypes } from "@/app/types/CompanyTypes";
import { api } from "@/services/api";
import { Building2, IdCard, ShieldCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseCnpj } from "@/app/utils/format";
import { CustomSelect } from "@/app/components/ui/Select/Select";

export default function Page() {
  const [companies, setCompanies] = useState<CompanyTypes[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [modalidadeFilter, setModalidadeFilter] = useState<"" | "SAUDE" | "DENTAL">("");
  const [operadoraFilter, setOperadoraFilter] = useState<string>("");

  useEffect(() => {
    async function getCompanies() {
      try {
        setIsLoading(true);
        const res = await api.get("/empresas");
        console.log(res);
        setCompanies(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    getCompanies();
  }, []);

  const stats = useMemo(() => {
    const { totalVidas, vidasSaude, vidasOdonto } = companies.reduce(
      (acc, company) => {
        const vidas = company.qtdVidasAtivas || 0;

        acc.totalVidas += vidas;
        if (company.modalidade === "SAUDE") {
          acc.vidasSaude += vidas;
        } else if (company.modalidade === "DENTAL") {
          acc.vidasOdonto += vidas;
        }

        return acc;
      },
      { totalVidas: 0, vidasSaude: 0, vidasOdonto: 0 },
    );

    return [
      {
        label: "Empresas",
        value: companies.length,
        icon: Building2,
        color: "gray-icon",
      },
      {
        label: "Vidas Ativas",
        value: totalVidas,
        icon: Users,
        color: "blue-icon",
      },
      {
        label: "Vidas Odonto",
        value: vidasOdonto,
        icon: IdCard,
        color: "orange-icon",
      },
      {
        label: "Vidas Saúde",
        value: vidasSaude,
        icon: ShieldCheck,
        color: "green-icon",
      },
    ];
  }, [companies]);

  const operadoraOptions = useMemo(
    () =>
      Array.from(new Set(companies.map((company) => company.operadora)))
        .filter(Boolean)
        .sort(),
    [companies],
  );

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return companies.filter((company) => {
      const normalizedName = company.nome.toLowerCase();
      const normalizedCnpj = parseCnpj(company.cnpj).toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        normalizedName.includes(normalizedSearch) ||
        normalizedCnpj.includes(normalizedSearch);

      const matchesModalidade =
        !modalidadeFilter || company.modalidade === modalidadeFilter;

      const matchesOperadora =
        !operadoraFilter || company.operadora === operadoraFilter;

      return matchesSearch && matchesModalidade && matchesOperadora;
    });
  }, [companies, search, modalidadeFilter, operadoraFilter]);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Empresas</h1>
        <h2 className="opacity-60">
          Consulte as empresas e acompanhe rapidamente os dados principais.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-6">
        <div className="space-y-3">
          <h3 className="text-xl sm:text-2xl font-semibold tracking-wide">
            Lista de empresas
          </h3>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou CNPJ"
              className="w-full md:max-w-xs border border-gray-300 rounded-lg bg-white p-2 shadow-md transition-all duration-100 focus:ring-2 focus:ring-(--azul) focus:outline-none"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 w-full md:w-auto">
              <CustomSelect
                id="filter-modalidade"
                label="Todas as modalidades"
                value={modalidadeFilter}
                onChange={(value) =>
                  setModalidadeFilter(value as "" | "SAUDE" | "DENTAL")
                }
                options={[
                  { label: "Todas as modalidades", value: "" },
                  { label: "Saúde", value: "SAUDE" },
                  { label: "Dental", value: "DENTAL" },
                ]}
              />
              <CustomSelect
                id="filter-operadora"
                label="Todas as operadoras"
                value={operadoraFilter}
                onChange={setOperadoraFilter}
                options={[
                  { label: "Todas as operadoras", value: "" },
                  ...operadoraOptions.map((operadora) => ({
                    label: operadora,
                    value: operadora,
                  })),
                ]}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-xl italic opacity-60 py-8">
            Carregando empresas...
          </p>
        ) : filteredCompanies.length === 0 ? (
          <p className="text-center text-xl italic opacity-60 py-8">
            Nenhuma empresa encontrada para a busca informada.
          </p>
        ) : (
          <div className="grid gap-6 sm:gap-8 w-full sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCompanies.map((company, index) => (
              <CompanyCard
                key={index}
                idEmpresa={company.idEmpresa}
                nome={company.nome}
                cnpj={company.cnpj}
                modalidade={company.modalidade}
                operadora={company.operadora}
                qtdVidasAtivas={company.qtdVidasAtivas}
                acessos={company.acessos}
                nomeEquipeResponsavel={company.nomeEquipeResponsavel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
