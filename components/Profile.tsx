
import React from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, setProfile }) => {
  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleMacroChange = (field: keyof UserProfile['macroGoals'], value: string) => {
    const numValue = parseInt(value) || 0;
    setProfile({
      ...profile,
      macroGoals: {
        ...profile.macroGoals,
        [field]: numValue
      }
    });
  };

  const isProfileComplete = profile.weight && profile.height && profile.age;

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">{profile.name}</h2>
          {!isProfileComplete && <p className="text-rose-500 text-xs font-bold mt-1">Please complete metrics for calorie targets</p>}
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50 pb-2">Physical Metrics (Required)</h3>
          <div className="grid grid-cols-2 gap-4">
            <MetricInput label="Age" val={profile.age} onChange={(v: string) => handleChange('age', v)} />
            <MetricInput label="Height (cm)" val={profile.height} onChange={(v: string) => handleChange('height', v)} />
            <MetricInput label="Weight (kg)" val={profile.weight} onChange={(v: string) => handleChange('weight', v)} />
            <MetricInput label="Birth Date" type="date" val={profile.dob} onChange={(v: string) => handleChange('dob', v)} />
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50 pb-2">Health Strategy</h3>
          <div className="space-y-4">
            <MetricInput label="Daily Calories Goal (kcal)" val={profile.caloriesGoal} onChange={(v: string) => handleChange('caloriesGoal', v)} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase ml-1">Health Goal</label>
                <select 
                  value={profile.healthGoals} 
                  onChange={(e) => handleChange('healthGoals', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Athletic Performance">Athletic Performance</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase ml-1">Activity Level</label>
                <select 
                  value={profile.activityLevel} 
                  onChange={(e) => handleChange('activityLevel', e.target.value as any)}
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Sedentary">Sedentary (Office worker)</option>
                  <option value="Light">Light (1-2 days active)</option>
                  <option value="Moderate">Moderate (3-5 days active)</option>
                  <option value="Active">Active (6-7 days active)</option>
                  <option value="Very Active">Very Active (Intense training)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Macro Target Overrides</h3>
            <span className="text-[9px] font-bold text-slate-300 italic">Optional manual setup</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <MetricInput label="Protein (g)" val={profile.macroGoals.protein.toString()} onChange={(v: string) => handleMacroChange('protein', v)} />
            <MetricInput label="Carbs (g)" val={profile.macroGoals.carbs.toString()} onChange={(v: string) => handleMacroChange('carbs', v)} />
            <MetricInput label="Fat (g)" val={profile.macroGoals.fat.toString()} onChange={(v: string) => handleMacroChange('fat', v)} />
          </div>
        </section>
      </div>
    </div>
  );
};

const MetricInput = ({ label, val, onChange, type = "text" }: any) => (
  <div>
    <label className="text-[10px] font-bold text-slate-300 uppercase ml-1">{label}</label>
    <input 
      type={type} 
      value={val} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner" 
    />
  </div>
);

export default Profile;
