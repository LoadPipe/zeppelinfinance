"use client";
import React, { ChangeEvent } from "react";

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-5 w-5 text-blue-600"
      />
      <span className="text-neutral-800 text-base font-normal leading-normal0">
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
