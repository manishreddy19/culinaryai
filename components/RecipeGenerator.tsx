
import React, { useState } from 'react';
import { generateRecipe, generateImage, readText } from '../services/geminiService';
import { Recipe } from '../types';

interface RecipeGeneratorProps {
  onSaveRecipe: (recipe: Recipe) => void;
  savedRecipes: Recipe[];
  onDeleteRecipe: (title: string) => void;
}

const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ onSaveRecipe, savedRecipes, onDeleteRecipe }) => {
  const [query, setQuery] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [ingredientImages, setIngredientImages] = useState<Record<string, string>>({});
  const [view, setView] = useState<'Explore' | 'Saved'>('Explore');
  
  // Cooking Mode States
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [cookingStepIndex, setCookingStepIndex] = useState(0);

  const cuisines = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Mediterranean', 'Fusion', 'Vegan'];

  const handleSearch = async (e?: React.FormEvent | string) => {
    if (e && typeof e !== 'string') e.preventDefault();
    
    const searchTerm = typeof e === 'string' ? e : query;
    if (!searchTerm.trim()) return;

    setLoading(true);
    setRecipe(null);
    setFinalImage(null);
    setIngredientImages({});
    setView('Explore');
    setIsCookingMode(false);
    
    if (typeof e === 'string') setQuery(e);

    const result = await generateRecipe(searchTerm);
    if (result) {
      setRecipe(result);
      generateImage(result.finalImagePrompt || result.title).then(setFinalImage);
      
      result.ingredients.forEach(ing => {
        generateImage(`high quality ingredient photo of ${ing.imagePrompt || ing.item}`).then(img => {
          if (img) setIngredientImages(prev => ({ ...prev, [ing.item]: img }));
        });
      });
    }
    setLoading(false);
  };

  const handleReadFull = () => {
    if (!recipe) return;
    const fullText = `Cooking ${recipe.title}. Ingredients needed: ${recipe.ingredients.map(i => `${i.amount} of ${i.item}`).join(', ')}. Instructions: ${recipe.instructions.join('. ')}`;
    readText(fullText);
  };

  const handleReadStep = (index: number) => {
    if (!recipe) return;
    const stepText = `Step ${index + 1}: ${recipe.instructions[index]}`;
    readText(stepText);
  };

  const startCooking = () => {
    setCookingStepIndex(0);
    setIsCookingMode(true);
    if (recipe) handleReadStep(0);
  };

  const exitCooking = () => {
    setIsCookingMode(false);
  };

  const nextStep = () => {
    if (recipe && cookingStepIndex < recipe.instructions.length - 1) {
      const nextIdx = cookingStepIndex + 1;
      setCookingStepIndex(nextIdx);
      handleReadStep(nextIdx);
    }
  };

  const prevStep = () => {
    if (cookingStepIndex > 0) {
      const prevIdx = cookingStepIndex - 1;
      setCookingStepIndex(prevIdx);
      handleReadStep(prevIdx);
    }
  };

  const isSaved = recipe && savedRecipes.some(r => r.title === recipe.title);

  const selectSavedRecipe = (r: Recipe) => {
    setRecipe(r);
    setFinalImage(null);
    generateImage(r.finalImagePrompt || r.title).then(setFinalImage);
    const newIngredientImages: Record<string, string> = {};
    r.ingredients.forEach(ing => {
        generateImage(`high quality ingredient photo of ${ing.imagePrompt || ing.item}`).then(img => {
          if (img) setIngredientImages(prev => ({ ...prev, [ing.item]: img }));
        });
    });
    setView('Explore');
    setIsCookingMode(false);
  };

  // Cooking Mode View Component
  if (isCookingMode && recipe) {
    const progress = ((cookingStepIndex + 1) / recipe.instructions.length) * 100;

    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-right duration-500">
        {/* Visual Progress Bar at the absolute top edge */}
        <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-100 z-[110]">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-in-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <header className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white mt-1.5">
          <button onClick={exitCooking} className="text-slate-400 font-bold flex items-center gap-2 hover:text-slate-600 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
             Exit
          </button>
          <div className="text-center">
            <h1 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cooking Mode</h1>
            <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{recipe.title}</p>
          </div>
          <div className="w-10"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-center text-center">
           <div className="mb-8 space-y-4">
             <div className="flex justify-center items-center gap-1.5 mb-8">
                {recipe.instructions.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-500 ${i === cookingStepIndex ? 'w-12 bg-emerald-500 shadow-md' : i < cookingStepIndex ? 'w-2 bg-emerald-200' : 'w-2 bg-slate-200'}`}
                  />
                ))}
             </div>
             <div className="space-y-4">
                <span className="inline-block px-5 py-2 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                  Step {cookingStepIndex + 1} of {recipe.instructions.length}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight px-4 min-h-[200px] flex items-center justify-center tracking-tight">
                  {recipe.instructions[cookingStepIndex]}
                </h2>
             </div>
           </div>

           <button 
             onClick={() => handleReadStep(cookingStepIndex)}
             className="mx-auto w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all mb-12 border-4 border-white hover:bg-emerald-100 hover:shadow-emerald-200"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
             </svg>
           </button>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={prevStep}
              disabled={cookingStepIndex === 0}
              className="py-6 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-30 flex items-center justify-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button 
              onClick={nextStep}
              disabled={cookingStepIndex === recipe.instructions.length - 1}
              className="py-6 bg-emerald-600 text-white rounded-2xl font-black shadow-xl active:scale-95 disabled:bg-slate-300 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
            >
              Next Step
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex justify-between items-center px-2">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipe Progress</span>
                <span className="text-sm font-black text-slate-800">{Math.round(progress)}% Completed</span>
             </div>
             {cookingStepIndex === recipe.instructions.length - 1 && (
                <button 
                  onClick={exitCooking}
                  className="px-10 py-3.5 bg-emerald-600 text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-colors shadow-lg animate-pulse"
                >
                  Finish 🎉
                </button>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Sub-navigation */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
        <button 
          onClick={() => setView('Explore')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${view === 'Explore' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Explore
        </button>
        <button 
          onClick={() => setView('Saved')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${view === 'Saved' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Saved Recipes ({savedRecipes.length})
        </button>
      </div>

      {view === 'Explore' ? (
        <>
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-5">
              <h2 className="text-3xl font-black heading-font leading-tight tracking-tight">Gourmet Explorer</h2>
              
              <form onSubmit={handleSearch} className="flex gap-2 bg-slate-800 rounded-2xl p-2 border border-slate-700 shadow-inner">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for recipes..."
                  className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder:text-slate-500 font-bold"
                />
                <button type="submit" className="bg-emerald-500 p-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                {cuisines.map(c => (
                  <button 
                    key={c} 
                    onClick={() => handleSearch(c)} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${query === c ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32"></div>
          </div>

          {loading && (
            <div className="p-10 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 font-bold animate-pulse">AI is crafting your culinary masterpiece...</p>
            </div>
          )}

          {recipe && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="relative aspect-video bg-slate-100">
                  {finalImage ? (
                    <img src={finalImage} alt={recipe.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-emerald-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Generating Visual...</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button 
                      onClick={startCooking}
                      className="bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl active:scale-90 transition-all flex items-center gap-2 font-bold hover:bg-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Cook
                    </button>
                    <button 
                      onClick={() => onSaveRecipe(recipe)}
                      disabled={isSaved}
                      className={`px-5 py-4 rounded-full shadow-2xl active:scale-90 transition-all flex items-center gap-2 font-bold ${isSaved ? 'bg-slate-200 text-slate-500' : 'bg-white text-emerald-600 hover:bg-slate-50'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isSaved ? 'fill-emerald-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
                
                <div className="p-8 space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-black heading-font text-slate-800 leading-tight tracking-tight">{recipe.title}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{recipe.cuisine}</span>
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{recipe.difficulty}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-emerald-600 leading-none">{recipe.nutritionPerServing.calories}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">kcal / serving</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-50">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Prep Time</p>
                      <p className="font-black text-slate-700 text-sm mt-1">{recipe.prepTime}</p>
                    </div>
                    <div className="text-center border-x border-slate-50">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Cook Time</p>
                      <p className="font-black text-slate-700 text-sm mt-1">{recipe.cookTime}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Servings</p>
                      <p className="font-black text-slate-700 text-sm mt-1">{recipe.servings}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                      Ingredients List
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {recipe.ingredients.map((ing, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2 group transition-all hover:bg-white hover:shadow-lg">
                          <div className="aspect-square rounded-xl bg-slate-200 mb-3 overflow-hidden">
                            {ingredientImages[ing.item] ? (
                              <img src={ingredientImages[ing.item]} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                 <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                          <div className="px-2 pb-2">
                            <p className="text-xs font-black text-slate-800 leading-tight mb-1">{ing.item}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{ing.amount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                      Step-by-Step Instructions
                    </h4>
                    <div className="space-y-8">
                      {recipe.instructions.map((step, idx) => (
                        <div key={idx} className="flex gap-5 group">
                          <div className="flex-shrink-0">
                            <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-lg group-hover:bg-emerald-600 transition-colors">
                              {idx + 1}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed pt-2 border-b border-slate-50 pb-4 flex-1">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-800 heading-font">Saved Masterpieces</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{savedRecipes.length} recipes</p>
          </div>

          {savedRecipes.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className="text-slate-400 font-bold">No saved recipes yet. Start exploring!</p>
              <button 
                onClick={() => setView('Explore')}
                className="mt-6 text-emerald-600 font-black text-sm uppercase tracking-widest hover:text-emerald-700 transition-colors"
              >
                Go to Explore →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedRecipes.map((r) => (
                <div 
                  key={r.title} 
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all cursor-pointer"
                  onClick={() => selectSavedRecipe(r)}
                >
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-black text-slate-800 truncate pr-2">{r.title}</h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRecipe(r.title);
                        }}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-black uppercase text-slate-400">{r.cuisine}</span>
                      <span className="text-[10px] font-black uppercase text-emerald-500">{r.nutritionPerServing.calories} kcal</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
