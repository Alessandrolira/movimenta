import Link from "next/link";
import { LogoPositivo } from "../Logo/LogoPositivo";

export default function Header() {
    return (
        <header className="flex justify-between items-center bg-(--branco) px-8 py-4 border-b border-gray-300 shadow-sm">
            <LogoPositivo direction="horizontal"/>
            <Link href="/" className="font-semibold ">Sair</Link>
        </header>
    )
}