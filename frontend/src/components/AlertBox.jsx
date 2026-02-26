import React from 'react';

const AlertBox = ({ type = 'info', title, message }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  return (
    <div className={'rounded-lg border-2 p-4 ' + (styles[type] || styles.info)}>
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-sm opacity-75">{message}</p>
    </div>
  );
};

export default AlertBox;
