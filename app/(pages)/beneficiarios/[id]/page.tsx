"use client";

import { api } from "@/services/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  RefreshCw,
  Send,
  User,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import { formatCPF, parseDate } from "@/app/utils/format";
import { BeneficiaryTypes } from "@/app/types/BeneficiaryTypes";

type BeneficiarioDetail = BeneficiaryTypes & {
  idBeneficiario: string;
  idMovimentacao: string;
};

const statusMap: Record<string, { label: string; className: string }> = {
  PENDENTE: {
    label: "Pendente",
    className: "bg-orange-50 text-orange-700 border-orange-300",
  },
  ANALISE: {
    label: "Análise",
    className: "bg-blue-50 text-blue-700 border-blue-300",
  },
  ENVIADO_OPERADORA: {
    label: "Enviado Operadora",
    className: "bg-indigo-50 text-indigo-700 border-indigo-300",
  },
  PENDENTE_OPERADORA: {
    label: "Pend. Operadora",
    className: "bg-yellow-50 text-yellow-700 border-yellow-300",
  },
  DECLINIO: {
    label: "Declínio",
    className: "bg-red-50 text-red-700 border-red-300",
  },
  CONCLUIDO: {
    label: "Concluído",
    className: "bg-green-50 text-green-700 border-green-300",
  },
};

const tipoMap: Record<
  string,
  { Icon: React.ElementType; className: string; label: string }
> = {
  INCLUSAO: {
    Icon: UserPlus,
    className: "bg-green-50 text-(--green-icon) border rounded-lg border-green-200 p-2",
    label: "Inclusão",
  },
  EXCLUSAO: {
    Icon: UserMinus,
    className: "text-(--red-icon) bg-red-50 border rounded-lg border-red-200 p-2",
    label: "Exclusão",
  },
  ALTERACAO_DE_DADOS_CADASTRAIS: {
    Icon: RefreshCw,
    className: "text-(--blue-icon) bg-blue-50 border rounded-lg border-blue-200 p-2",
    label: "Alteração Cadastral",
  },
  SEGUNDA_VIA_CARTEIRINHA: {
    Icon: CreditCard,
    className: "text-purple-500 bg-purple-50 border rounded-lg border-purple-200 p-2",
    label: "2ª Via Carteirinha",
  },
};

const dependenciaMap: Record<string, string> = {
  TITULAR: "Titular",
  CONJUGE: "Cônjuge",
  FILHO: "Filho(a)",
  AGREGADO: "Agregado",
};

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [beneficiario, setBeneficiario] = useState<BeneficiarioDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await api.get(`/movimentacao/beneficiario/${id}`);
        setBeneficiario(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64 p-8">
        <p className="text-lg italic opacity-60">Carregando informações...</p>
      </div>
    );
  }

  if (!beneficiario) {
    return (
      <div className="flex items-center justify-center min-h-64 p-8">
        <p className="text-lg italic opacity-60">Beneficiário não encontrado.</p>
      </div>
    );
  }

  const statusConfig = statusMap[beneficiario.status] ?? {
    label: beneficiario.status,
    className: "bg-gray-50 text-gray-700 border-gray-300",
  };

  const tipoConfig = tipoMap[beneficiario.tipoMovimentacao] ?? {
    Icon: FileText,
    className: "text-gray-500 bg-gray-50 border rounded-lg border-gray-200 p-2",
    label: beneficiario.tipoMovimentacao,
  };

  const TipoIcon = tipoConfig.Icon;

  const enderecoCompleto = [
    beneficiario.endereco?.logradouro,
    beneficiario.endereco?.numero,
    beneficiario.endereco?.complemento,
    beneficiario.endereco?.bairro,
    beneficiario.endereco?.cidade,
    beneficiario.endereco?.estado,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-(--azul) transition-colors duration-100 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao dashboard
      </button>

      {/* Hero card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className={tipoConfig.className}>
                <TipoIcon className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold break-words">
                {beneficiario.nome}
              </h1>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0 ${statusConfig.className}`}
              >
                {statusConfig.label}
              </span>
            </div>

            <p className="opacity-60 text-sm sm:text-base">
              {tipoConfig.label} · {dependenciaMap[beneficiario.dependencia] ?? beneficiario.dependencia}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20 border border-gray-200">
                <p className="text-xs uppercase tracking-wide text-gray-500">CPF</p>
                <p className="font-semibold">{formatCPF(beneficiario.cpf)}</p>
              </div>
              <div className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20 border border-gray-200">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Data de Nascimento
                </p>
                <p className="font-semibold">
                  {parseDate(beneficiario.dataNascimento)}
                </p>
              </div>
              {beneficiario.dependencia !== "TITULAR" && beneficiario.nomeTitular && (
                <div className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20 border border-gray-200">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Titular
                  </p>
                  <p className="font-semibold">{beneficiario.nomeTitular}</p>
                </div>
              )}
            </div>
          </div>

          {beneficiario.planoAtual && (
            <div className="rounded-xl border border-gray-200 bg-linear-to-r to-blue-50 from-(--light-gray) px-4 py-3 lg:min-w-52 inset-shadow-sm/20">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Plano Atual
              </p>
              <p className="text-lg font-bold text-(--azul)">{beneficiario.planoAtual}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endereço */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-(--blue-icon)" />
            <p className="text-xl font-semibold tracking-wide">Endereço</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              { label: "Logradouro", value: beneficiario.endereco?.logradouro },
              { label: "Número", value: beneficiario.endereco?.numero },
              { label: "Complemento", value: beneficiario.endereco?.complemento },
              { label: "Bairro", value: beneficiario.endereco?.bairro },
              { label: "CEP", value: beneficiario.endereco?.cep },
              { label: "Cidade", value: beneficiario.endereco?.cidade },
              { label: "Estado", value: beneficiario.endereco?.estado },
            ].map(
              ({ label, value }) =>
                value && (
                  <div key={label} className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20 border border-gray-200">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {label}
                    </p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ),
            )}
          </div>

          {!enderecoCompleto && (
            <p className="text-sm italic opacity-60">Endereço não informado.</p>
          )}
        </div>

        {/* Documentos */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-(--blue-icon)" />
            <p className="text-xl font-semibold tracking-wide">Documentos</p>
          </div>

          {beneficiario.dadosComplementares?.documentosBeneficiario?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Documentos do Beneficiário
              </p>
              <ul className="space-y-1.5">
                {beneficiario.dadosComplementares.documentosBeneficiario.map(
                  (doc, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-(--light-gray) px-3 py-2 text-sm"
                    >
                      <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-(--azul) hover:underline"
                      >
                        Documento {i + 1}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {beneficiario.dadosComplementares?.documentosEmpresa?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Documentos da Empresa
              </p>
              <ul className="space-y-1.5">
                {beneficiario.dadosComplementares.documentosEmpresa.map(
                  (doc, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-(--light-gray) px-3 py-2 text-sm"
                    >
                      <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-(--azul) hover:underline"
                      >
                        Documento {i + 1}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {!beneficiario.dadosComplementares?.documentosBeneficiario?.length &&
            !beneficiario.dadosComplementares?.documentosEmpresa?.length && (
              <p className="text-sm italic opacity-60">Nenhum documento anexado.</p>
            )}
        </div>
      </div>

      {/* Observação */}
      {beneficiario.observacao && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-(--blue-icon)" />
            <p className="text-xl font-semibold tracking-wide">Observação</p>
          </div>
          <p className="text-sm text-gray-700">{beneficiario.observacao}</p>
        </div>
      )}
    </div>
  );
}
