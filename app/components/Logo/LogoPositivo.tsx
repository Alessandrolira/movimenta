import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  direction?: string;
}

export const LogoPositivo = ({ direction }: LogoProps) => (
  <Link href="/dashboard">
    <Image
      src={`/logo_${direction}_positivo.png`}
      height={100}
      width={100}
      alt="logo-img"
    />
  </Link>
);
