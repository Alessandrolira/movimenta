"use client";

import { TeamCard } from "@/app/components/TeamCard/TeamCard";
import { Input } from "@/app/components/ui/Input/Input";
import { TeamsTypes } from "@/app/types/TeamsTypes";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

export default function Page() {
  const [teams, setTeams] = useState<TeamsTypes[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nomeEquipe, setNomeEquipe] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEquipes();
  }, []);

  async function getEquipes() {
    try {
      const res = await api.get("/equipes");
      if (res.status === 200) setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateEquipe(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nomeEquipe.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await api.post("/equipes", { nome: nomeEquipe.trim() });
      setTeams((prev) => [...prev, { id: res.data.id, nome: res.data.nome, nomeAnalista: [] }]);
      setShowModal(false);
      setNomeEquipe("");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao criar equipe. Tente novamente.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">Equipes: {teams.length}</h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-(--azul) hover:bg-(--blue-icon) text-white rounded-lg py-2 px-4 flex items-center gap-2 transition-all duration-100 active:scale-95 text-sm"
        >
          <Plus size={16} />
          Criar equipe
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold">Criar equipe</h2>
              <button
                type="button"
                onClick={() => { setShowModal(false); setNomeEquipe(""); setError(null); }}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateEquipe} className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="nome-equipe">
                  Nome da equipe <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nome-equipe"
                  type="text"
                  placeholder="Ex: Equipe Alpha"
                  value={nomeEquipe}
                  onChange={(e) => setNomeEquipe(e.target.value)}
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setNomeEquipe(""); setError(null); }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !nomeEquipe.trim()}
                  className="rounded-lg bg-(--azul) px-4 py-2 text-sm font-medium text-white hover:bg-(--blue-icon) transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? "Criando..." : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                placeholder="Buscar por nome ou analista"
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
