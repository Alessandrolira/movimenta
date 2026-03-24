export const Input = ({
  id,
  type,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  type: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <input
      name={id}
      id={id}
      type={type}
      placeholder={placeholder}
      className="w-full border border-gray-200 shadow-sm rounded-xl items-center px-4 py-2 hover:bg-gray-50 focus:scale-102 transition-all bg-white"
    />
  );
};
