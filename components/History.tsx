
import React from 'react';
import { FoodLogEntry } from '../types';

interface HistoryProps {
  history: FoodLogEntry[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold heading-font text-slate-800">Your History</h2>
        <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
            {history.length} Entries
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400">No logs yet. Start by adding a meal!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex gap-4 animate-in slide-in-from-left-4 duration-300">
              {entry.imageUrl ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                  <img src={entry.imageUrl} alt={entry.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800 leading-tight">{entry.name}</h3>
                  <span className="text-emerald-600 font-bold text-sm whitespace-nowrap ml-2">{entry.calories} kcal</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{entry.portion} • {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <div className="flex gap-2">
                   <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">P: {entry.macros.protein}g</div>
                   <div className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded uppercase">C: {entry.macros.carbs}g</div>
                   <div className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase">F: {entry.macros.fat}g</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
