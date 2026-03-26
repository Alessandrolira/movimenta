"use client";

import { CompanyCard } from "@/app/components/CompanyCard/CompanyCard";
import { CompanyTypes } from "@/app/types/CompanyTypes";
import { api } from "@/services/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [companies, setCompanies] = useState<CompanyTypes[]>([]);

  useEffect(() => {
    async function getCompanies() {
      try {
        const res = await api.get("/empresas");
        console.log(res);
        setCompanies(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    getCompanies();
  }, []);

  console.log(companies);

  return (
    <div className="space-y-6 p-8">
      <h1 className="font-bold text-2xl">EMPRESAS</h1>
      <div className=" grid grid-cols gap-8 w-full md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {companies.map((company, index) => (
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
    </div>
  );
}
