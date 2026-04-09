export type AcessoType = {
  idUsuario: string;
  email: string;
  status: string;
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
};
