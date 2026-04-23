export const Input = ({
  id,
  type,
  placeholder,
  value,
  onChange,
  onKeyDown,
  error,
  required,
}: {
  id: string;
  type: string;
  placeholder?: string;
  value?: string | number | readonly string[] | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: boolean;
  required?: boolean;
}) => {
  return (
    <input
      name={id}
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      required={required}
      className={`w-full border shadow-sm rounded-xl items-center px-4 py-2 hover:bg-gray-50 focus:scale-102 focus:outline-none transition-all bg-white ${
        error ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-200"
      }`}
    />
  );
};
