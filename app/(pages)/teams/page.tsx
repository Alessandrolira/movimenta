"use client";

import { api } from "@/services/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [teams, setTeams] = useState<{ id: string, nome: string}[]>([]);

  useEffect(() => {
    getEquipes();
  }, []);

  async function getEquipes() {
    try {
      const res = await api.get("/equipes");
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 p-8">
        <h1>Times {teams.length}</h1>
    </div>
  );
}
