export type AcessoType = {
  idUsuario: string;
  email: string;
  status: string;
};

export type CompanyMovimentacaoType = {
  idBeneficiario: string;
  nome: string;
  tipoMovimentacao: string;
  descricao: string;
  status: string;
  dadosComplementares?: {
    documentosEmpresa?: string[];
    documentosBeneficiario?: string[];
  };
};

export type CompanyTypes = {
  idEmpresa: string;
  nome: string;
  cnpj: string;
  modalidade: string;
  operadora: string;
  qtdVidasAtivas: number;
  acessos: AcessoType[];
  nomeEquipeResponsavel: string;
  movimentacoes?: CompanyMovimentacaoType[];
};
