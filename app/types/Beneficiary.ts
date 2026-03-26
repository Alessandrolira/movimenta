export type BeneficiaryTypes = {
  nome: string;
  dataNascimento: string;
  cpf: string;
  endereco: Endereco;
  nomeTitular: string;
  dadosComplementares: Documentos;
  plano: string;
  dependencia: "TITULAR" | "CONJUGE" | "FILHO" | "AGREGADO";
  tipo:
    | "INCLUSAO"
    | "EXCLUSAO"
    | "ALTERACAO_DE_DADOS_CADASTRAIS"
    | "SEGUNDA_VIA_CARTEIRINHA";
};

type Endereco = {
  logradouro: string;
  numero: number;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
};

type Documentos = {
  documentosBeneficiario: string[];
  documentoContratacao: string;
};
