import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface TeamCardProps {
  nome: string;
  id: string;
  analistas: string[]
}

export const TeamCard = ({ nome, id, analistas }: TeamCardProps) => {
  return (
    <Link
      href={`/teams/${id}`}
      className="flex justify-between items-center px-4 py-2 h-full bg-white border-(--blue-icon)
      p-4 rounded-lg shadow-lg hover:border-r-4 transition-all duration-100"
    >
      <h2 className="text-2xl font-bold">{nome}</h2>
      <ChevronRight />
    </Link>
  );
};
