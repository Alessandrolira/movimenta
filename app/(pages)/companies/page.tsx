"use client";

import { CompanyCard } from "@/app/components/CompanyCard/CompanyCard";

export default function Page() {
  const companies = [
    {
      id: "a1",
      name: "Casa das Alianças",
      people: 35,
      hi: "Amil",
    },
    {
      id: "a3",
      name: "Kim Alimentos",
      people: 237,
      hi: "Amil",
    },
    {
      id: "a2",
      name: "Suissa",
      people: 21,
      hi: "Amil",
    },
    {
      id: "a4",
      name: "Movimenta",
      people: 35,
      hi: "Amil",
    },
    {
      id: "a4",
      name: "Casa das Alianças",
      people: 35,
      hi: "Amil",
    },
    {
      id: "a4",
      name: "Casa das Alianças",
      people: 35,
      hi: "Amil",
    },
  ];
  return (
    <div className="space-y-6 p-8">
      <h1 className="font-bold text-2xl">EMPRESAS</h1>
      <div className=" grid grid-cols gap-8 w-full md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            name={company.name}
            people={company.people}
            hi={company.hi}
          />
        ))}
      </div>
    </div>
  );
}
