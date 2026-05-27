import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type IndianFood = {
  id: string;
  name: string;
  name_hindi: string | null;
  protein: number;
  carbs: number;
  fiber: number;
  calories: number;
  category: string;
  serving_size: number;
};

export type UserIntake = {
  id: string;
  food_id: string;
  food_name: string;
  quantity: number;
  protein_consumed: number;
  carbs_consumed: number;
  fiber_consumed: number;
  calories_consumed: number;
};

export type UserProfile = {
  weight: number;
  age: number;
  goal: 'maintenance' | 'muscle_gain' | 'weight_loss' | 'athletic';
};

export const GOAL_MULTIPLIERS = {
  maintenance: 0.8,
  muscle_gain: 1.6,
  weight_loss: 1.2,
  athletic: 1.8,
} as const;

export const GOAL_DESCRIPTIONS = {
  maintenance: 'General health and wellbeing',
  muscle_gain: 'Muscle building and strength',
  weight_loss: 'Fat loss while preserving muscle',
  athletic: 'High-performance athletic training',
} as const;

export function calculateTargetProtein(weight: number, goal: UserProfile['goal']): number {
  return Math.round(weight * GOAL_MULTIPLIERS[goal]);
}

export function formatNumber(num: number): string {
  return num.toFixed(1);
}
