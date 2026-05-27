import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Target,
  TrendingUp,
  Activity,
  Wheat,
  Flame,
  Utensils,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Dumbbell,
  Heart,
  Zap
} from 'lucide-react';
import {
  supabase,
  type IndianFood,
  type UserIntake,
  type UserProfile,
  calculateTargetProtein,
  GOAL_MULTIPLIERS,
  GOAL_DESCRIPTIONS,
  formatNumber
} from './lib/supabase';

function App() {
  const [foods, setFoods] = useState<IndianFood[]>([]);
  const [intake, setIntake] = useState<UserIntake[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const categories = useMemo(() => {
    const cats = [...new Set(foods.map(f => f.category))];
    return ['all', ...cats.sort()];
  }, [foods]);

  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.name_hindi && food.name_hindi.includes(searchQuery));
      const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => b.protein - a.protein);
  }, [foods, searchQuery, selectedCategory]);

  useEffect(() => {
    async function loadData() {
      const { data: foodsData } = await supabase
        .from('indian_foods')
        .select('*')
        .order('protein', { ascending: false });

      if (foodsData) setFoods(foodsData);

      const { data: intakeData } = await supabase
        .from('user_intake')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (intakeData) setIntake(intakeData);
      setLoading(false);
    }
    loadData();
  }, [sessionId]);

  const totals = useMemo(() => {
    return intake.reduce((acc, item) => ({
      protein: acc.protein + item.protein_consumed,
      carbs: acc.carbs + item.carbs_consumed,
      fiber: acc.fiber + item.fiber_consumed,
      calories: acc.calories + item.calories_consumed,
    }), { protein: 0, carbs: 0, fiber: 0, calories: 0 });
  }, [intake]);

  const targetProtein = useMemo(() => {
    if (!profile) return 0;
    return calculateTargetProtein(profile.weight, profile.goal);
  }, [profile]);

  const achievement = useMemo(() => {
    if (targetProtein === 0) return 0;
    return Math.min(100, (totals.protein / targetProtein) * 100);
  }, [totals.protein, targetProtein]);

  const deficit = useMemo(() => {
    return Math.max(0, targetProtein - totals.protein);
  }, [targetProtein, totals.protein]);

  const suggestedFoods = useMemo(() => {
    if (deficit <= 0 || foods.length === 0) return [];
    const highProteinFoods = foods
      .filter(f => f.protein >= 15)
      .sort((a, b) => b.protein - a.protein)
      .slice(0, 6);
    return highProteinFoods.map(food => {
      const quantityNeeded = Math.ceil((deficit / food.protein) * 100);
      return {
        food,
        quantity: quantityNeeded,
        proteinToAdd: deficit
      };
    });
  }, [deficit, foods]);

  const addFoodToProfile = useCallback(async (profileData: UserProfile) => {
    setProfile(profileData);
    setShowProfileForm(false);
  }, []);

  const addFoodToIntake = useCallback(async (food: IndianFood, quantity: number) => {
    const newIntake: Omit<UserIntake, 'id'> = {
      food_id: food.id,
      food_name: food.name,
      quantity,
      protein_consumed: (food.protein * quantity) / 100,
      carbs_consumed: (food.carbs * quantity) / 100,
      fiber_consumed: (food.fiber * quantity) / 100,
      calories_consumed: (food.calories * quantity) / 100,
    };

    const { data, error } = await supabase
      .from('user_intake')
      .insert({ ...newIntake, session_id: sessionId })
      .select()
      .single();

    if (!error && data) {
      setIntake(prev => [data, ...prev]);
    }
  }, [sessionId]);

  const removeIntake = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('user_intake')
      .delete()
      .eq('id', id);

    if (!error) {
      setIntake(prev => prev.filter(item => item.id !== id));
    }
  }, []);

  const clearAllIntake = useCallback(async () => {
    await supabase
      .from('user_intake')
      .delete()
      .eq('session_id', sessionId);
    setIntake([]);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-emerald-200 rounded-full"></div>
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (showProfileForm) {
    return <ProfileForm onSubmit={addFoodToProfile} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Indian Protein Calculator</h1>
                <p className="text-xs text-slate-500">Track your daily nutrition</p>
              </div>
            </div>
            <button
              onClick={() => setShowProfileForm(true)}
              className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors"
            >
              Profile: {profile?.weight}kg | {profile?.age}y
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats and Intake */}
          <div className="lg:col-span-1 space-y-6">
            {/* Target Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="text-emerald-100 text-sm font-medium">Daily Protein Target</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold">{targetProtein}g</span>
                  <span className="text-emerald-200 mb-1">/{profile?.weight}kg body weight</span>
                </div>
                <p className="text-sm text-emerald-100 mt-2">
                  Goal: {profile?.goal.replace('_', ' ')} ({GOAL_MULTIPLIERS[profile?.goal || 'maintenance']}g/kg)
                </p>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-600">Achievement</span>
                  <span className="text-2xl font-bold text-slate-900">{formatNumber(achievement)}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      achievement >= 100
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : achievement >= 70
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-gradient-to-r from-rose-400 to-pink-500'
                    }`}
                    style={{ width: `${Math.min(achievement, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Nutrition Summary */}
            <div className="grid grid-cols-2 gap-4">
              <NutritionCard
                icon={<Activity className="w-5 h-5" />}
                label="Protein"
                value={formatNumber(totals.protein)}
                unit="g"
                color="emerald"
                target={targetProtein}
              />
              <NutritionCard
                icon={<Wheat className="w-5 h-5" />}
                label="Carbs"
                value={formatNumber(totals.carbs)}
                unit="g"
                color="amber"
              />
              <NutritionCard
                icon={<Sparkles className="w-5 h-5" />}
                label="Fiber"
                value={formatNumber(totals.fiber)}
                unit="g"
                color="cyan"
              />
              <NutritionCard
                icon={<Flame className="w-5 h-5" />}
                label="Calories"
                value={Math.round(totals.calories).toString()}
                unit="kcal"
                color="orange"
              />
            </div>

            {/* Today's Intake */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-slate-400" />
                  <h2 className="font-semibold text-slate-900">Today's Intake</h2>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {intake.length} items
                  </span>
                </div>
                {intake.length > 0 && (
                  <button
                    onClick={clearAllIntake}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {intake.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Utensils className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No foods added yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {intake.map(item => (
                      <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{item.food_name}</p>
                          <p className="text-xs text-slate-500">{formatNumber(item.quantity)}g | {formatNumber(item.protein_consumed)}g protein</p>
                        </div>
                        <button
                          onClick={() => removeIntake(item.id)}
                          className="ml-2 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Suggestions */}
            {deficit > 0 && suggestedFoods.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden">
                <div className="p-4 border-b border-amber-200/50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <h2 className="font-semibold text-amber-900">Protein Suggestions</h2>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">
                    You need <strong>{formatNumber(deficit)}g</strong> more protein to reach your target
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {suggestedFoods.map(({ food, quantity }) => (
                    <div key={food.id} className="bg-white/80 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{food.name}</p>
                        <p className="text-xs text-slate-600">
                          {quantity}g serving = {formatNumber((food.protein * quantity) / 100)}g protein
                        </p>
                      </div>
                      <button
                        onClick={() => addFoodToIntake(food, quantity)}
                        className="ml-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievement >= 100 && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900">Goal Achieved!</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  You've met your protein target for today. Great job!
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Food Search */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Search Header */}
              <div className="p-4 border-b border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">Indian Food Database</h2>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    {foods.length} foods
                  </span>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name (try 'paneer', 'dal', 'chicken')..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                        selectedCategory === cat
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      } capitalize`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Grid */}
              <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredFoods.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No foods found matching your search</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredFoods.map(food => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onAdd={addFoodToIntake}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Profile Form Component
function ProfileForm({ onSubmit }: { onSubmit: (profile: UserProfile) => void }) {
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState<UserProfile['goal']>('maintenance');

  const goals: { value: UserProfile['goal']; label: string; description: string; icon: React.ReactNode }[] = [
    {
      value: 'maintenance',
      label: 'Maintenance',
      description: 'General health & wellbeing',
      icon: <Heart className="w-6 h-6" />
    },
    {
      value: 'weight_loss',
      label: 'Weight Loss',
      description: 'Fat loss while preserving muscle',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      value: 'muscle_gain',
      label: 'Muscle Gain',
      description: 'Muscle building & strength',
      icon: <Dumbbell className="w-6 h-6" />
    },
    {
      value: 'athletic',
      label: 'Athletic',
      description: 'High-performance training',
      icon: <Zap className="w-6 h-6" />
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && age) {
      onSubmit({
        weight: parseFloat(weight),
        age: parseInt(age),
        goal,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Indian Protein Calculator</h1>
          <p className="text-slate-600">Calculate your daily protein needs and track your intake</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Weight Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 70"
                required
                min={30}
                max={200}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
              />
            </div>

            {/* Age Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Age (years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 25"
                required
                min={10}
                max={100}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
              />
            </div>

            {/* Goal Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Your Goal
              </label>
              <div className="grid grid-cols-2 gap-3">
                {goals.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      goal === g.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                      goal === g.value ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {g.icon}
                    </div>
                    <p className={`font-semibold ${
                      goal === g.value ? 'text-emerald-900' : 'text-slate-900'
                    }`}>{g.label}</p>
                    <p className={`text-xs mt-0.5 ${
                      goal === g.value ? 'text-emerald-600' : 'text-slate-500'
                    }`}>{g.description}</p>
                    <p className={`text-xs mt-1 font-medium ${
                      goal === g.value ? 'text-emerald-700' : 'text-slate-600'
                    }`}>
                      {GOAL_MULTIPLIERS[g.value]}g/kg protein
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <Target className="w-5 h-5" />
              Calculate My Protein Target
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Protein requirements based on International Society of Sports Nutrition guidelines
        </p>
      </div>
    </div>
  );
}

// Nutrition Card Component
function NutritionCard({
  icon,
  label,
  value,
  unit,
  color,
  target
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
  target?: number;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-4 border`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-sm opacity-70 mb-0.5">{unit}</span>
      </div>
      {target !== undefined && (
        <div className="mt-1 text-xs opacity-60">of {target}g target</div>
      )}
    </div>
  );
}

// Food Card Component
function FoodCard({ food, onAdd }: { food: IndianFood; onAdd: (food: IndianFood, qty: number) => void }) {
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(food.serving_size);

  const categoryColors: Record<string, string> = {
    dal: 'bg-amber-100 text-amber-700 border-amber-200',
    dairy: 'bg-blue-100 text-blue-700 border-blue-200',
    grain: 'bg-orange-100 text-orange-700 border-orange-200',
    vegetable: 'bg-green-100 text-green-700 border-green-200',
    meat: 'bg-rose-100 text-rose-700 border-rose-200',
    snack: 'bg-purple-100 text-purple-700 border-purple-200',
    nuts: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    sweet: 'bg-pink-100 text-pink-700 border-pink-200',
    protein: 'bg-teal-100 text-teal-700 border-teal-200',
    other: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const proteinPerServing = (food.protein * quantity) / 100;

  return (
    <div className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-all border border-slate-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 truncate">{food.name}</h3>
          {food.name_hindi && (
            <p className="text-xs text-slate-500 truncate">{food.name_hindi}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[food.category] || categoryColors.other} capitalize ml-2`}>
          {food.category}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-emerald-50 rounded-lg">
          <p className="text-lg font-bold text-emerald-600">{food.protein}g</p>
          <p className="text-xs text-emerald-600/70">Protein</p>
        </div>
        <div className="text-center p-2 bg-amber-50 rounded-lg">
          <p className="text-lg font-bold text-amber-600">{food.carbs}g</p>
          <p className="text-xs text-amber-600/70">Carbs</p>
        </div>
        <div className="text-center p-2 bg-cyan-50 rounded-lg">
          <p className="text-lg font-bold text-cyan-600">{food.fiber}g</p>
          <p className="text-xs text-cyan-600/70">Fiber</p>
        </div>
      </div>

      {showQuantitySelector ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-600 block mb-1">Quantity (grams)</label>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>10g</span>
              <span className="font-medium text-emerald-600">{quantity}g</span>
              <span>500g</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <p className="text-sm text-emerald-700">
              <strong>{formatNumber(proteinPerServing)}g</strong> protein in {quantity}g serving
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowQuantitySelector(false);
              }}
              className="flex-1 py-2 px-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onAdd(food, quantity);
                setShowQuantitySelector(false);
              }}
              className="flex-1 py-2 px-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors text-sm flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowQuantitySelector(true)}
          className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add to Today
        </button>
      )}
    </div>
  );
}

export default App;
