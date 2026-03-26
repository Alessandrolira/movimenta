"use client";
import { LogoPositivo } from "@/app/components/Logo/LogoPositivo";
import { BsDoorOpen } from "react-icons/bs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { setAuthCookie } from "@/services/cookies";

export default function Login() {
  const router = useRouter();


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
    console.log(data);
    if (res.status == 200) {
      await setAuthCookie(data.data.token);
      console.log("Redirecionando...");
      router.push("/dashboard");
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
                className="border border-gray-300 rounded-lg bg-white p-2 cursor-pointer shadow-md focus:scale-105 transition-all duration-100"
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
                className="border border-gray-300 rounded-lg p-2 bg-white cursor-pointer shadow-md focus:scale-105 transition-all duration-100"
              />
            </div>
            <button
              type="submit"
              className="bg-(--azul) text-white w-full rounded-lg p-2 flex items-center justify-center gap-4 cursor-pointer transtion-all duration-100 active:scale-95"
            >
              Entrar <BsDoorOpen />
            </button>
          </form>
          <p className="opacity-60">
            Sem acesso? Entre em contato com a sua corretora.
          </p>
        </div>
      </div>
    </>
  );
}
