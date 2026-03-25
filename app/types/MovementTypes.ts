import { BeneficiaryTypes } from "./Beneficiary";

export type MovementTypes = {
  id: string;
  tipo: "inclusao" | "exclusao" | "alteracao" | "segunda-via";
  empresa: string;
  beneficiario: BeneficiaryTypes;
  data: string;
  status: "pendente" | "em_analise" | "concluido";
  descricao: string;
  arquivos?: string[];
}