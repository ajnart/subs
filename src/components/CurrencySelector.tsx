import React from 'react';

interface CurrencySelectorProps {
  id: string;
  name: string;
  currencies: string[];
  required?: boolean;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  id,
  name,
  currencies,
  required,
  value,
  onChange,
  className,
}) => {
  return (
    <select
      id={id}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      className={`form-select block w-full mt-1 ${className} rounded-lg bg-gray-700 text-white p-2`}
    >
      {currencies.map((currency) => (
        <option key={currency} value={currency}>
          {currency}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;
