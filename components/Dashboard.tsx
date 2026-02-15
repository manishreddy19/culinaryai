
import React, { useState, useMemo } from 'react';
import { FoodLogEntry, UserProfile } from '../types';
import { calculateTargets } from '../utils/healthUtils';

interface DashboardProps {
  history: FoodLogEntry[];
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ history, profile }) => {
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Day');

  // We still calculate targets for macros, but calories are driven by caloriesGoal field
  const calculatedTargets = useMemo(() => calculateTargets(profile), [profile]);
  
  const dailyEntries = history.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString());
  
  const dailyCalories = dailyEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
  const dailyProtein = dailyEntries.reduce((sum, e) => sum + (e.macros?.protein || 0), 0);
  const dailyCarbs = dailyEntries.reduce((sum, e) => sum + (e.macros?.carbs || 0), 0);
  const dailyFat = dailyEntries.reduce((sum, e) => sum + (e.macros?.fat || 0), 0);

  const dailyWater = history
    .filter(e => e.type === 'Water' && new Date(e.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + (e.waterAmount || 0), 0);

  // Preference order for calorie goal: Manual string field -> Calculated -> Fallback
  const calGoal = parseInt(profile.caloriesGoal) || calculatedTargets.calories || 2000;
  
  const waterGoal = 2500;
  const calPercent = Math.min((dailyCalories / calGoal) * 100, 100);
  const waterPercent = Math.min((dailyWater / waterGoal) * 100, 100);

  // Dynamic Theme based on Goal
  const goalColors: Record<string, string> = {
    'Weight Loss': 'from-blue-600 to-emerald-600',
    'Muscle Gain': 'from-orange-600 to-rose-600',
    'Maintenance': 'from-slate-700 to-slate-900',
    'Athletic Performance': 'from-indigo-600 to-purple-600'
  };

  const currentTheme = goalColors[profile.healthGoals] || goalColors['Maintenance'];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className={`rounded-3xl p-6 text-white bg-gradient-to-br ${currentTheme} shadow-2xl relative overflow-hidden`}>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Current Goal</p>
          <h2 className="text-2xl font-black mb-6">{profile.healthGoals}</h2>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-4xl font-black">{dailyCalories}</span>
              <p className="text-xs font-medium opacity-70">calories consumed today</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold opacity-60">/ {calGoal}</span>
              <p className="text-xs font-medium opacity-70">daily target</p>
            </div>
          </div>

          <div className="mt-6 h-3 w-full bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
              style={{ width: `${calPercent}%` }}
            ></div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Hydration</h3>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-blue-600">{dailyWater}</span>
            <span className="text-xs font-bold text-slate-300 mb-1">ml</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${waterPercent}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Health Score</h3>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-emerald-500">8.4</span>
            <span className="text-xs font-bold text-slate-300 mb-1">/ 10</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold mt-2">↑ 12% vs last week</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Metabolic Breakdown</h3>
        <div className="space-y-5">
          <MacroProgress label="Protein" current={dailyProtein} goal={calculatedTargets.protein} color="bg-blue-500" />
          <MacroProgress label="Carbs" current={dailyCarbs} goal={calculatedTargets.carbs} color="bg-amber-500" />
          <MacroProgress label="Fat" current={dailyFat} goal={calculatedTargets.fat} color="bg-rose-500" />
        </div>
      </div>
    </div>
  );
};

const MacroProgress = ({ label, current, goal, color }: { label: string, current: number, goal: number, color: string }) => {
  const percent = Math.min((current / goal) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-700">{current} / {goal}g</span>
      </div>
      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

export default Dashboard;
