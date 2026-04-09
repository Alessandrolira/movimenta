"use client";

import { CompanyTypes } from "@/app/types/CompanyTypes";
import { parseCnpj } from "@/app/utils/format";
import { api } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  Clock,
  Files,
  Layers,
  RefreshCw,
  Users,
} from "lucide-react";
import StatCard from "@/app/components/StatCard/StatCard";
import { DadosGeraisType } from "@/app/types/DadosGeraisType";
import { IconType } from "react-icons";
import { GiHealthNormal } from "react-icons/gi";
import { FaTooth } from "react-icons/fa";
import Link from "next/link";
import { FaUserPlus } from "react-icons/fa";
import TransferirAnalistaModal from "@/app/components/TransferirAnalistaModal/TransferirAnalistaModal";
import { VariacaoVidasType } from "@/app/types/VariacaoVidasType";
import { MovementTypes } from "@/app/types/MovementTypes";
import { MovementParentCard } from "@/app/components/MovementCard/MovementParentCard";

export default function Page() {
  const params = useParams();
  const idEmpresa = Array.isArray(params.id) ? params.id[0] : params.id;

  const [company, setCompany] = useState<CompanyTypes>();
  const [dadosGerais, setDadosGerais] = useState<DadosGeraisType>();
  const [isLoading, setIsLoading] = useState(true);
  const [dadosGraficos, setDadosGraficos] = useState<
    { label: string; totalVidas: number }[]
  >([]);
  const [reativando, setReativando] = useState<string | null>(null);
  const [modalTransferir, setModalTransferir] = useState(false);
  const [movements, setMovements] = useState<MovementTypes[]>([]);

  async function reativarCadastro(idUsuario: string) {
    setReativando(idUsuario);
    try {
      await api.post("/auth/reativar-cadastro", { idUsuario });
      await getCompanies();
    } catch (err) {
      console.error(err);
    } finally {
      setReativando(null);
    }
  }

  interface modalideConfigProps {
    value: IconType;
    className: string;
    badgeClass: string;
    label: string;
  }

  async function getDadosGerais() {
    try {
      const res = await api.get(`/empresas/dadosGerais/${idEmpresa}`);
      setDadosGerais(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function getCompanies() {
    try {
      const res = await api.get(`/empresas/${idEmpresa}`);
      setCompany(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function getDadosGraficos() {
    try {
      const res = await api.get(`/empresas/${idEmpresa}/evolucao-vidas`);
      setDadosGraficos(res.data.evolucao ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function getMovements() {
    try {
      const res = await api.get(`/movimentacao/empresa/${idEmpresa}`);
      setMovements(res.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    async function loadPageData() {
      try {
        setIsLoading(true);
        await Promise.all([
          getDadosGerais(),
          getCompanies(),
          getDadosGraficos(),
          getMovements(),
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadPageData();
  }, []);

  console.log("Dados para gráfico de variação de vidas:", dadosGraficos);

  const stats = [
    {
      label: "Total",
      value: dadosGerais?.totalMovimentacao,
      icon: Files,
      color: "gray-icon",
    },
    {
      label: "Pendentes",
      value: dadosGerais?.totalMovimentacaoPendente,
      icon: Layers,
      color: "orange-icon",
    },
    {
      label: "Em Análise",
      value: dadosGerais?.totalMovimentacaoAnalise,
      icon: Clock,
      color: "blue-icon",
    },
    {
      label: "Concluídos",
      value: dadosGerais?.totalMovimentacaoConcluida,
      icon: Files,
      color: "green-icon",
    },
  ];

  const modalidadeIcon: Record<
    CompanyTypes["modalidade"],
    modalideConfigProps
  > = {
    SAUDE: {
      value: GiHealthNormal,
      className: "text-red-500",
      badgeClass: "bg-red-50 text-red-700 border-red-100",
      label: "Saúde",
    },
    DENTAL: {
      value: FaTooth,
      className: "text-blue-500",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
      label: "Dental",
    },
  };

  const modalidadeConfig =
    company && modalidadeIcon[company.modalidade]
      ? modalidadeIcon[company.modalidade]
      : {
          value: Building2,
          className: "text-gray-500",
          badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
          label: company?.modalidade || "Não informado",
        };

  const ModalidadeIcon = modalidadeConfig.value;

  const barChartData = useMemo(() => {
    const series = dadosGraficos.map((item, index) => ({
      label: item.label,
      value: item.totalVidas,
      isInitial: index === 0,
    }));
    const maxValue = Math.max(...series.map((item) => item.value), 1);
    return { series, maxValue };
  }, [dadosGraficos]);

  return (
    <>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold wrap-break-word">
                  {company?.nome || "Empresa"}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${modalidadeConfig.badgeClass}`}
                >
                  <ModalidadeIcon
                    className={`text-base ${modalidadeConfig.className}`}
                  />
                  {modalidadeConfig.label}
                </span>
              </div>

              <p className="opacity-60 text-sm sm:text-base">
                {parseCnpj(company?.cnpj || "")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-(--light-gray) px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Operadora
                  </p>
                  <p className="font-semibold wrap-break-word">
                    {company?.operadora || "Não informado"}
                  </p>
                </div>
                <div className="rounded-lg bg-(--light-gray) px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Equipe responsável
                    </p>
                    {company?.idAnalista && company?.idEquipe && (
                      <button
                        onClick={() => setModalTransferir(true)}
                        className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-(--azul) hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Transferir analista para outra equipe"
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                        Transferir
                      </button>
                    )}
                  </div>
                  <p className="font-semibold wrap-break-word">
                    {company?.nomeEquipeResponsavel || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-(--light-gray) px-4 py-3 min-w-52">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Vidas ativas
              </p>
              <p className="text-3xl font-bold text-(--azul)">
                {company?.qtdVidasAtivas ?? 0}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-(--blue-icon)" />
                <span>Total de beneficiarios ativos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4">
          <div>
            <p className="text-2xl font-semibold tracking-wide">
              Movimentações
            </p>
            <p className="text-sm text-gray-500">
              {dadosGerais?.totalMovimentacao ?? 0} movimentação(ões) no total
            </p>
          </div>

          {isLoading ? (
            <p className="text-center text-xl italic opacity-60 py-8">
              Carregando movimentações...
            </p>
          ) : movements.length === 0 ? (
            <p className="text-center text-xl italic opacity-60 py-8">
              Nenhuma movimentação encontrada para esta empresa.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {movements.map((movement) => (
                <MovementParentCard
                  key={movement.idMovimentacao}
                  id={movement.idMovimentacao}
                  nomeEmpresa={movement.nomeEmpresa}
                  dataMovimentacao={movement.dataMovimentacao}
                  observacao={movement.observacao}
                  modalidade={movement.modalidade}
                  beneficiarios={movement.beneficiariosMovimentacao}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4 lg:col-span-1 h-fit">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-2xl font-semibold tracking-wide">Logins</p>
                  <p className="text-sm text-gray-500">
                    {company?.acessos?.length || 0} acesso(s) cadastrados
                  </p>
                </div>
                <Link
                  href={`/pre-register?idEmpresa=${idEmpresa}`}
                  className="bg-(--azul) hover:bg-(--blue-icon) text-white rounded-lg py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-all duration-100 active:scale-95 w-full sm:w-auto text-sm whitespace-nowrap"
                >
                  Adicionar acesso
                  <FaUserPlus />
                </Link>
              </div>
            </div>

            {isLoading ? (
              <p className="text-center text-lg italic opacity-60 py-6">
                Carregando informações...
              </p>
            ) : company?.acessos?.length ? (
              <div className="max-h-64 overflow-y-auto pr-1">
                <ul className="grid gap-2">
                  {company.acessos.map(
                    (
                      acesso: {
                        idUsuario: string;
                        email: string;
                        status: string;
                      },
                      index,
                    ) => {
                      const statusConfig: Record<
                        string,
                        { badge: string; label: string }
                      > = {
                        ATIVO: {
                          badge: "bg-green-100 text-green-700 border-green-200",
                          label: "Ativo",
                        },
                        PENDENTE: {
                          badge:
                            "bg-yellow-100 text-yellow-700 border-yellow-200",
                          label: "Pendente",
                        },
                        CADASTRO_EXPIRADO: {
                          badge: "bg-red-100 text-red-700 border-red-200",
                          label: "Expirado",
                        },
                      };
                      const config = statusConfig[acesso.status] ?? {
                        badge: "bg-gray-100 text-gray-600 border-gray-200",
                        label: acesso.status,
                      };
                      const isExpired = acesso.status === "CADASTRO_EXPIRADO";
                      const isReativando = reativando === acesso.idUsuario;
                      return (
                        <li
                          key={index}
                          className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-(--light-gray) px-3 py-2 text-sm"
                        >
                          <span className="break-all text-gray-700">
                            {acesso.email}
                          </span>
                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${config.badge}`}
                            >
                              {config.label}
                            </span>
                            {isExpired && (
                              <div className="relative group/tip">
                                <button
                                  onClick={() =>
                                    reativarCadastro(acesso.idUsuario)
                                  }
                                  disabled={isReativando}
                                  className="flex items-center justify-center rounded-full p-1 text-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                                >
                                  <RefreshCw
                                    className={`h-3.5 w-3.5 ${isReativando ? "animate-spin" : ""}`}
                                  />
                                </button>
                                <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden group-hover/tip:flex">
                                  <span className="whitespace-nowrap rounded-lg bg-(--azul) px-2.5 py-1.5 text-xs font-medium text-white shadow-md">
                                    Reativar cadastro por 8h
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>
            ) : (
              <p className="text-center text-lg italic opacity-60 py-6">
                Nenhum login cadastrado para esta empresa.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 space-y-4 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold tracking-wide">
                  Evolucao de vidas
                </p>
                <p className="text-sm text-gray-500">
                  A primeira coluna mostra o numero inicial de vidas da empresa.
                </p>
              </div>
              <div className="text-sm rounded-lg border border-gray-200 bg-(--light-gray) px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Ultimo valor
                </p>
                <p className="font-semibold">
                  {barChartData.series[barChartData.series.length - 1]?.value}{" "}
                  vidas
                </p>
              </div>
            </div>

            {isLoading ? (
              <p className="text-center text-lg italic opacity-60 py-6">
                Carregando grafico...
              </p>
            ) : (
              <div className="space-y-3">
                <div className="h-64 rounded-xl border border-gray-200 bg-(--light-gray) p-3 overflow-x-auto">
                  <div className="h-full min-w-max flex items-end gap-3">
                    {barChartData.series.map((item, index) => {
                      const heightPercent =
                        (item.value / barChartData.maxValue) * 100;

                      return (
                        <div
                          key={`${item.label}-${index}`}
                          className="w-16 h-full flex flex-col justify-end"
                        >
                          <div className="flex-1 flex items-end">
                            <div
                              className={`w-full rounded-t-md transition-all duration-200 ${
                                item.isInitial
                                  ? "bg-(--azul)"
                                  : "bg-(--blue-icon)"
                              }`}
                              style={{
                                height: `${Math.max(heightPercent, 4)}%`,
                              }}
                              title={`${item.label}: ${item.value} vidas`}
                            />
                          </div>
                          <p className="text-xs text-center text-gray-600 mt-2 truncate">
                            {item.label}
                          </p>
                          <p className="text-xs text-center font-semibold text-(--black)">
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-(--azul)" />
                    Valor inicial
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-(--blue-icon)" />
                    Historico
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalTransferir && company?.idAnalista && company?.idEquipe && (
        <TransferirAnalistaModal
          idAnalista={company.idAnalista}
          idEquipeAtual={company.idEquipe}
          nomeAnalista={company.nomeEquipeResponsavel}
          onClose={() => setModalTransferir(false)}
          onSuccess={getCompanies}
        />
      )}
    </>
  );
}
