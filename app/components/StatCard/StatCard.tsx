import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface StatsProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: StatsProps) {
  return (
    <motion.div className="grid grid-cols-2 bg-white shadow-md border border-gray-200 gap-1 hover:shadow-lg/20 rounded-lg justify-end px-4 py-2 transition-all duration-100">
      <span className={`w-full font-semibold ${color}`}>{label}</span>
      <Icon className={`${color} ml-auto`} />
      <span className="w-full font-bold text-xl">{value}</span>
    </motion.div>
  );
}
