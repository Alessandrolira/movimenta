export type CompanyTypes = 
  {
    idEmpresa: string,
    nome: string,
    cnpj: string,
    modalidade: string,
    operadora: string,
    qtdVidasAtivas: number,
    acessos: [
      string
    ],
    nomeEquipeResponsavel: string
  }