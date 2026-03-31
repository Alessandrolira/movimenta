"use client";
import { LogoPositivo } from "@/app/components/Logo/LogoPositivo";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useState, useTransition } from "react";
import Link from "next/link";

type Step = "email" | "code" | "password";

export default function ForgetPassword() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSendEmail = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const emailValue = fd.get("email") as string;

    try {
      await api.post("/auth/forgot-password", { email: emailValue });
      setEmail(emailValue);
      setStep("code");
    } catch {
      setError("Não foi possível enviar o e-mail. Verifique e tente novamente.");
    }
  };

  const handleVerifyCode = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const codeValue = fd.get("code") as string;

    try {
      await api.post("/auth/verify-code", { email, code: codeValue });
      setCode(codeValue);
      setStep("password");
    } catch {
      setError("Código inválido ou expirado. Verifique e tente novamente.");
    }
  };

  const handleResetPassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const newPassword = fd.get("new-password") as string;
    const confirmPassword = fd.get("confirm-password") as string;

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      await api.post("/auth/reset-password", { email, code, newPassword });
      startTransition(() => {
        router.push("/login");
      });
    } catch {
      setError("Não foi possível redefinir a senha. Tente novamente.");
    }
  };

  const inputClass =
    "border border-gray-300 rounded-lg bg-white p-2 shadow-md focus:scale-105 transition-all duration-100 w-full";
  const buttonClass =
    "bg-(--azul) text-white w-full rounded-lg p-2 flex items-center justify-center gap-4 cursor-pointer transition-all duration-100 active:scale-95 disabled:opacity-60";

  return (
    <>
      <div className="bg-radial from-(--azul) via-blue-400 to-(--azul) hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        <div>
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
          </div>

          {step === "email" && (
            <>
              <div className="grid gap-2 border-b border-gray-400 pb-2">
                <h2 className="text-2xl font-bold">Recuperar senha</h2>
                <p className="opacity-60">
                  Informe seu e-mail e enviaremos um código de verificação.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleSendEmail}>
                <div className="grid gap-2">
                  <label htmlFor="email" className="font-bold">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={inputClass}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className={buttonClass}>
                  Enviar código
                </button>
              </form>
            </>
          )}

          {step === "code" && (
            <>
              <div className="grid gap-2 border-b border-gray-400 pb-2">
                <h2 className="text-2xl font-bold">Verificar código</h2>
                <p className="opacity-60">
                  Insira o código de 6 dígitos enviado para{" "}
                  <span className="font-semibold text-(--texto)">{email}</span>.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleVerifyCode}>
                <div className="grid gap-2">
                  <label htmlFor="code" className="font-bold">
                    Código de verificação
                  </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="\d{6}"
                    placeholder="000000"
                    required
                    className={inputClass}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className={buttonClass}>
                  Verificar código
                </button>
                <button
                  type="button"
                  className="text-blue-500 hover:underline text-sm w-full text-center"
                  onClick={() => {
                    setError("");
                    setStep("email");
                  }}
                >
                  Reenviar ou trocar e-mail
                </button>
              </form>
            </>
          )}

          {step === "password" && (
            <>
              <div className="grid gap-2 border-b border-gray-400 pb-2">
                <h2 className="text-2xl font-bold">Nova senha</h2>
                <p className="opacity-60">
                  Crie uma nova senha para sua conta.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div className="grid gap-2">
                  <label htmlFor="new-password" className="font-bold">
                    Nova senha
                  </label>
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="confirm-password" className="font-bold">
                    Confirmar nova senha
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    className={inputClass}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={isPending}
                  className={buttonClass}
                >
                  {isPending ? "Salvando..." : "Redefinir senha"}
                </button>
              </form>
            </>
          )}

          <div className="flex items-center gap-3 text-sm text-(--cinza)">
            <div className="flex-1 h-px bg-gray-300" />
            <Link
              href="/login"
              className="whitespace-nowrap text-(--azul) font-medium hover:text-(--azul-escuro) hover:underline underline-offset-4 transition-colors duration-150"
            >
              Voltar para o login
            </Link>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
        </div>
      </div>
    </>
  );
}
