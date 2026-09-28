import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../utils/constants';

const CategoryChart = ({ data, loading }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  if (loading || !data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-4 border-slate-700 border-t-primary animate-spin"></div>
      </div>
    );
  }

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <path
          d={`M ${cx} ${cy} L ${cx + outerRadius * Math.cos(-startAngle * Math.PI / 180)} ${cy + outerRadius * Math.sin(-startAngle * Math.PI / 180)} A ${outerRadius} ${outerRadius} 0 0 1 ${cx + outerRadius * Math.cos(-endAngle * Math.PI / 180)} ${cy + outerRadius * Math.sin(-endAngle * Math.PI / 180)} Z`}
          fill={fill}
          opacity={0.8}
        />
        <path
          d={`M ${cx} ${cy} L ${cx + (outerRadius + 8) * Math.cos(-startAngle * Math.PI / 180)} ${cy + (outerRadius + 8) * Math.sin(-startAngle * Math.PI / 180)} A ${outerRadius + 8} ${outerRadius + 8} 0 0 1 ${cx + (outerRadius + 8) * Math.cos(-endAngle * Math.PI / 180)} ${cy + (outerRadius + 8) * Math.sin(-endAngle * Math.PI / 180)} Z`}
          fill={fill}
          opacity={0.3}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl text-sm">
          <p className="font-semibold text-slate-200 mb-1">{payload[0].name}</p>
          <p className="text-slate-300">
            Count: <span className="font-mono text-white">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={45}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name.toLowerCase()] || COLORS.other} 
              className="transition-all duration-300"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;
