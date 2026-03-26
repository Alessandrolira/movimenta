"use client";

import { CompanyTypes } from "@/app/types/CompanyTypes";
import { parseCnpj } from "@/app/utils/format";
import { api } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, Files, Layers, Plus } from "lucide-react";
import StatCard from "@/app/components/StatCard/StatCard";
import { DadosGeraisType } from "@/app/types/DadosGeraisType";

export default function Page() {
  const params = useParams();
  const idEmpresa = params.id;

  const [company, setCompany] = useState<CompanyTypes>();
  const [dadosGerais, setDadosGerais] = useState<DadosGeraisType>();

  useEffect(() => {
    async function getDadosGerais() {
      try {
        const res = await api.get(`/empresas/dadosGerais/${idEmpresa}`);
        console.log(res);
        setDadosGerais(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    getDadosGerais();

    async function getCompanies() {
      try {
        const res = await api.get(`/empresas/${idEmpresa}`);
        console.log(res);
        setCompany(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    getCompanies();
  }, []);

  const stats = [
    {
      label: "Total",
      value: dadosGerais?.totalMovimentacao,
      icon: Files,
      color: "gray-icon",
    },
    {
      label: "Pendentes",
      value: dadosGerais?.totalMovimentacaoPendente,
      icon: Layers,
      color: "orange-icon",
    },
    {
      label: "Em Análise",
      value: dadosGerais?.totalMovimentacaoAnalise,
      icon: Clock,
      color: "blue-icon",
    },
    {
      label: "Concluídos",
      value: dadosGerais?.totalMovimentacaoConcluida,
      icon: Files,
      color: "green-icon",
    },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{company?.nome}</h1>
        <p className="opacity-60">{parseCnpj(company?.cnpj)}</p>
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
    </div>
  );
}
