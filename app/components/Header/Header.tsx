"use client"

import { LogoPositivo } from "../Logo/LogoPositivo";
import { deleteAuthCookie } from "@/services/cookies";
import { Sidebar } from "@/app/components/Sidebar/Sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function Header() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <header className="flex justify-between items-center bg-(--branco) px-8 py-4 border-b border-gray-300 shadow-sm">
            <LogoPositivo direction="horizontal"/>
            {isSidebarOpen ? (
                <Sidebar onClose={() => setIsSidebarOpen(false)}/>
            ) : (
                <Menu onClick={() => setIsSidebarOpen(true)} className="cursor-pointer" />
            )}
        </header>
    )
}