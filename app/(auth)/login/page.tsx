"use client";
import { LogoPositivo } from "@/app/components/Logo/LogoPositivo";
import { BsDoorOpen } from "react-icons/bs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { setAuthCookie } from "@/services/cookies";
import { useTransition } from "react";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const sendLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fd = new FormData(event.currentTarget);
    const email = fd.get("email-input");
    const password = fd.get("pwd-input");

    const res = await api.post("/auth/login", {
      login: email,
      password: password,
    });
    const data = res;
    if (res.status == 200) {
      await setAuthCookie(data.data.token);
      console.log("Redirecionando...");
      startTransition(() => {
        router.push("/dashboard");
      });
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
      <div className="flex-1 flex items-center justify-center p-8 bg-(--bg-default)">
        <div className="flex flex-col gap-8 justify-center w-full max-w-md">
          <div className="flex gap-4 items-center lg:hidden">
            <LogoPositivo direction="horizontal" />
            <h1 className="text-2xl font-semibold hidden lg:block">
              MoviMenta
            </h1>
          </div>
          <div className="grid gap-2 border-b border-gray-400 pb-2">
            <h2 className="text-2xl font-bold">Bem-vindo de volta</h2>
            <p className="opacity-60">
              Entre com suas credenciais para acessar o painel
            </p>
          </div>
          <form className="items-center space-y-4" onSubmit={sendLogin}>
            <div className="grid gap-2">
              <label htmlFor="email-input" className="font-bold">
                E-mail
              </label>
              <input
                id="email-input"
                name="email-input"
                type="email"
                className="border border-gray-300 rounded-lg bg-white p-2 shadow-md focus:scale-105 transition-all duration-100"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="pwd-input" className="font-bold">
                Senha
              </label>
              <input
                id="pwd-input"
                name="pwd-input"
                type="password"
                className="border border-gray-300 rounded-lg p-2 bg-white shadow-md focus:scale-105 transition-all duration-100"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="bg-(--azul) text-white w-full rounded-lg p-2 flex items-center justify-center gap-4 cursor-pointer transtion-all duration-100 active:scale-95"
            >
              {isPending ? (
                "Carregando"
              ) : (
                <>
                  Entrar <BsDoorOpen />
                </>
              )}
            </button>
          </form>
          <div className="flex items-center gap-3 text-sm text-(--cinza)">
            <div className="flex-1 h-px bg-gray-300" />
            <Link
              href={"/forget-password"}
              className="whitespace-nowrap text-(--azul) font-medium hover:text-(--azul-escuro) hover:underline underline-offset-4 transition-colors duration-150"
            >
              Esqueceu sua senha?
            </Link>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
          <p className="opacity-60 text-center">
            Sem acesso? Entre em contato com a sua corretora.
          </p>
        </div>
      </div>
    </>
  );
}
