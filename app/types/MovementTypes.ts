export type MovementTypes = {
  id: string;
  tipo: "inclusao" | "exclusao" | "alteracao" | "segunda-via";
  beneficiario: string;
  data: string;
  status: "pendente" | "em_analise" | "concluido";
  descricao: string;
  arquivos?: string[];
}