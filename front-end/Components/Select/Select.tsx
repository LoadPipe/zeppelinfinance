// components/Select.tsx
import React, { ReactNode, ChangeEvent } from "react";

interface SelectProps {
  label: string;
  id: string;
  name: string;
  children: ReactNode;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  name,
  children,
  placeholder,
  onChange,
}) => {
  console.log(placeholder);
  return (
    <div className="text-black text-xs font-medium leading-[18px] mt-6">
      <div className="mb-2">
        <label htmlFor={id}>{label}</label>
      </div>
      <select
        className="rounded border p-4 border-neutral-300 border-opacity-60 w-full "
        id={id}
        name={name}
        onChange={onChange}
      >
        {placeholder && (
          <option disabled value="placeholder">
            {placeholder}
          </option>
        )}
        {children}
      </select>
    </div>
  );
};

export default Select;
