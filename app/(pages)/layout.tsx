import Header from "../components/Header/Header";
export default function PageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="bg-(--bg-default)">
      <Header />
      {children}
    </main>
  );
}
