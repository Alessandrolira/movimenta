"use client";

import { LogoPositivo } from "../Logo/LogoPositivo";
import { Sidebar } from "@/app/components/Sidebar/Sidebar";
import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { deleteAuthCookie } from "@/services/cookies";

export default function Header({ role }: { role: "USER" | "ADMIN" }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAdmin = role === "ADMIN";

  return (
    <>
      <header className="flex justify-between items-center bg-(--branco) px-8 py-4 border-b border-gray-300 shadow-sm">
        <LogoPositivo direction="horizontal" />
        {isAdmin && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="cursor-pointer rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu />
          </button>
        )}

        {/* Logout */}
        {!isAdmin && (
          <button
            onClick={() => {
              deleteAuthCookie("token");
              window.location.href = "/login";
            }}
            className="cursor-pointer rounded-lg hover:bg-red-200 hover:text-red-600 transition-colors flex items-center gap-1 p-1 text-gray-500"
          >
            <LogOut />
          </button>
        )}
        {/* O botão de logout é visível para todos os usuários, mas a lógica de logout só é executada quando clicado */}
      </header>

      {isAdmin && (
        <AnimatePresence>
          {isSidebarOpen && <Sidebar onClose={() => setIsSidebarOpen(false)} />}
        </AnimatePresence>
      )}
    </>
  );
}
