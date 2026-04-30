"use client";

import { deleteAuthCookie } from "@/services/cookies";
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  X,
  BanknoteArrowUp,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onClose: () => void;
}

const menuItems = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Empresas", href: "/companies", Icon: Building2 },
  { label: "Equipes", href: "/teams", Icon: Users },
  { label: "Sinistralidade", href: "/loss-ratio", Icon: BanknoteArrowUp },
];

export const Sidebar = ({ onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
      />

      {/* Drawer */}
      <motion.nav
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 z-50 h-full w-72 bg-(--azul) flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <p className="font-bold text-xl text-white tracking-wide">Menu</p>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Nav items */}
        <ul className="flex flex-col gap-1 px-4 pt-6 flex-1">
          {menuItems.map((item, i) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.25 }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? "bg-white text-(--azul) shadow-sm"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <item.Icon
                    className={`h-5 w-5 shrink-0 ${isActive ? "text-(--blue-icon)" : "opacity-80"}`}
                  />
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="active-dot"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-(--blue-icon)"
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {/* Footer / Logout */}
        <div className="px-4 pb-6 pt-4 border-t border-white/10">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              deleteAuthCookie("token");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sair da conta
          </motion.button>
        </div>
      </motion.nav>
    </>
  );
};
