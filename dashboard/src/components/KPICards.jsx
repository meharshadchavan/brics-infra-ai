import React from 'react';
import { AlertTriangle, MapPin, TrendingUp, AlertOctagon } from 'lucide-react';

const KPICards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-4 h-24 animate-pulse border border-slate-700/50"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Total Reports */}
      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition-colors">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <TrendingUp size={14} className="text-primary" />
          <span className="text-xs font-medium">Total Reports</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100">{stats?.totalReports?.toLocaleString() || '0'}</span>
          <span className="text-[10px] font-medium text-success flex items-center">
            +12% <TrendingUp size={10} className="ml-0.5" />
          </span>
        </div>
      </div>

      {/* Critical Hotspots */}
      <div className="bg-slate-800/60 rounded-xl p-3 border border-danger/30 relative overflow-hidden group hover:bg-slate-800 transition-colors">
        <div className="absolute top-0 right-0 w-16 h-16 bg-danger/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <AlertOctagon size={14} className="text-danger" />
          <span className="text-xs font-medium">Critical Hotspots</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-danger">{stats?.criticalHotspots || '0'}</span>
          <div className="w-2 h-2 rounded-full bg-danger pulse-red ml-1"></div>
        </div>
      </div>

      {/* Districts Covered */}
      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition-colors">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <MapPin size={14} className="text-success" />
          <span className="text-xs font-medium">Districts Covered</span>
        </div>
        <div className="text-xl font-bold text-slate-100">
          {stats?.districtsCovered || '0'}
        </div>
      </div>

      {/* Avg Urgency */}
      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition-colors">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <AlertTriangle size={14} className="text-warning" />
          <span className="text-xs font-medium">Avg Urgency</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-xl font-bold text-warning">{stats?.avgUrgency?.toFixed(1) || '0.0'}</span>
          <span className="text-xs text-slate-500 mb-1">/ 5.0</span>
        </div>
      </div>
    </div>
  );
};

export default KPICards;
