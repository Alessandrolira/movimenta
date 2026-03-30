import { AnalistsTypes } from "./AnalistsTypes";
import { CompanyTypes } from "./CompanyTypes";

export type dadosEquipeType = {
  nomeEquipe: string;
  numeroVidasAtivas: number;
  numeroDeMovimentacoesFinalizadas: number;
  analistas: AnalistsTypes[];
  empresasAtribuida: CompanyTypes[];
};
