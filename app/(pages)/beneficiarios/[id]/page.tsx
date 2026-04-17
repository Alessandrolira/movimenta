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
  Download,
  MapPin,
  RefreshCw,
  Send,
  User,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import JSZip from "jszip";
import { formatCPF, parseDateTime } from "@/app/utils/format";
import { BeneficiaryTypes } from "@/app/types/BeneficiaryTypes";

type BeneficiarioDetail = BeneficiaryTypes & {
  idBeneficiario: string;
  idMovimentacao: string;
};

type Documento = {
  nome: string;
  url: string;
  tipo: string;
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
    className:
      "bg-green-50 text-(--green-icon) border rounded-lg border-green-200 p-2",
    label: "Inclusão",
  },
  EXCLUSAO: {
    Icon: UserMinus,
    className:
      "text-(--red-icon) bg-red-50 border rounded-lg border-red-200 p-2",
    label: "Exclusão",
  },
  ALTERACAO_DE_DADOS_CADASTRAIS: {
    Icon: RefreshCw,
    className:
      "text-(--blue-icon) bg-blue-50 border rounded-lg border-blue-200 p-2",
    label: "Alteração Cadastral",
  },
  SEGUNDA_VIA_DE_CARTEIRINHA: {
    Icon: CreditCard,
    className:
      "text-purple-500 bg-purple-50 border rounded-lg border-purple-200 p-2",
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

  const [beneficiario, setBeneficiario] = useState<BeneficiarioDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [documentos, setDocumentos] = useState<{
    documentosEmpresa: Documento[];
    documentosBeneficiario: Documento[];
  }>({
    documentosEmpresa: [],
    documentosBeneficiario: [],
  });
  const [docModal, setDocModal] = useState<{
    doc: Documento;
    src: string;
  } | null>(null);
  const [docLoading, setDocLoading] = useState<string | null>(null);
  const [baixandoZip, setBaixandoZip] = useState<"beneficiario" | "empresa" | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await api.get(`/movimentacao/beneficiario/${id}`);
        setBeneficiario(res.data);
        const idBeneficiario = res.data.idBeneficiario;
        if (idBeneficiario) {
          const docsRes = await api.get(
            `/movimentacao/documentos/${idBeneficiario}`,
          );
          console.log("DOCUMENTOS", docsRes.data);
          setDocumentos(docsRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function baixarZip(docs: Documento[], tipo: "beneficiario" | "empresa") {
    setBaixandoZip(tipo);
    try {
      const zip = new JSZip();
      await Promise.all(
        docs.map(async (doc, i) => {
          const res = await api.get(`/movimentacao/documentos/stream`, {
            params: { caminho: doc.url },
            responseType: "blob",
          });
          const nomeArquivo = doc.nome || `documento_${i + 1}`;
          zip.file(nomeArquivo, res.data);
        }),
      );
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = tipo === "beneficiario" ? "documentos_beneficiario.zip" : "documentos_empresa.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setBaixandoZip(null);
    }
  }

  async function openDocumento(doc: Documento) {
    setDocLoading(doc.url);
    try {
      const res = await api.get(`/movimentacao/documentos/stream`, {
        params: { caminho: doc.url },
        responseType: "blob",
      });
      const blob: Blob = res.data;
      const src = URL.createObjectURL(blob);
      setDocModal({ doc, src });
    } catch (err) {
      console.error(err);
    } finally {
      setDocLoading(null);
    }
  }

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
        <p className="text-lg italic opacity-60">
          Beneficiário não encontrado.
        </p>
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
              {tipoConfig.label} ·{" "}
              {dependenciaMap[beneficiario.dependencia] ??
                beneficiario.dependencia}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20 border border-gray-200">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  CPF
                </p>
                <p className="font-semibold">{formatCPF(beneficiario.cpf)}</p>
              </div>
              <div className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20 border border-gray-200">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Data de Nascimento
                </p>
                <p className="font-semibold">
                  {parseDateTime(beneficiario.dataNascimento)}
                </p>
              </div>
              {beneficiario.dependencia !== "TITULAR" &&
                beneficiario.nomeTitular && (
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
              <p className="text-lg font-bold text-(--azul)">
                {beneficiario.planoAtual}
              </p>
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
              {
                label: "Complemento",
                value: beneficiario.endereco?.complemento,
              },
              { label: "Bairro", value: beneficiario.endereco?.bairro },
              { label: "CEP", value: beneficiario.endereco?.cep },
              { label: "Cidade", value: beneficiario.endereco?.cidade },
              { label: "Estado", value: beneficiario.endereco?.estado },
            ].map(
              ({ label, value }) =>
                value && (
                  <div
                    key={label}
                    className="rounded-lg bg-(--light-gray) px-3 py-2 inset-shadow-sm/20 border border-gray-200"
                  >
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

          {documentos.documentosBeneficiario.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Documentos do Beneficiário
                </p>
                <button
                  onClick={() => baixarZip(documentos.documentosBeneficiario, "beneficiario")}
                  disabled={baixandoZip === "beneficiario"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-(--light-gray) px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-(--blue-icon) hover:text-(--azul) transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  {baixandoZip === "beneficiario" ? "Baixando..." : "Baixar ZIP"}
                </button>
              </div>
              <ul className="space-y-1.5">
                {documentos.documentosBeneficiario.map((doc, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-(--light-gray) px-3 py-2 text-sm"
                  >
                    <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                    <button
                      onClick={() => openDocumento(doc)}
                      disabled={docLoading === doc.url}
                      className="truncate text-(--azul) hover:underline text-left disabled:opacity-50 cursor-pointer"
                    >
                      {docLoading === doc.url
                        ? "Carregando..."
                        : doc.nome || `Documento ${i + 1}`}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {documentos.documentosEmpresa.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Documentos da Empresa
                </p>
                <button
                  onClick={() => baixarZip(documentos.documentosEmpresa, "empresa")}
                  disabled={baixandoZip === "empresa"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-(--light-gray) px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-(--blue-icon) hover:text-(--azul) transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  {baixandoZip === "empresa" ? "Baixando..." : "Baixar ZIP"}
                </button>
              </div>
              <ul className="space-y-1.5">
                {documentos.documentosEmpresa.map((doc, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-(--light-gray) px-3 py-2 text-sm"
                  >
                    <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                    <button
                      onClick={() => openDocumento(doc)}
                      disabled={docLoading === doc.url}
                      className="truncate text-(--azul) hover:underline text-left disabled:opacity-50 cursor-pointer"
                    >
                      {docLoading === doc.url
                        ? "Carregando..."
                        : doc.nome || `Documento ${i + 1}`}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!documentos.documentosBeneficiario.length &&
            !documentos.documentosEmpresa.length && (
              <p className="text-sm italic opacity-60">
                Nenhum documento anexado.
              </p>
            )}
        </div>
      </div>

      {/* Modal de visualização de documento */}
      {docModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => { URL.revokeObjectURL(docModal.src); setDocModal(null); }}
        >
          <div
            className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <p className="font-semibold text-sm truncate">
                {docModal.doc.nome}
              </p>
              <button
                onClick={() => { URL.revokeObjectURL(docModal.src); setDocModal(null); }}
                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              {/pdf/i.test(docModal.doc.tipo) ? (
                <iframe
                  src={docModal.src}
                  className="w-full h-[70vh] rounded"
                  title={docModal.doc.nome}
                />
              ) : (
                <img
                  src={docModal.src}
                  alt={docModal.doc.nome}
                  className="max-w-full max-h-[70vh] object-contain rounded"
                />
              )}
            </div>
          </div>
        </div>
      )}

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
