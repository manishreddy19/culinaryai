
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import FoodLogger from './components/FoodLogger';
import RecipeGenerator from './components/RecipeGenerator';
import Assistant from './components/Assistant';
import History from './components/History';
import Profile from './components/Profile';
import { FoodLogEntry, UserProfile, Recipe } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [history, setHistory] = useState<FoodLogEntry[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Jane Doe',
    email: 'jane@example.com',
    contact: '',
    age: '28',
    dob: '1996-05-15',
    height: '170',
    weight: '65',
    healthGoals: 'Maintenance',
    allergies: '',
    activityLevel: 'Moderate',
    caloriesGoal: '2200',
    macroGoals: {
      protein: 150,
      carbs: 250,
      fat: 70,
      calories: 2200
    }
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('culinary_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedRecipesLocal = localStorage.getItem('culinary_saved_recipes');
    if (savedRecipesLocal) setSavedRecipes(JSON.parse(savedRecipesLocal));
    
    const savedProfile = localStorage.getItem('culinary_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      // Migration for new caloriesGoal field
      if (parsed.caloriesGoal === undefined) {
        parsed.caloriesGoal = parsed.macroGoals?.calories?.toString() || '2200';
      }
      // Ensure macroGoals exist for older saves
      if (!parsed.macroGoals) {
        parsed.macroGoals = { protein: 150, carbs: 250, fat: 70, calories: 2200 };
      }
      setProfile(parsed);
    }
    
    const session = localStorage.getItem('culinary_session');
    if (session) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('culinary_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('culinary_saved_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    localStorage.setItem('culinary_profile', JSON.stringify(profile));
  }, [profile]);

  const handleLogin = (user: { email: string; name: string }) => {
    setProfile({ ...profile, email: user.email, name: user.name || profile.name });
    setIsLoggedIn(true);
    localStorage.setItem('culinary_session', 'true');
  };

  const addLogEntry = (entry: FoodLogEntry) => {
    setHistory(prev => [entry, ...prev]);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    setSavedRecipes(prev => {
      if (prev.find(r => r.title === recipe.title)) return prev;
      return [recipe, ...prev];
    });
  };

  const handleDeleteRecipe = (title: string) => {
    setSavedRecipes(prev => prev.filter(r => r.title !== title));
  };

  if (!isLoggedIn) return <Auth onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard history={history} profile={profile} />;
      case 'log': return <FoodLogger onLogAdded={addLogEntry} />;
      case 'recipes': return <RecipeGenerator onSaveRecipe={handleSaveRecipe} savedRecipes={savedRecipes} onDeleteRecipe={handleDeleteRecipe} />;
      case 'assistant': return <Assistant profile={profile} />;
      case 'history': return <History history={history} />;
      case 'profile': return <Profile profile={profile} setProfile={setProfile} />;
      default: return <Dashboard history={history} profile={profile} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
