
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Water';

export interface UserProfile {
  name: string;
  email: string;
  contact: string;
  age: string;
  dob: string;
  height: string;
  weight: string;
  healthGoals: string;
  allergies: string;
  activityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active';
  caloriesGoal: string; // New field for overall calorie target
  macroGoals: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
}

export interface FoodLogEntry {
  id: string;
  timestamp: number;
  type: MealType;
  name: string;
  portion: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
  waterAmount?: number; // in ml
}

export interface Recipe {
  title: string;
  cuisine: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: { item: string; amount: string; imagePrompt?: string }[];
  instructions: string[];
  nutritionPerServing: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  finalImagePrompt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
