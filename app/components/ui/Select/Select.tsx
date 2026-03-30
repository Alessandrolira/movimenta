"use client";

import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  id: string;
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
}

export const CustomSelect = ({
  id,
  label,
  options,
  value,
  onChange,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o select se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* O Botão (Trigger) */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-full border border-gray-200 shadow-sm rounded-xl flex justify-between items-center px-4 hover:bg-gray-50 focus:scale-102 transition-all bg-white"
      >
        <span
          className={`block min-w-0 flex-1 truncate text-left ${selectedOption ? "text-black" : "text-gray-500"}`}
        >
          {selectedOption ? selectedOption.label : label}
        </span>
        <ChevronDown
          className={`ml-2 shrink-0 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
          size={20}
        />
      </button>

      {/* A Lista (Dropdown) */}
      {isOpen && (
        <ul className="absolute z-10 w-full mt-2 border border-gray-200 shadow-lg rounded-lg bg-white py-1 max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm transition-colors"
            >
              {option.label}
              {value === option.value && (
                <Check size={16} className="text-blue-600" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
