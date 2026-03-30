import Link from "next/link";

interface TeamCardProps {
  nome: string;
  id: string;
}

export const TeamCard = ({ nome, id }: TeamCardProps) => {
  return (
    <Link href={`/teams/${id}`} className="p-4 border border-gray-200 rounded-lg shadow-lg">
      <h2>{nome}</h2>
    </Link>
  );
};
