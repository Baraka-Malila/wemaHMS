import React, { useState, FormEvent } from 'react';

type InputProps = {
  label: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  name: string;
};

const CustomInput: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  icon,
  value,
  onChange,
  error,
  name,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`block w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-red-500' : ''}`}
          autoComplete="off"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

const CustomButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
}) => {
  const baseClasses =
    'w-full py-3 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses =
    variant === 'primary'
      ? 'bg-[#4A90E2] text-white hover:bg-[#357ABD] focus:ring-[#4A90E2]'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
};

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
};

const CustomCheckbox: React.FC<CheckboxProps> = ({ label, checked, onChange, id }) => {
  return (
    <label htmlFor={id} className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-[#4A90E2] focus:ring-[#4A90E2] border-gray-300 rounded"
      />
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
};

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
    </div>
  );
};

export { CustomInput, CustomButton, CustomCheckbox, LoadingSpinner };
