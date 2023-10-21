import React, { ChangeEvent } from "react";

interface InputProps {
  label: string;
  id: string;
  name: string;
  type: string;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  name,
  type,
  placeholder,
  onChange,
}) => {
  return (
    <div className="mt-6">
      <div className="mb-2 text-black text-xs font-medium ">
        <label htmlFor={id}>{label}</label>
      </div>

      <input
        className="w-full rounded p-4 border border-neutral-300 border-opacity-60 "
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
