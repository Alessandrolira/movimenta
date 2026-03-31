import { deleteAuthCookie } from "@/services/cookies";
import { X } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  onClose: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const menuItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Empresas", href: "/companies" },
    { label: "Equipes", href: "/teams" },
  ];
  return (
    <nav className="absolute top-0 right-0 bg-(--blue-icon) w-64 h-full shadow-lg p-6 flex flex-col justify-between">
      <div className="flex flex-col justify-between gap-8">
        <div className="flex justify-between items-center">
          <p className="font-bold text-2xl text-(--branco)">Menu</p>
          <button onClick={onClose}>
            <X className="text-(--branco) cursor-pointer" />
          </button>
        </div>
        <ul className="space-y-6">
          {menuItems.map((items) => (
            <li
              className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-md/20 hover:bg-gray-200 active:inset-shadow-sm/20 active:shadow-none cursor-pointer transition-all duration-100"
              key={items.href}
            >
              <Link href={items.href}>{items.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button
          onClick={() => {
            deleteAuthCookie("token");
            window.location.href = "/login";
          }}
          className="bg-(--red-btn) border border-red-800 w-full text-(--branco) py-2 px-4 rounded-md cursor-pointer hover:text-(--branco) active:inset-shadow-sm/60 active:inset-shadow-red-900 transition-all duration-100"
        >
          Sair
        </button>
      </div>
    </nav>
  );
};
