"use client";

import { useEffect, useState } from "react";
import { X, ArrowRightLeft } from "lucide-react";
import { api } from "@/services/api";
import { TeamsTypes } from "@/app/types/TeamsTypes";
import { CustomSelect } from "@/app/components/ui/Select/Select";

interface TransferirAnalistaModalProps {
  idAnalista: string;
  idEquipeAtual: string;
  nomeAnalista: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferirAnalistaModal({
  idAnalista,
  idEquipeAtual,
  nomeAnalista,
  onClose,
  onSuccess,
}: TransferirAnalistaModalProps) {
  const [equipes, setEquipes] = useState<TeamsTypes[]>([]);
  const [idEquipeSelecionada, setIdEquipeSelecionada] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarEquipes() {
      setCarregando(true);
      try {
        const res = await api.get("/equipes");
        const outras = (res.data as TeamsTypes[]).filter(
          (e) => e.id !== idEquipeAtual,
        );
        setEquipes(outras);
      } catch {
        setErro("Nao foi possivel carregar as equipes.");
      } finally {
        setCarregando(false);
      }
    }
    carregarEquipes();
  }, [idEquipeAtual]);

  async function handleTransferir() {
    if (!idEquipeSelecionada) return;
    setSalvando(true);
    setErro("");
    try {
      await api.patch("/analista", {
        idAnalista,
        idEquipe: idEquipeSelecionada,
      });
      onSuccess();
      onClose();
    } catch {
      setErro("Erro ao transferir analista. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  const opcoes = equipes.map((e) => ({ label: e.nome, value: e.id }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-(--azul)" />
            <h2 className="text-lg font-semibold">Transferir analista</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">
            Selecione a equipe de destino para{" "}
            <span className="font-semibold text-gray-900">{nomeAnalista}</span>.
          </p>

          {carregando ? (
            <p className="text-sm italic text-gray-400">Carregando equipes...</p>
          ) : (
            <CustomSelect
              id="equipe-destino"
              label="Selecione uma equipe"
              options={opcoes}
              value={idEquipeSelecionada}
              onChange={setIdEquipeSelecionada}
            />
          )}

          {erro && <p className="text-sm text-red-600">{erro}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={salvando}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleTransferir}
            disabled={!idEquipeSelecionada || salvando}
            className="rounded-lg bg-(--azul) px-4 py-2 text-sm font-medium text-white hover:bg-(--blue-icon) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando ? "Transferindo..." : "Transferir"}
          </button>
        </div>
      </div>
    </div>
  );
}
