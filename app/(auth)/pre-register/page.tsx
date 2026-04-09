"use client";

import { LogoPositivo } from "@/app/components/Logo/LogoPositivo";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import { verifyConnected } from "@/app/utils/verifyConnected";
import { api } from "@/services/api";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserCog, TriangleAlert, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/app/components/ui/Input/Input";

type TeamStatus = "loading" | "valid" | "invalid";
type SubmitStatus = "idle" | "success" | "error";

export default function PreRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idEmpresa = searchParams.get("idEmpresa");
  const idEquipe = searchParams.get("idEquipe");
  const isAnalistaFlow = !!idEquipe;

  const [companies, setCompanies] = useState<
    { label: string; value: string }[]
  >([]);
  const [companySelect, setCompanySelect] = useState("Seleciona a empresa");
  const [nomeEquipe, setNomeEquipe] = useState("");
  const [responsabilidade, setResponsabilidade] = useState("");
  const [nome, setNome] = useState("");
  const [teamStatus, setTeamStatus] = useState<TeamStatus>(
    isAnalistaFlow ? "loading" : "valid",
  );
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    verifyConnected(window.location.href);

    if (isAnalistaFlow) {
      fetchNomeEquipe();
    } else {
      if (idEmpresa) setCompanySelect(idEmpresa);
      getCompanies();
    }
  }, []);

  async function fetchNomeEquipe() {
    try {
      const res = await api.get(`/equipes/${idEquipe}`);
      setNomeEquipe(res.data.nomeEquipe);
      setTeamStatus("valid");
    } catch (err) {
      console.error(err);
      setTeamStatus("invalid");
    }
  }

  async function getCompanies() {
    try {
      const res = await api.get("/empresas");
      setCompanies(
        res.data.map((company: any) => ({
          label: company.nome,
          value: company.idEmpresa,
        })),
      );
    } catch (err) {
      console.error(err);
    }
  }

  const sendPreRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const email = fd.get("email-input");

    try {
      if (isAnalistaFlow) {
        await api.post("/auth/pre-register", {
          login: email,
          role: "ADMIN",
          idEquipe,
        });
      } else {
        await api.post("/auth/pre-register", {
          login: email,
          role: "USER",
          idEmpresa: companySelect,
        });
      }
      setSubmitStatus("success");
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
    }
  };

  const sendPreRegisterAnalist = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const email = fd.get("email-input");

    setIsSubmitting(true);
    try {
      if (isAnalistaFlow) {
        await api.post("/analista", {
          login: email,
          nome: nome,
          responsabilidade: responsabilidade,
          idEquipe,
        });
      } else {
        await api.post("/auth/pre-register", {
          login: email,
          role: "USER",
          idEmpresa: companySelect,
        });
      }
      setSubmitStatus("success");
      setTimeout(() => router.back(), 1000);
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
      setTimeout(() => router.back(), 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAnalistaFlow) {
    return (
      <>
        <div className="bg-radial from-(--azul-escuro) via-(--azul) to-(--azul-escuro) hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
          <div className="flex flex-col items-center gap-6 text-white text-center">
            <Image
              src="/logo_horizontal_negativo_branco.png"
              width={300}
              height={300}
              alt="logo-img"
            />
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-medium">
              <UserCog className="h-4 w-4" />
              Cadastro de analista
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col gap-8 justify-center w-full max-w-md">
            <div className="flex gap-4 items-center">
              <LogoPositivo direction="horizontal" />
              <h1 className="text-2xl font-semibold hidden lg:block">
                MoviMenta
              </h1>
            </div>

            {teamStatus === "loading" && (
              <p className="text-center text-lg italic opacity-60 py-6">
                Verificando equipe...
              </p>
            )}

            {teamStatus === "invalid" && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="rounded-full bg-red-50 border border-red-100 p-4">
                  <TriangleAlert className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-red-600">
                    Convite invalido
                  </p>
                  <p className="opacity-60 text-sm mt-1">
                    O identificador da equipe nao foi encontrado ou expirou.
                    Solicite um novo convite.
                  </p>
                </div>
              </div>
            )}

            {teamStatus === "valid" && (
              <>
                <div className="grid gap-2 border-b border-gray-400 pb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">
                      Pre Cadastro Analista
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-(--azul)">
                      <UserCog className="h-3 w-3" />
                      Analista
                    </span>
                  </div>
                  <p className="opacity-60">
                    Cadastre o email do analista para a equipe
                  </p>
                </div>

                <form
                  className="items-center space-y-4"
                  onSubmit={sendPreRegisterAnalist}
                >
                  <div className="grid gap-2">
                    <label htmlFor="nome-input" className="font-bold">
                      Nome:
                    </label>
                    <Input
                      id="nome-input"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="email-input" className="font-bold">
                      E-mail:
                    </label>
                    <Input
                      id="email-input"
                      type="email"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="font-bold">Equipe:</label>
                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-(--azul)">
                      {nomeEquipe}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="select-responsabilidade"
                      className="font-bold"
                    >
                      Responsabilidade:
                    </label>
                    <CustomSelect
                      id="select-responsabilidade"
                      label="Selecione a responsabilidade"
                      value={responsabilidade}
                      onChange={setResponsabilidade}
                      options={[
                        { label: "Auxiliar", value: "AUXILIAR" },
                        { label: "Junior", value: "JUNIOR" },
                        { label: "Pleno", value: "PLENO" },
                        { label: "Senior", value: "SENIOR" },
                      ]}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-(--azul) hover:bg-(--blue-button) text-white w-full rounded-lg p-2 flex items-center justify-center gap-2 cursor-pointer transition-all duration-100 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : "Cadastrar analista"}
                  </button>

                  {submitStatus === "success" && (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Analista cadastrado com sucesso! Redirecionando...
                    </div>
                  )}
                  {submitStatus === "error" && (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      <XCircle className="h-4 w-4 shrink-0" />
                      Não foi possível cadastrar. Redirecionando...
                    </div>
                  )}
                </form>

                <p className="opacity-60">
                  O email pre cadastrado receberá um email para completar o
                  cadastro
                </p>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-radial from-(--azul) via-blue-400 to-(--azul) hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        <div className="">
          <Image
            src="/logo_horizontal_negativo_branco.png"
            width={300}
            height={300}
            alt="logo-img"
          />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col gap-8 justify-center w-full max-w-md">
          <div className="flex gap-4 items-center">
            <LogoPositivo direction="horizontal" />
            <h1 className="text-2xl font-semibold hidden lg:block">
              MoviMenta
            </h1>
          </div>
          <div className="grid gap-2 border-b border-gray-400 pb-2">
            <h2 className="text-2xl font-bold">Pre Cadastro</h2>
            <p className="opacity-60">Cadastre o email da empresa</p>
          </div>
          <form className="items-center space-y-4" onSubmit={sendPreRegister}>
            <div className="grid gap-2">
              <label htmlFor="email-input" className="font-bold">
                E-mail:
              </label>
              <Input
                id="email-input"
                type="email"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="select-company" className="font-bold">
                Empresa:
              </label>
              <CustomSelect
                id="select-company"
                label={companySelect}
                onChange={setCompanySelect}
                options={companies}
                value={companySelect}
              />
            </div>
            <button
              type="submit"
              className="bg-(--azul) text-white w-full rounded-lg p-2 flex items-center justify-center gap-4 cursor-pointer transition-all duration-100 active:scale-95"
            >
              Cadastrar
            </button>

            {submitStatus === "success" && (
              <p className="text-green-600 text-sm text-center font-medium">
                Cadastro realizado com sucesso. O e-mail de ativacao foi
                enviado.
              </p>
            )}
            {submitStatus === "error" && (
              <p className="text-red-500 text-sm text-center">
                Nao foi possivel realizar o cadastro. Verifique os dados e tente
                novamente.
              </p>
            )}
          </form>
          <p className="opacity-60">
            O email pré cadastrado receberá um email para completar o cadastro
          </p>
        </div>
      </div>
    </>
  );
}
