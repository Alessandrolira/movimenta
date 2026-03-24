export function parseText(text: string | undefined) {
  if (!text) return text;

  if (text.length > 16) {
    return text.substring(0, 16) + "...";
  }
  return text;
}

export function formatCPF(cpf: string) {
  const cleanedCPF = cpf.replace(/\D/g, ""); // Remove non-digit characters
  if (cleanedCPF.length !== 11) {
    return cpf; // Return original if not 11 digits
  }
  return cleanedCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
