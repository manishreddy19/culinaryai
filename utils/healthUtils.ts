
import { UserProfile } from "../types";

export const calculateTargets = (profile: UserProfile) => {
  const weight = parseFloat(profile.weight);
  const height = parseFloat(profile.height);
  const age = parseFloat(profile.age);

  // Default fallback if data is missing
  if (isNaN(weight) || isNaN(height) || isNaN(age)) {
    return {
        calories: parseInt(profile.caloriesGoal) || 2000,
        protein: profile.macroGoals.protein,
        carbs: profile.macroGoals.carbs,
        fat: profile.macroGoals.fat
    };
  }

  // Mifflin-St Jeor Equation (Approximate)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  
  const activityMultipliers = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.55,
    'Active': 1.725,
    'Very Active': 1.9
  };

  const tdee = bmr * activityMultipliers[profile.activityLevel || 'Moderate'];
  
  let targetCals = tdee;
  if (profile.healthGoals === 'Weight Loss') targetCals -= 500;
  if (profile.healthGoals === 'Muscle Gain') targetCals += 350;

  // Use manual override if present
  if (profile.caloriesGoal && parseInt(profile.caloriesGoal) > 0) {
    targetCals = parseInt(profile.caloriesGoal);
  }

  // Simple macro split based on goal
  let proteinRatio = 0.25;
  let carbRatio = 0.50;
  let fatRatio = 0.25;

  if (profile.healthGoals === 'Muscle Gain') {
    proteinRatio = 0.35;
    carbRatio = 0.45;
    fatRatio = 0.20;
  } else if (profile.healthGoals === 'Weight Loss') {
    proteinRatio = 0.30;
    carbRatio = 0.40;
    fatRatio = 0.30;
  }

  return {
    calories: Math.round(targetCals),
    protein: Math.round((targetCals * proteinRatio) / 4),
    carbs: Math.round((targetCals * carbRatio) / 4),
    fat: Math.round((targetCals * fatRatio) / 9)
  };
};
