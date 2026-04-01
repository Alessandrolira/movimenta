export function parseDate(date: string | number[]): string {
  if (Array.isArray(date)) {
    const [year, month, day, hour, minute] = date;
    return new Date(year, month - 1, day, hour, minute).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return String(date);
  return parsed.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function resolveMovementStatus(
  beneficiarios: { status: string }[],
): "pendente" | "em_analise" | "concluido" {
  if (beneficiarios.length === 0) return "pendente";
  const statuses = beneficiarios.map((b) => b.status?.toLowerCase());
  if (statuses.some((s) => s === "pendente")) return "pendente";
  if (statuses.every((s) => s === "concluido")) return "concluido";
  return "em_analise";
}

export function parseText(text: string) {
  if (text.length > 16) {
    return text.substring(0, 16) + "...";
  }
  return text;
}

export function parseCnpj(cnpj: string) {
  cnpj = cnpj.replace(/\D/g, "");

  if (cnpj.length !== 14) {
    return cnpj;
  }

  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}
export const formatCPF = (value: string) => {
  value = value.replace(/\D/g, ""); // Remove tudo que não é número
  value = value.replace(/^(\d{3})(\d)/, "$1.$2");
  value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/\.(\d{3})(\d)/, ".$1-$2");
  return value.substring(0, 14); // Garante que não passe do limite
};

export const formatCEP = (value: string) => {
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{5})(\d)/, "$1-$2");
  return value.substring(0, 9);
};
