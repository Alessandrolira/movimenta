import Link from "next/link";

export const Sidebar = () => {
    const menuItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Empresas", href: "/companies" },
        { label: "Equipes", href: "/teams" },
    ];
    return (
        <aside>
            <p>Menu</p>
            <div>
                {menuItems.map((items) => (
                    <Link href={items.href}>{items.label}</Link>
                ))}
            </div>
        </aside>
    )
}