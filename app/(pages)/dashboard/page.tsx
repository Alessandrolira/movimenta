"use client";

import { MovementCard } from "@/app/components/MovementCard/MovementCard";
import { MovementTypes } from "@/app/types/MovementTypes";
import { Clock, Files, Layers, Plus } from "lucide-react";
import StatCard from "@/app/components/StatCard/StatCard";
import { useEffect } from "react";


export default function Page() {
  const api = process.env.NEXT_PUBLIC_API_JAVA || "";
  const stats = [
    { label: "Total", value: 0, icon: Files, color: "gray-icon" },
    { label: "Pendentes", value: 0, icon: Layers, color: "orange-icon" },
    { label: "Em Análise", value: 0, icon: Clock, color: "blue-icon" },
    { label: "Concluídos", value: 0, icon: Files, color: "green-icon" },
  ];

  useEffect(() => {
    async function getEquipes() {
      const res = await fetch(`${api}/equipes`, {
        method: "GET"
      }) 
      const data = await res;
      console.log(data)
    }
    getEquipes();
  }, [])

  const movements: MovementTypes[] = [
    {
      id: "1",
      tipo: "inclusao",
      beneficiario: "Maria Silva",
      data: "2026-03-08",
      status: "pendente",
      descricao: "Inclusão de dependente - cônjuge",
    },
    {
      id: "2",
      tipo: "exclusao",
      beneficiario: "João Santos",
      data: "2026-03-05",
      status: "em_analise",
      descricao: "Exclusão por desligamento",
    },
    {
      id: "3",
      tipo: "alteracao",
      beneficiario: "Ana Oliveira",
      data: "2026-03-01",
      status: "concluido",
      descricao: "Alteração de plano - upgrade",
    },
    {
      id: "4",
      tipo: "inclusao",
      beneficiario: "Carlos Souza",
      data: "2026-02-28",
      status: "concluido",
      descricao: "Inclusão de novo titular",
    },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Olá, (Cliente)</h1>
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
        <h2 className="text-2xl font-semibold tracking-wide ">Movimentações</h2>
        <button className="flex gap-2 bg-(--blue-button) p-2 text-white cursor-pointer rounded-lg hover:bg-(--azul) active:scale-95 transition duration-100">
          <Plus className="scale-70" />
          <p className="hidden lg:block">Nova Movimentação</p>
        </button>
      </div>
      {movements.map((movement, i) => (
        <MovementCard
          key={i}
          id={movement.id}
          tipo={movement.tipo}
          beneficiario={movement.beneficiario}
          data={movement.data}
          descricao={movement.descricao}
          status={movement.status}
        />
      ))}
    </div>
  );
}
