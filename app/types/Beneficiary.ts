
export type BeneficiaryTypes = {
  name: string;
  birth: Date;
  cpf: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
  dependency: "titular" | "conjuge" | "filho" | "agregado";
};
