import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CompanyProps {
  name: string;
  people: number;
  hi: string;
}

export const CompanyCard = ({ name, people, hi }: CompanyProps) => {
  return (
    <Link
      href="/dashboard"
      className="grid grid-cols-2 gap-4 px-4 py-2 h-full bg-white border-(--blue-icon) 
      rounded-xl hover:border-r-6 transition-all duration-100 cursor-pointer
      border-r-4 lg:border-0 active:border-r-8 lg:active:scale-95"
    >
      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="ml-auto font-semibold">Beneficiários: {people}</p>
      <p className="text-(--blue-icon) font-bold">{hi}</p>
      <ArrowRight className="ml-auto" />
    </Link>
  );
};
