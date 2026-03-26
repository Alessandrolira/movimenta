import { BeneficiaryTypes } from "@/app/types/Beneficiary";

export type MovementTypes = {
  id: string;
  empresa: string;
  beneficiario: BeneficiaryTypes;
  data: string;
  status: "pendente" | "em_analise" | "concluido";
  descricao: string;
  arquivos?: string[];
}