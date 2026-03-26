"use client";

import { TeamCard } from "@/app/components/TeamCard/TeamCard";
import { api } from "@/services/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [teams, setTeams] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    getEquipes();
  }, []);

  async function getEquipes() {
    try {
      const res = await api.get("/equipes");
      setTeams(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <h1>Equipes {teams.length}</h1>
      {teams.length > 0 ? (
        <div className="grid grid-cols-3">
          {teams.map((team) => (
            <TeamCard id={team.id} nome={team.nome} />
          ))}
        </div>
      ) : (
        <p>Nenhum equipe encontrada</p>
      )}
    </div>
  );
}
