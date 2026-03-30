import { Dot } from "lucide-react";

export default function LoadingUI() {
  return (
    <div className="bg-black/80 backdrop-blur-[2px] flex flex-col h-screen absolute items-center justify-center inset-0 z-50 p-4 md:p-16">
      <div className="grid grid-cols-12">
        {Array.from({ length: 144 }).map((_, i) => (
          <Dot
            key={i}
            className={`load text-(--light-gray) ${i}`}
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
