"use client";

import { TeamCard } from "@/app/components/TeamCard/TeamCard";
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
        console.log(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="font-bold text-2xl">Equipes {teams.length}</h1>
      {teams.length > 0 ? (
        <div className="grid grid-cols gap-8 w-full md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teams.map((team, i) => (
            <TeamCard key={i} id={team.id} nome={team.nome} analistas={team.analistas}/>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <p className="font-bold italic text-(--cinza)">Nenhuma equipe encontrada</p>
        </div>
      )}
    </div>
  );
}
