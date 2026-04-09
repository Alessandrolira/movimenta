export type BeneficiaryTypes = {
  nome: string;
  dataNascimento: string;
  cpf: string;
  endereco: Endereco;
  nomeTitular: string;
  dadosComplementares: Documentos;
  planoAtual: string;
  dependencia: "TITULAR" | "CONJUGE" | "FILHO" | "AGREGADO";
  tipoMovimentacao:
    | "INCLUSAO"
    | "EXCLUSAO"
    | "ALTERACAO_DE_DADOS_CADASTRAIS"
    | "SEGUNDA_VIA_CARTEIRINHA";
  status: "PENDENTE" | "ANALISE" | "ENVIADO_OPERADORA" | "PENDENTE_OPERADORA" | "DECLINIO" | "CONCLUIDO";
  observacao: string
};

type Endereco = {
  logradouro: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
};

type Documentos = {
  documentosBeneficiario: string[];
  documentosEmpresa: string[];
};
