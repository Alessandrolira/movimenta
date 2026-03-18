"use client";

import { LogoPositivo } from "@/app/components/Logo/LogoPositivo";
import { api } from "@/services/api";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

export default function PreRegister() {
  const router = useRouter();
  const validationToken = useSearchParams().get("token");

  const sendLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fd = new FormData(event.currentTarget);
    const password = fd.get("pwd-input");

    const res = await api.post(`/auth/ativar?token=${validationToken}`, {
      password: password,
    });
    const data = res;
    console.log(data);
    if (res.status == 200) {
      router.push("/login");
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
            <h2 className="text-2xl font-bold">Cadastro</h2>
            <p className="opacity-60">
              Crie uma senha segura para ativar sua conta.
            </p>
          </div>
          <form className="items-center space-y-4" onSubmit={sendLogin}>
            <div className="grid gap-2">
              <label htmlFor="pwd-input" className="font-bold">
                Senha:
              </label>
              <input
                id="pwd-input"
                name="pwd-input"
                type="password"
                className="border border-gray-300 rounded-lg p-2 bg-white transition-all duration-100 shadow-md focus:scale-105 focus:border-(--azul)"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="confirm-pwd-input" className="font-bold">
                Confirmar Senha:
              </label>
              <input
                name="confirm-pwd-input"
                id="confirm-pwd-input"
                type="password"
                className="border border-gray-300 bg-white rounded-lg p-2 cursor-pointer shadow-md focus:scale-105 transition-all duration-100"
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
            A ativação de conta é válida até <b>8 horas</b> após o recebimento
            do email.
          </p>
        </div>
      </div>
    </>
  );
}
