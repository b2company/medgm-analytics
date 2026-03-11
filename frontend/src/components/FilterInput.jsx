import React from 'react';

export const FilterSelect = ({ label, value, onChange, options, placeholder = "Todos" }) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export const FilterDateInput = ({ label, value, onChange, min, max }) => {
  // Converter DD/MM/YYYY para YYYY-MM-DD para o input type="date"
  const dateToInput = (dateStr) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  // Converter YYYY-MM-DD para DD/MM/YYYY
  const inputToDate = (inputStr) => {
    if (!inputStr) return '';
    const [year, month, day] = inputStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type="date"
        value={dateToInput(value)}
        onChange={(e) => onChange(inputToDate(e.target.value))}
        min={min}
        max={max}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
      />
    </div>
  );
};

export const FilterDateRange = ({ labelInicio = "Data Início", labelFim = "Data Fim", valueInicio, valueFim, onChangeInicio, onChangeFim }) => {
  return (
    <>
      <FilterDateInput
        label={labelInicio}
        value={valueInicio}
        onChange={onChangeInicio}
      />
      <FilterDateInput
        label={labelFim}
        value={valueFim}
        onChange={onChangeFim}
        min={valueInicio ? valueInicio.split('/').reverse().join('-') : undefined}
      />
    </>
  );
};
