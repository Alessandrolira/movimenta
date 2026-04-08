import { api } from "./api";

export default async function SendMovement(
  payload: Object,
  idEmpresa: string,
  observation: string,
) {
  const res = await api.post("/movimentacao", {
    idEmpresa: idEmpresa,
    observacao: observation,
    beneficiarios: payload,
  });
  console.log(res);
  return res;
}
