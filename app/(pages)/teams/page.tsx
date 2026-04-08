"use client";

import { TeamCard } from "@/app/components/TeamCard/TeamCard";
import { Input } from "@/app/components/ui/Input/Input";
import { TeamsTypes } from "@/app/types/TeamsTypes";
import { api } from "@/services/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [teams, setTeams] = useState<TeamsTypes[]>([]);

  useEffect(() => {
    getEquipes();
  }, []);

  async function getEquipes() {
    try {
      const res = await api.get("/equipes");
      if (res.status === 200) {
        setTeams(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="font-bold text-2xl">Equipes: {teams.length}</h1>
      {teams.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-wide">
              Lista de Equipes
            </h2>
            <div>
              <Input
                id="search-team"
                type="text"
                placeholder="Bscar por nome ou analista"
              />
            </div>
          </div>
          <div className="grid gap-6 sm:gap-8 w-full sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teams.map((team, i) => (
              <TeamCard
                key={i}
                id={team.id}
                nome={team.nome}
                analistas={team.nomeAnalista}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <p className="font-bold italic text-(--cinza)">
            Nenhuma equipe encontrada
          </p>
        </div>
      )}
    </div>
  );
}
