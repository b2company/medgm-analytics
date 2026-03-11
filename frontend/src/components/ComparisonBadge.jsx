import React from 'react';

const ComparisonBadge = ({ value, showSign = true, size = 'md' }) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getColor = () => {
    if (isPositive) return 'bg-green-100 text-green-800';
    if (isNegative) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getIcon = () => {
    if (isPositive) {
      return (
        <svg className={`${iconSizes[size]} mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
    if (isNegative) {
      return (
        <svg className={`${iconSizes[size]} mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    return (
      <svg className={`${iconSizes[size]} mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  const displayValue = Math.abs(value).toFixed(1);
  const sign = showSign && isPositive ? '+' : '';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${getColor()}`}>
      {getIcon()}
      {sign}{displayValue}%
    </span>
  );
};

export default ComparisonBadge;
