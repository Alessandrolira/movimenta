import { api } from "./api";

export default async function SendMovement(
  payload: Object,
  idEmpresa: string,
  observation: string,
) {
  console.log("PAYLOAD", payload);
  console.log("EMPRESA ID", idEmpresa);
  console.log("OBS", observation);
  try {
    const res = await api.post("/movimentacao", {
      idEmpresa: idEmpresa,
      observacao: observation,
      beneficiarios: payload,
    });
    return res.data;
  } catch (err) {
    console.error("ERRO AO ENVIAR A MOVIMENTAÇÃO", err);
  }
}
