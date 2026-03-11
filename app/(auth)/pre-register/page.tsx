"use client";

import { LogoPositivo } from "@/app/components/Logo/LogoPositivo";
import Image from "next/image";

export default function PreRegister() {
  return (
    <>
      <div className="bg-radial from-(--azul) via-(--bg-default) to-(--azul) hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
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
          <form className="items-center space-y-4">
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
              <select
                name="select-company"
                id="select-company"
                className="border border-gray-300 bg-white rounded-lg p-2 cursor-pointer shadow-md focus:scale-105 transition-all duration-100"
              >
                <option value="" className="rounded">
                  Selecione a empresa
                </option>
                <option value="">Casa das Alianças</option>
                <option value="">Suissa</option>
              </select>
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
