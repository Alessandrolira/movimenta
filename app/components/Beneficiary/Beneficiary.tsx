"use client";

import { Input } from "@/app/components/ui/Input/Input";
import { Label } from "@/app/components/ui/Label/Label";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import { BeneficiaryTypes } from "@/app/types/BeneficiaryTypes";
import { formatCEP, formatCPF, onlyDigits } from "@/app/utils/format";
import { Loader2, Paperclip, Search, Upload } from "lucide-react";
import { useState } from "react";
import { api } from "@/services/api";
import { AnimatePresence, motion } from "motion/react";

interface BeneficiaryProps {
  data: BeneficiaryTypes;
  onChange: (updatedData: BeneficiaryTypes) => void;
  onVinculoChange?: (file: File | null) => void;
  onPessoaisChange?: (files: File[]) => void;
  idEmpresa?: string;
}

const dependencies = [
  { label: "Titular", value: "TITULAR" },
  { label: "Cônjuge", value: "CONJUGE" },
  { label: "Filho", value: "FILHO" },
  { label: "Agregado", value: "AGREGADO" },
];

const movements = [
  { label: "Inclusão", value: "INCLUSAO" },
  { label: "Exclusão", value: "EXCLUSAO" },
  { label: "Alteração Cadastral", value: "ALTERACAO_DE_DADOS_CADASTRAIS" },
  { label: "2ª Via da Carteirinha", value: "SEGUNDA_VIA_CARTEIRINHA" },
];

const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.18 },
};

export default function Beneficiary({
  data,
  onChange,
  onVinculoChange,
  onPessoaisChange,
  idEmpresa,
}: BeneficiaryProps) {
  const [vinculoName, setVinculoName] = useState<string | null>(null);
  const [pessoaisNames, setPessoaisNames] = useState<string[]>([]);
  const [cpfSearch, setCpfSearch] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const tipo = data.tipoMovimentacao;

  const handleChange = (field: keyof BeneficiaryTypes, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleTipoChange = (value: string) => {
    handleChange("tipoMovimentacao", value);
    setHasFetched(false);
    setFetchError(null);
    setCpfSearch("");
  };

  const handleFetchByCpf = async () => {
    const digits = onlyDigits(cpfSearch);
    if (digits.length !== 11) {
      setFetchError("CPF inválido.");
      return;
    }
    setIsFetching(true);
    setFetchError(null);
    try {
      const params = idEmpresa ? `?idEmpresa=${idEmpresa}` : "";
      const res = await api.get(`/beneficiarios/cpf/${digits}${params}`);
      const b = res.data;
      onChange({
        ...data,
        nome: b.nome ?? "",
        dataNascimento: b.dataNascimento ?? "",
        cpf: b.cpf ?? digits,
        endereco: b.endereco ?? data.endereco,
        dependencia: b.dependencia ?? data.dependencia,
        nomeTitular: b.nomeTitular ?? "",
        planoAtual: b.planoAtual ?? "",
        observacao: b.observacao ?? "",
      });
      setHasFetched(true);
    } catch {
      setFetchError("Beneficiário não encontrado para este CPF.");
    } finally {
      setIsFetching(false);
    }
  };

  // ─── Shared field blocks ────────────────────────────────────────────────────

  const fieldNome = (
    <div className="space-y-2 col-span-2">
      <Label htmlFor={`nome-${data.cpf}`}>Nome Beneficiário</Label>
      <Input
        value={data.nome}
        onChange={(e) => handleChange("nome", e.target.value)}
        placeholder="Ex: Maria da Silva"
        type="text"
        id={`nome-${data.cpf}`}
      />
    </div>
  );

  const fieldCpf = (
    <div className="space-y-2">
      <Label htmlFor={`cpf-${data.cpf}`}>CPF</Label>
      <Input
        value={formatCPF(data.cpf)}
        onChange={(e) => handleChange("cpf", e.target.value)}
        placeholder="000.000.000-00"
        type="text"
        id={`cpf-${data.cpf}`}
      />
    </div>
  );

  const fieldObs = (
    <div className="space-y-2 col-span-2">
      <Label htmlFor={`obs-${data.cpf}`}>Observação</Label>
      <Input
        value={data.observacao}
        onChange={(e) => handleChange("observacao", e.target.value)}
        placeholder="Alguma observação sobre o beneficiário..."
        type="text"
        id={`obs-${data.cpf}`}
      />
    </div>
  );

  const fieldDocPessoal = (
    <div className="space-y-2">
      <Label htmlFor={`pessoais-${data.cpf}`}>Documento Pessoal</Label>
      <label
        htmlFor={`pessoais-${data.cpf}`}
        className="flex items-center gap-2 w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2 bg-white hover:bg-gray-50 cursor-pointer transition-all text-sm text-gray-500 truncate"
      >
        <Paperclip className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="truncate">
          {pessoaisNames.length > 0 ? pessoaisNames.join(", ") : "Selecionar arquivo(s)..."}
        </span>
      </label>
      <input
        id={`pessoais-${data.cpf}`}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          setPessoaisNames(files.map((f) => f.name));
          onPessoaisChange?.(files);
        }}
      />
    </div>
  );

  const fieldVinculo = (label: string) => (
    <div className="space-y-2">
      <Label htmlFor={`vinculo-${data.cpf}`}>{label}</Label>
      <label
        htmlFor={`vinculo-${data.cpf}`}
        className="flex items-center gap-2 w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2 bg-white hover:bg-gray-50 cursor-pointer transition-all text-sm text-gray-500 truncate"
      >
        <Upload className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="truncate">{vinculoName ?? "Selecionar arquivo..."}</span>
      </label>
      <input
        id={`vinculo-${data.cpf}`}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          setVinculoName(file?.name ?? null);
          onVinculoChange?.(file);
        }}
      />
    </div>
  );

  const fullAddressAndDetails = (
    <>
      <div className="space-y-2">
        <Label htmlFor={`dt-nasc-${data.cpf}`}>Data de Nascimento</Label>
        <Input
          value={data.dataNascimento}
          onChange={(e) => handleChange("dataNascimento", e.target.value)}
          type="date"
          id={`dt-nasc-${data.cpf}`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`cep-${data.cpf}`}>CEP</Label>
        <Input
          value={formatCEP(data.endereco.cep)}
          onChange={(e) => handleChange("endereco", { ...data.endereco, cep: e.target.value })}
          placeholder="00000-000"
          type="text"
          id={`cep-${data.cpf}`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`estado-${data.cpf}`}>Estado</Label>
        <Input
          value={data.endereco.estado}
          onChange={(e) => handleChange("endereco", { ...data.endereco, estado: e.target.value })}
          placeholder="Ex: São Paulo"
          type="text"
          id={`estado-${data.cpf}`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`cidade-${data.cpf}`}>Cidade</Label>
        <Input
          value={data.endereco.cidade}
          onChange={(e) => handleChange("endereco", { ...data.endereco, cidade: e.target.value })}
          placeholder="Ex: São Paulo"
          type="text"
          id={`cidade-${data.cpf}`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`bairro-${data.cpf}`}>Bairro</Label>
        <Input
          value={data.endereco.bairro}
          onChange={(e) => handleChange("endereco", { ...data.endereco, bairro: e.target.value })}
          placeholder="Ex: Jardins"
          type="text"
          id={`bairro-${data.cpf}`}
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor={`logradouro-${data.cpf}`}>Logradouro</Label>
        <Input
          value={data.endereco.logradouro}
          onChange={(e) => handleChange("endereco", { ...data.endereco, logradouro: e.target.value })}
          placeholder="Ex: Av. Paulista"
          type="text"
          id={`logradouro-${data.cpf}`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`numero-${data.cpf}`}>Número</Label>
        <Input
          value={data.endereco.numero}
          onChange={(e) => handleChange("endereco", { ...data.endereco, numero: e.target.value })}
          placeholder="Ex: 1439"
          type="text"
          id={`numero-${data.cpf}`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`compl-${data.cpf}`}>Complemento</Label>
        <Input
          value={data.endereco.complemento}
          onChange={(e) => handleChange("endereco", { ...data.endereco, complemento: e.target.value })}
          placeholder="Ex: Apto. 13"
          type="text"
          id={`compl-${data.cpf}`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`dep-${data.cpf}`}>Dependência</Label>
        <CustomSelect
          id={`dep-${data.cpf}`}
          label="Selecione a dependência"
          onChange={(e) => handleChange("dependencia", e)}
          options={dependencies}
          value={data.dependencia}
        />
      </div>
      <div className={`space-y-2 ${data.dependencia === "TITULAR" ? "hidden" : ""}`}>
        <Label htmlFor={`titular-${data.cpf}`}>Nome Titular</Label>
        <Input
          value={data.nomeTitular}
          onChange={(e) => handleChange("nomeTitular", e.target.value)}
          placeholder="Ex: Josué da Silva"
          type="text"
          id={`titular-${data.cpf}`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`plano-${data.cpf}`}>Plano</Label>
        <Input
          value={data.planoAtual}
          onChange={(e) => handleChange("planoAtual", e.target.value)}
          placeholder="Ex: SMART 600 QP"
          type="text"
          id={`plano-${data.cpf}`}
        />
      </div>
      {fieldObs}
      {fieldDocPessoal}
      {fieldVinculo("Vínculo Empregatício")}
    </>
  );

  // ─── Section selector ───────────────────────────────────────────────────────

  const renderSection = () => {
    // SEGUNDA_VIA: CPF + nome + obs
    if (tipo === "SEGUNDA_VIA_CARTEIRINHA") {
      return (
        <motion.div key="segunda-via" {...fadeSlide} className="contents">
          {fieldNome}
          {fieldCpf}
          {fieldObs}
        </motion.div>
      );
    }

    // EXCLUSAO: nome + CPF + comprovante de desligamento + obs
    if (tipo === "EXCLUSAO") {
      return (
        <motion.div key="exclusao" {...fadeSlide} className="contents">
          {fieldNome}
          {fieldCpf}
          {fieldVinculo("Comprovante de Desligamento")}
          {fieldObs}
        </motion.div>
      );
    }

    // ALTERACAO: lookup por CPF → formulário completo
    if (tipo === "ALTERACAO_DE_DADOS_CADASTRAIS") {
      return (
        <motion.div key="alteracao" {...fadeSlide} className="contents">
          {!hasFetched ? (
            <div className="col-span-full space-y-3">
              <p className="text-sm text-gray-500">
                Informe o CPF do beneficiário para carregar os dados cadastrados.
              </p>
              <div className="flex gap-2 items-end">
                <div className="space-y-2 flex-1">
                  <Label htmlFor={`cpf-busca-${data.cpf}`}>CPF</Label>
                  <Input
                    value={formatCPF(cpfSearch)}
                    onChange={(e) => {
                      setCpfSearch(e.target.value);
                      setFetchError(null);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleFetchByCpf()}
                    placeholder="000.000.000-00"
                    type="text"
                    id={`cpf-busca-${data.cpf}`}
                  />
                </div>
                <button
                  type="button"
                  disabled={isFetching}
                  onClick={handleFetchByCpf}
                  className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Buscar
                </button>
              </div>
              {fetchError && (
                <p className="text-sm text-red-500">{fetchError}</p>
              )}
            </div>
          ) : (
            <>
              <div className="col-span-full flex items-center justify-between">
                <p className="text-sm text-green-600 font-medium">
                  Dados carregados — edite o que for necessário.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHasFetched(false);
                    setCpfSearch("");
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  Trocar CPF
                </button>
              </div>
              {fieldNome}
              {fieldCpf}
              {fullAddressAndDetails}
            </>
          )}
        </motion.div>
      );
    }

    // INCLUSAO (padrão): formulário completo
    return (
      <motion.div key="inclusao" {...fadeSlide} className="contents">
        {fieldNome}
        {fieldCpf}
        {fullAddressAndDetails}
      </motion.div>
    );
  };

  return (
    <div className="space-y-2 md:gap-2 md:grid lg:grid-cols-3 xl:grid-cols-4">
      {/* Tipo sempre visível no topo */}
      <div className="space-y-2 col-span-2">
        <Label htmlFor={`tipo-${data.cpf}`}>Tipo de Movimentação</Label>
        <CustomSelect
          id={`tipo-${data.cpf}`}
          label="Selecione a movimentação"
          onChange={handleTipoChange}
          options={movements}
          value={data.tipoMovimentacao}
        />
      </div>

      <AnimatePresence mode="wait">
        {renderSection()}
      </AnimatePresence>
    </div>
  );
}
