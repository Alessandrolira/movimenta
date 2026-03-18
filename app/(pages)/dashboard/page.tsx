"use client";

import { MovementCard } from "@/app/components/MovementCard/MovementCard";
import { MovementTypes } from "@/app/types/MovementTypes";
import { Clock, Files, Layers, Plus } from "lucide-react";
import StatCard from "@/app/components/StatCard/StatCard";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { InternalAxiosRequestConfig } from "axios";
import { error } from "console";

export default function Page() {
  const stats = [
    { label: "Total", value: 0, icon: Files, color: "gray-icon" },
    { label: "Pendentes", value: 0, icon: Layers, color: "orange-icon" },
    { label: "Em Análise", value: 0, icon: Clock, color: "blue-icon" },
    { label: "Concluídos", value: 0, icon: Files, color: "green-icon" },
  ];
  const [equipes, setEquipes] = useState();
  const [movements, setMovements] = useState<MovementTypes[]>([]);

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
