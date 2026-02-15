
import React, { useState, useRef } from 'react';
import { analyzeFood } from '../services/geminiService';
import { FoodLogEntry, MealType } from '../types';
import CameraModal from './CameraModal';

interface FoodLoggerProps {
  onLogAdded: (entry: FoodLogEntry) => void;
}

const FoodLogger: React.FC<FoodLoggerProps> = ({ onLogAdded }) => {
  const [selectedType, setSelectedType] = useState<MealType>('Breakfast');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Partial<FoodLogEntry> | null>(null);
  const [needsQuantity, setNeedsQuantity] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Water'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWaterAdd = (amount: number) => {
    const entry: FoodLogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: 'Water',
      name: 'Water',
      portion: `${amount}ml`,
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 },
      waterAmount: amount
    };
    onLogAdded(entry);
    setInput('');
  };

  const processLog = async () => {
    if (!input && !preview) return;
    setLoading(true);
    setResult(null);
    setNeedsQuantity(false);
    setAiMessage(null);
    
    let analysis;
    if (preview) {
      const base64Data = preview.split(',')[1];
      analysis = await analyzeFood({ data: base64Data, mimeType: 'image/jpeg' }, true);
    } else {
      analysis = await analyzeFood(input);
    }

    setLoading(false);

    if (analysis.success && analysis.data) {
      setResult(analysis.data);
      setNeedsQuantity(!!analysis.needsQuantity);
      setAiMessage(analysis.message || null);
    } else {
      alert("Analysis failed. Please try again.");
    }
  };

  const handleManualEdit = (field: string, value: any) => {
    if (!result) return;
    if (field === 'protein' || field === 'carbs' || field === 'fat') {
      setResult({
        ...result,
        macros: {
          ...(result.macros || { protein: 0, carbs: 0, fat: 0 }),
          [field]: Number(value) || 0
        }
      });
    } else {
      setResult({ ...result, [field]: value });
    }
  };

  const confirmLog = () => {
    if (!result) return;
    const finalEntry: FoodLogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: selectedType,
      name: result.name || 'Unknown Item',
      portion: result.portion || '1 serving',
      calories: Number(result.calories) || 0,
      macros: result.macros || { protein: 0, carbs: 0, fat: 0 },
      imageUrl: preview || undefined
    };
    onLogAdded(finalEntry);
    setResult(null);
    setInput('');
    setPreview(null);
    setAiMessage(null);
    setNeedsQuantity(false);
  };

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-500">
      {showCamera && <CameraModal onCapture={(img) => { setPreview(img); setResult(null); setShowCamera(false); }} onClose={() => setShowCamera(false)} />}
      
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {mealTypes.map(t => (
            <button
              key={t}
              onClick={() => { setSelectedType(t); setResult(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${selectedType === t ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {selectedType === 'Water' ? (
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
            <button onClick={() => handleWaterAdd(250)} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-600 font-bold hover:bg-blue-100 transition-colors">250ml Glass</button>
            <button onClick={() => handleWaterAdd(500)} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-600 font-bold hover:bg-blue-100 transition-colors">500ml Bottle</button>
            <div className="col-span-2 relative">
              <input 
                type="number" 
                placeholder="Custom ml..." 
                onKeyDown={(e) => e.key === 'Enter' && handleWaterAdd(Number((e.target as any).value))}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-center text-slate-700 font-bold focus:ring-blue-500 shadow-inner"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Describe your ${selectedType.toLowerCase()} (e.g., "2 scrambled eggs and a piece of toast")`}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 min-h-[140px] focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium placeholder:text-slate-300 resize-none transition-all shadow-inner"
              />
              {preview && (
                <div className="absolute bottom-4 right-4 w-16 h-16 rounded-xl overflow-hidden shadow-xl border-2 border-white animate-in zoom-in-50">
                   <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                   <button onClick={() => setPreview(null)} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                   </button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCamera(true)} className="flex-1 bg-white text-slate-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 border border-slate-100 shadow-sm active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Camera
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-white text-slate-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center border border-slate-100 shadow-sm active:scale-95">Gallery</button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
            </div>
            
            <button
              onClick={processLog}
              disabled={loading || (!input && !preview)}
              className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? "Analyzing..." : "Calculate Nutrition"}
            </button>
          </>
        )}
      </div>

      {result && (
        <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-2xl animate-in slide-in-from-bottom-6 duration-500 space-y-6">
          {aiMessage && (
            <div className={`p-4 rounded-2xl flex gap-3 border ${needsQuantity ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
               <div className="flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
               </div>
               <p className="text-xs font-bold leading-relaxed">{aiMessage}</p>
            </div>
          )}

          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block ml-1">Food Item Name</label>
              <input 
                type="text" 
                value={result.name || ''} 
                onChange={(e) => handleManualEdit('name', e.target.value)}
                className="text-2xl font-black text-slate-900 leading-none bg-slate-50 border-none rounded-xl p-3 focus:ring-0 w-full"
              />
              <div className="space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-widest block ml-1 ${needsQuantity ? 'text-amber-600' : 'text-slate-300'}`}>Portion / Quantity</label>
                <input 
                  type="text" 
                  value={result.portion || ''} 
                  onChange={(e) => handleManualEdit('portion', e.target.value)}
                  placeholder="e.g. 1 medium bowl, 200g"
                  className={`text-sm font-bold bg-white border-2 rounded-xl px-4 py-3 focus:ring-emerald-500 w-full transition-all ${needsQuantity ? 'border-amber-400 ring-4 ring-amber-100' : 'border-slate-100'}`}
                />
              </div>
            </div>
            <div className="bg-emerald-600 p-5 rounded-3xl shadow-lg text-center min-w-[110px] flex-shrink-0">
              <input 
                type="number" 
                value={result.calories || 0} 
                onChange={(e) => handleManualEdit('calories', e.target.value)}
                className="text-3xl font-black text-white bg-transparent border-none p-0 focus:ring-0 w-full text-center"
              />
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mt-1">kcal</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <EditableMacro label="Protein" val={result.macros?.protein} color="text-blue-600" bg="bg-blue-50" onChange={(v) => handleManualEdit('protein', v)} />
            <EditableMacro label="Carbs" val={result.macros?.carbs} color="text-amber-600" bg="bg-amber-50" onChange={(v) => handleManualEdit('carbs', v)} />
            <EditableMacro label="Fat" val={result.macros?.fat} color="text-rose-600" bg="bg-rose-50" onChange={(v) => handleManualEdit('fat', v)} />
          </div>

          <button onClick={confirmLog} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 hover:bg-black uppercase tracking-widest text-sm">
            Save to Food Diary
          </button>
        </div>
      )}
    </div>
  );
};

const EditableMacro = ({ label, val, color, bg, onChange }: any) => (
  <div className={`${bg} p-4 rounded-2xl text-center border border-transparent transition-all`}>
    <input 
      type="number" 
      value={val || 0} 
      onChange={(e) => onChange(e.target.value)}
      className={`text-xl font-black ${color} bg-transparent border-none p-0 focus:ring-0 w-full text-center`}
    />
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label} (g)</p>
  </div>
);

export default FoodLogger;
