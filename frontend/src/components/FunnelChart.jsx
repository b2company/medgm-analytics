import React from 'react';

const FunnelChart = ({ data }) => {
  if (!data || data.length === 0) return <div>Sem dados</div>;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-2">
      {data.map((item, idx) => {
        const width = (item.value / maxValue) * 100;
        const conversion = idx > 0 ? ((item.value / data[idx-1].value) * 100).toFixed(1) : 100;
        
        return (
          <div key={idx} className="relative">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">{item.name}</div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div 
                    className="bg-primary h-full flex items-center justify-center text-white text-sm font-bold transition-all duration-500"
                    style={{ width: width + '%' }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
              <div className="w-20 text-sm text-gray-600">
                {conversion}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FunnelChart;
