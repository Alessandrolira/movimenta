"use client";

import { LogoPositivo } from "@/app/components/Logo/LogoPositivo";
import { CustomSelect } from "@/app/components/ui/Select/Select";
import { verifyConnected } from "@/app/utils/verifyConnected";
import { api } from "@/services/api";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function PreRegister() {
  const [companies, setCompanies] = useState<
    { label: string; value: string }[]
  >([]);
  const [companySelect, setCompanySelect] = useState("Seleciona a empresa");
  console.log(companySelect);
  useEffect(() => {
    verifyConnected(window.location.href);
    getcompanies();
  }, []);

  async function getcompanies() {
    try {
      const res = await api.get("/empresas");
      setCompanies(
        res.data.map((company: any) => ({
          label: company.nome,
          value: company.idEmpresa,
        })),
      );
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  const sendPreRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const email = fd.get("email-input");
    console.log(email, companySelect);

    try {
      const res = await api.post("/auth/pre-register", {
        login: email,
        role: "USER",
        idEmpresa: companySelect,
      });
      console.log(res);
    } catch (err) {
      console.error(err);
    }
  };

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
            <h2 className="text-2xl font-bold">Pré Cadastro</h2>
            <p className="opacity-60">Cadastre o email da empresa</p>
          </div>
          <form className="items-center space-y-4" onSubmit={sendPreRegister}>
            <div className="grid gap-2">
              <label htmlFor="email-input" className="font-bold">
                E-mail:
              </label>
              <input
                id="email-input"
                name="email-input"
                type="email"
                className="border border-gray-300 rounded-lg p-2 bg-white transition-all duration-100 shadow-md focus:scale-105 focus:border-(--azul)"
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
          </form>
          <p className="opacity-60">
            O email pré cadastrado receberá um email para completar o cadastro
          </p>
        </div>
      </div>
    </>
  );
}
