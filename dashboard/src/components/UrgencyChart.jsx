import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { URGENCY_COLORS } from '../utils/constants';

const UrgencyChart = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-4 border-slate-700 border-t-primary animate-spin"></div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl text-sm">
          <p className="font-semibold text-slate-200 mb-1">Urgency Level {label}</p>
          <p className="text-slate-300">
            Reports: <span className="font-mono text-white">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis 
          dataKey="level" 
          stroke="#64748b" 
          fontSize={11} 
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis 
          stroke="#64748b" 
          fontSize={11} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.5 }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={URGENCY_COLORS[entry.level] || '#64748b'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default UrgencyChart;
