import { CheckCircle2, Plus, UserPlus, Users, X, AlertCircle, Download, Upload, FileSpreadsheet } from "lucide-react";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import { Input } from "@/app/components/ui/Input/Input";
import { useRef, useState } from "react";
import Beneficiary from "@/app/components/Beneficiary/Beneficiary";
import { Label } from "../ui/Label/Label";
import { BeneficiaryTypes } from "@/app/types/BeneficiaryTypes";
import { api } from "@/services/api";
import SendMovement from "@/services/sendMovement";
import { onlyDigits } from "@/app/utils/format";
import { downloadModeloSheet, parseMovimentacaoSheet } from "@/app/utils/movimentacaoSheet";

interface NewMovementProps {
  companies: { label: string; value: string }[];
  onClick: () => void;
  onSuccess?: () => void;
  defaultCompany?: string;
}

export default function NewMovementCard({
  onClick,
  companies,
  onSuccess,
  defaultCompany,
}: NewMovementProps) {
  const [companySelect, setCompanySelect] = useState(defaultCompany ?? "Seleciona a empresa");
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryTypes[]>([]);
  const [beneficiaryFiles, setBeneficiaryFiles] = useState<
    { vinculo: File | null; pessoais: File[] }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [beneficiaryErrors, setBeneficiaryErrors] = useState<Record<number, Record<string, string>>>({});
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setError(null);
    try {
      const imported = await parseMovimentacaoSheet(file);
      setBeneficiaries(imported);
      setBeneficiaryFiles(imported.map(() => ({ vinculo: null, pessoais: [] })));
    } catch (err: any) {
      setError(err?.message ?? "Erro ao importar a planilha.");
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const addBenef = () => {
    const newBenef: BeneficiaryTypes = {
      nome: "",
      dataNascimento: "",
      cpf: "",
      endereco: {
        logradouro: "",
        numero: "0",
        cep: "",
        bairro: "",
        cidade: "",
        estado: "",
        complemento: "",
      },
      dependencia: "TITULAR",
      dadosComplementares: {
        documentosBeneficiario: [],
        documentosEmpresa: [],
      },
      nomeTitular: "",
      planoAtual: "",
      observacao: "",
      tipoMovimentacao: "INCLUSAO",
      status: "PENDENTE",
    };

    setBeneficiaries([...beneficiaries, newBenef]);
    setBeneficiaryFiles([...beneficiaryFiles, { vinculo: null, pessoais: [] }]);
  };

  const deleteBenef = (index: number) => {
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
    setBeneficiaryFiles(beneficiaryFiles.filter((_, i) => i !== index));
  };

  const updateBenef = (index: number, updatedData: BeneficiaryTypes) => {
    const newBenef = [...beneficiaries];
    newBenef[index] = updatedData;
    setBeneficiaries(newBenef);
    if (beneficiaryErrors[index]) {
      setBeneficiaryErrors((prev) => { const next = { ...prev }; delete next[index]; return next; });
    }
  };

  const updateBenefFiles = (
    index: number,
    field: "vinculo" | "pessoais",
    value: File | null | File[],
  ) => {
    const updated = [...beneficiaryFiles];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficiaryFiles(updated);
  };

  const validateBeneficiaries = (): Record<number, Record<string, string>> | null => {
    const allErrors: Record<number, Record<string, string>> = {};

    for (let i = 0; i < beneficiaries.length; i++) {
      const b = beneficiaries[i];
      const tipo = b.tipoMovimentacao;
      const errs: Record<string, string> = {};

      const req = (key: string, value: string, label: string) => {
        if (!value?.trim()) errs[key] = `${label} é obrigatório.`;
      };

      req("nome", b.nome, "Nome");
      req("cpf", b.cpf, "CPF");

      if (tipo === "INCLUSAO") {
        req("dataNascimento", b.dataNascimento, "Data de Nascimento");
        req("cep", b.endereco.cep, "CEP");
        req("estado", b.endereco.estado, "Estado");
        req("cidade", b.endereco.cidade, "Cidade");
        req("bairro", b.endereco.bairro, "Bairro");
        req("logradouro", b.endereco.logradouro, "Logradouro");
        req("numero", b.endereco.numero, "Número");
        req("planoAtual", b.planoAtual, "Plano");
        if (b.dependencia !== "TITULAR") {
          req("nomeTitular", b.nomeTitular, "Nome do Titular");
        }
      }

      if (Object.keys(errs).length > 0) allErrors[i] = errs;
    }

    return Object.keys(allErrors).length > 0 ? allErrors : null;
  };

  const handleMovement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validações síncronas antes de qualquer operação async
    setError(null);

    if (!companySelect || companySelect === "Seleciona a empresa") {
      setError("Selecione uma empresa antes de enviar.");
      document.getElementById("new-movement-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (beneficiaries.length === 0) {
      setError("Adicione ao menos um beneficiário.");
      document.getElementById("new-movement-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const validationError = validateBeneficiaries();
    if (validationError) {
      setBeneficiaryErrors(validationError);
      const count = Object.values(validationError).reduce((acc, e) => acc + Object.keys(e).length, 0);
      setError(`Corrija ${count} campo(s) obrigatório(s) destacado(s) abaixo.`);
      document.getElementById("new-movement-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setBeneficiaryErrors({});

    setIsLoading(true);

    try {
      const fd = new FormData(event.currentTarget);
      const idEmpresa = companySelect;
      const descritivo = fd.get("obs") as string;
      const nomeEmpresa =
        companies.find((c) => c.value === companySelect)?.label ??
        companySelect;

      // Passo 1: upload dos arquivos de cada beneficiário
      const uploadedBeneficiaries = await Promise.all(
        beneficiaries.map(async (benef, index) => {
          const files = beneficiaryFiles[index] ?? {
            vinculo: null,
            pessoais: [],
          };
          const allFiles: File[] = [
            ...files.pessoais,
            ...(files.vinculo ? [files.vinculo] : []),
          ];

          if (allFiles.length === 0) {
            return {
              ...benef,
              dadosComplementares: {
                documentosBeneficiario: [],
                documentosEmpresa: [],
              },
            };
          }

          const uploadForm = new FormData();
          allFiles.forEach((file) => uploadForm.append("files", file));

          const params = new URLSearchParams({
            tipoMovimentacao: benef.tipoMovimentacao,
            nomeBeneficiario: benef.nome,
            nomeEmpresa,
          });

          const uploadRes = await api.post(
            `/api/files/upload?${params.toString()}`,
            uploadForm,
            { headers: { "Content-Type": "multipart/form-data" } },
          );

          const { paths: filePaths } = uploadRes.data as {
            message: string;
            paths: string[];
          };
          const pessoaisCount = files.pessoais.length;
          const documentosBeneficiario = filePaths.slice(0, pessoaisCount);
          const documentosEmpresa = files.vinculo ? [filePaths[pessoaisCount]] : [];

          return {
            ...benef,
            dadosComplementares: {
              documentosBeneficiario,
              documentosEmpresa,
            },
          };
        }),
      );

      // Passo 2: sanitizar CPF e CEP
      const sanitized = uploadedBeneficiaries.map((b) => ({
        ...b,
        cpf: onlyDigits(b.cpf),
        endereco: { ...b.endereco, cep: onlyDigits(b.endereco.cep) },
      }));

      await SendMovement(sanitized, idEmpresa, descritivo);

      setSuccess(true);
      setTimeout(() => {
        onClick();
        onSuccess?.();
      }, 1800);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Erro ao enviar a movimentação. Tente novamente.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="new-movement-scroll" className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-xs overflow-y-auto md:p-16">
      <div className="bg-(--bg-default) text-(--black) w-full rounded-lg border border-gray-300 shadow-lg">
        <div className="flex p-6 border-b border-black/20 justify-between items-center gap-4 flex-wrap">
          <h2 className="font-bold text-2xl">Nova Movimentação</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={downloadModeloSheet}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Baixar planilha modelo
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <FileSpreadsheet className="h-4 w-4 animate-pulse" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isImporting ? "Importando..." : "Importar planilha"}
            </button>
            <button type="button" onClick={onClick} className="cursor-pointer ml-2">
              <X />
            </button>
          </div>
        </div>
        <form className="p-8 space-y-6" onSubmit={handleMovement}>
          <div className="grid gap-2 md:grid-cols-3 md:gap-8">
            <div className="grid gap-2">
              <Label htmlFor="company">Empresa</Label>
              {defaultCompany ? (
                <div className="h-10 w-full border border-gray-200 shadow-sm rounded-xl flex items-center px-4 bg-gray-50 text-sm text-gray-600 cursor-not-allowed">
                  {companies.find((c) => c.value === defaultCompany)?.label ?? defaultCompany}
                </div>
              ) : (
                <CustomSelect
                  id="company"
                  label="Selecione a empresa"
                  onChange={setCompanySelect}
                  options={companies}
                  value={companySelect}
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obs">Descritivo/Observação</Label>
              <Input
                id="obs"
                type="text"
                placeholder="Digite aqui sua observação..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-(--blue-icon)" />
            <h2 className="font-bold">Beneficiários</h2>
            {beneficiaries.length > 0 && (
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                {beneficiaries.length} adicionado{beneficiaries.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Banner de erro */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Banner de sucesso */}
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Movimentação enviada com sucesso! Redirecionando...
            </div>
          )}

          {beneficiaries.length === 0 ? (
            <button
              type="button"
              onClick={addBenef}
              className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-10 text-gray-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 transition-all duration-150 cursor-pointer group"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-all">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Adicionar beneficiário</p>
                <p className="text-xs mt-0.5">Clique para adicionar o primeiro beneficiário à movimentação</p>
              </div>
            </button>
          ) : (
            <>
              {beneficiaries.map((benef, index) => (
                <div
                  key={index}
                  className="space-y-4 bg-white/60 rounded-lg border border-gray-300 p-4 inset-shadow-sm/20"
                >
                  <div className="font-bold flex justify-between items-center">
                    <p className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {index + 1}
                      </span>
                      Beneficiário {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => deleteBenef(index)}
                      className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Beneficiary
                    key={`beneficiary-field-${index}`}
                    data={benef}
                    onChange={(updatedData) => updateBenef(index, updatedData)}
                    onVinculoChange={(file) =>
                      updateBenefFiles(index, "vinculo", file)
                    }
                    onPessoaisChange={(files) =>
                      updateBenefFiles(index, "pessoais", files)
                    }
                    fieldErrors={beneficiaryErrors[index]}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addBenef}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-4 text-sm text-gray-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 transition-all duration-150 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Adicionar outro beneficiário
              </button>

              <div className="space-y-2 md:space-y-0 md:flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClick}
                  disabled={isLoading}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="rounded-lg bg-(--azul) px-4 py-2 text-sm font-medium text-white hover:bg-(--azul-escuro) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
