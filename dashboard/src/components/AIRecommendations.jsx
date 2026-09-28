import React from 'react';
import { AlertCircle, CheckCircle, ChevronRight, BarChart2 } from 'lucide-react';

const AIRecommendations = ({ recommendations, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 animate-pulse h-40"></div>
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
        <CheckCircle size={32} className="mb-2 opacity-50" />
        <p>No immediate recommendations</p>
      </div>
    );
  }

  const handleApprove = (id) => {
    // Show toast or interaction logic in real app
    console.log("Approved recommendation:", id);
  };

  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => {
        const isCritical = rec.priority >= 90;
        const isHigh = rec.priority >= 70 && rec.priority < 90;
        
        let priorityColor = 'text-success border-success/30 bg-success/10';
        let barColor = 'bg-success';
        
        if (isCritical) {
          priorityColor = 'text-danger border-danger/30 bg-danger/10';
          barColor = 'bg-danger pulse-red';
        } else if (isHigh) {
          priorityColor = 'text-warning border-warning/30 bg-warning/10';
          barColor = 'bg-warning';
        }

        return (
          <div 
            key={rec.id} 
            className="bg-slate-800/60 rounded-xl border border-slate-700/80 p-4 hover:border-slate-600 transition-colors animate-in slide-in-from-right-4 fade-in duration-500"
            style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  {rec.district}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <BarChart2 size={12} /> {rec.category} • {rec.complaints} reports
                </p>
              </div>
              <div className={`px-2 py-1 rounded-md border text-xs font-bold flex items-center gap-1 ${priorityColor}`}>
                {isCritical && <AlertCircle size={12} />}
                {rec.priority}
              </div>
            </div>

            {/* Urgency Bar */}
            <div className="w-full h-1.5 bg-slate-700 rounded-full mb-3 overflow-hidden">
              <div className={`h-full ${barColor}`} style={{ width: `${rec.priority}%` }}></div>
            </div>

            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50 mb-3">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{rec.justification}"
              </p>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {rec.budgetStatus}
              </span>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200 transition-colors"
                >
                  Review
                </button>
                <button 
                  onClick={() => handleApprove(rec.id)}
                  className="px-3 py-1.5 rounded bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  Approve <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AIRecommendations;
