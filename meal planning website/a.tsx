import React, { useState, useEffect } from 'react';
import { 
  ChefHat, Calendar, ShoppingCart, Target, Clock, Users, 
  Plus, Heart, Star, Filter, TrendingUp, BarChart3, 
  Utensils, Scale, MapPin, Share2, Settings, Search,
  CheckCircle, AlertCircle, Zap, Trophy, BookOpen
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const MealPlanningPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: 'Sarah Chen',
    goal: 'weight-loss',
    cookingSkill: 'intermediate',
    budget: 120,
    dietaryRestrictions: ['vegetarian', 'gluten-free'],
    preferences: ['mediterranean', 'asian']
  });
  const [mealPlan, setMealPlan] = useState([]);
  const [groceryList, setGroceryList] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [nutritionData, setNutritionData] = useState([]);

  // Mock data
  const mockRecipes = [
    {
      id: 1,
      name: 'Mediterranean Quinoa Bowl',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      calories: 420,
      protein: 15,
      carbs: 58,
      fat: 12,
      rating: 4.8,
      tags: ['vegetarian', 'gluten-free', 'mediterranean'],
      ingredients: [
        { name: 'Quinoa', amount: 1, unit: 'cup' },
        { name: 'Cherry tomatoes', amount: 200, unit: 'g' },
        { name: 'Cucumber', amount: 1, unit: 'piece' },
        { name: 'Red onion', amount: 0.5, unit: 'piece' },
        { name: 'Feta cheese', amount: 100, unit: 'g' },
        { name: 'Olive oil', amount: 3, unit: 'tbsp' }
      ],
      instructions: [
        'Rinse quinoa and cook in vegetable broth for 15 minutes',
        'Dice cucumber, tomatoes, and red onion',
        'Whisk olive oil with lemon juice and herbs',
        'Combine quinoa with vegetables and dressing',
        'Top with crumbled feta and serve'
      ],
      nutritionGoals: { protein: 'high', fiber: 'high', sodium: 'low' }
    },
    {
      id: 2,
      name: 'Asian Lettuce Wraps',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      cookTime: 15,
      servings: 3,
      difficulty: 'Easy',
      calories: 280,
      protein: 12,
      carbs: 18,
      fat: 8,
      rating: 4.6,
      tags: ['vegetarian', 'low-carb', 'asian'],
      ingredients: [
        { name: 'Butter lettuce', amount: 1, unit: 'head' },
        { name: 'Mushrooms', amount: 250, unit: 'g' },
        { name: 'Water chestnuts', amount: 100, unit: 'g' },
        { name: 'Green onions', amount: 3, unit: 'pieces' },
        { name: 'Soy sauce', amount: 2, unit: 'tbsp' },
        { name: 'Sesame oil', amount: 1, unit: 'tbsp' }
      ],
      instructions: [
        'Separate lettuce leaves and wash carefully',
        'Sauté mushrooms until golden brown',
        'Add water chestnuts and green onions',
        'Season with soy sauce and sesame oil',
        'Serve mixture in lettuce cups'
      ],
      nutritionGoals: { calories: 'low', vegetables: 'high' }
    },
    {
      id: 3,
      name: 'Roasted Vegetable Pasta',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
      cookTime: 35,
      servings: 6,
      difficulty: 'Medium',
      calories: 380,
      protein: 14,
      carbs: 65,
      fat: 9,
      rating: 4.7,
      tags: ['vegetarian', 'mediterranean'],
      ingredients: [
        { name: 'Gluten-free pasta', amount: 400, unit: 'g' },
        { name: 'Zucchini', amount: 2, unit: 'pieces' },
        { name: 'Bell peppers', amount: 2, unit: 'pieces' },
        { name: 'Eggplant', amount: 1, unit: 'piece' },
        { name: 'Olive oil', amount: 4, unit: 'tbsp' },
        { name: 'Parmesan cheese', amount: 50, unit: 'g' }
      ],
      instructions: [
        'Preheat oven to 425°F (220°C)',
        'Chop vegetables into bite-sized pieces',
        'Toss vegetables with olive oil and seasonings',
        'Roast for 25 minutes until tender',
        'Cook pasta according to package directions',
        'Combine pasta with roasted vegetables and cheese'
      ],
      nutritionGoals: { fiber: 'high', vegetables: 'high' }
    }
  ];

  const mockNutritionData = [
    { day: 'Mon', calories: 1650, protein: 85, carbs: 180, fat: 65, target: 1600 },
    { day: 'Tue', calories: 1580, protein: 92, carbs: 165, fat: 58, target: 1600 },
    { day: 'Wed', calories: 1720, protein: 88, carbs: 195, fat: 72, target: 1600 },
    { day: 'Thu', calories: 1620, protein: 95, carbs: 170, fat: 62, target: 1600 },
    { day: 'Fri', calories: 1540, protein: 78, carbs: 155, fat: 55, target: 1600 },
    { day: 'Sat', calories: 1680, protein: 90, carbs: 185, fat: 68, target: 1600 },
    { day: 'Sun', calories: 1610, protein: 87, carbs: 175, fat: 60, target: 1600 }
  ];

  const macroData = [
    { name: 'Protein', value: 25, color: '#8b5cf6' },
    { name: 'Carbs', value: 45, color: '#06d6a0' },
    { name: 'Fat', value: 30, color: '#f59e0b' }
  ];

  const mockInventory = [
    { name: 'Quinoa', amount: 2, unit: 'cups', expires: '2024-08-15', status: 'good' },
    { name: 'Olive oil', amount: 500, unit: 'ml', expires: '2024-12-01', status: 'good' },
    { name: 'Cherry tomatoes', amount: 150, unit: 'g', expires: '2024-07-25', status: 'expiring' },
    { name: 'Feta cheese', amount: 80, unit: 'g', expires: '2024-07-22', status: 'expiring' }
  ];

  const mockGroceryList = [
    { name: 'Cucumber', amount: 2, unit: 'pieces', price: 1.50, checked: false },
    { name: 'Red onion', amount: 1, unit: 'piece', price: 0.80, checked: true },
    { name: 'Butter lettuce', amount: 1, unit: 'head', price: 2.20, checked: false },
    { name: 'Mushrooms', amount: 500, unit: 'g', price: 3.50, checked: false }
  ];

  useEffect(() => {
    setNutritionData(mockNutritionData);
    setInventory(mockInventory);
    setGroceryList(mockGroceryList);
    generateMealPlan();
  }, []);

  const generateMealPlan = () => {
    const plan = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach((day, index) => {
      plan.push({
        day,
        breakfast: mockRecipes[index % 3],
        lunch: mockRecipes[(index + 1) % 3],
        dinner: mockRecipes[(index + 2) % 3]
      });
    });
    
    setMealPlan(plan);
  };

  const toggleGroceryItem = (index) => {
    const updated = [...groceryList];
    updated[index].checked = !updated[index].checked;
    setGroceryList(updated);
  };

  const scaleRecipe = (recipe, newServings) => {
    const scale = newServings / recipe.servings;
    return {
      ...recipe,
      servings: newServings,
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        amount: (ing.amount * scale).toFixed(1)
      }))
    };
  };

  const RecipeCard = ({ recipe, onClick }) => (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
      onClick={() => onClick(recipe)}
    >
      <div className="relative">
        <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover" />
        <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg">
          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
        </div>
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
          {recipe.cookTime} min
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{recipe.name}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{recipe.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>{recipe.calories} cal</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const RecipeModal = ({ recipe, onClose }) => {
    const [servings, setServings] = useState(recipe.servings);
    const scaledRecipe = scaleRecipe(recipe, servings);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <img src={recipe.image} alt={recipe.name} className="w-full h-64 object-cover rounded-t-2xl" />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{recipe.name}</h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-5 h-5" />
                    <span>{recipe.cookTime} minutes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span>{recipe.rating}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add to Plan
                </button>
                <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Ingredients</h3>
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-gray-500" />
                      <input 
                        type="number" 
                        value={servings}
                        onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border rounded text-center"
                        min="1"
                      />
                      <span className="text-gray-500">servings</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {scaledRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-gray-600">{ingredient.amount} {ingredient.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(recipe.calories * servings / recipe.servings)}</div>
                    <div className="text-sm text-gray-600">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{Math.round(recipe.protein * servings / recipe.servings)}g</div>
                    <div className="text-sm text-gray-600">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(recipe.carbs * servings / recipe.servings)}g</div>
                    <div className="text-sm text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{Math.round(recipe.fat * servings / recipe.servings)}g</div>
                    <div className="text-sm text-gray-600">Fat</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Instructions</h3>
                <div className="space-y-3">
                  {recipe.instructions.map((step, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">Good morning, {userProfile.name}! 🌅</h2>
        <p className="opacity-90">Today's goal: Stay under 1,600 calories while hitting your protein target</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <div className="text-2xl font-bold">1,485</div>
            <div className="text-sm opacity-90">Calories today</div>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <div className="text-2xl font-bold">85g</div>
            <div className="text-sm opacity-90">Protein</div>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm opacity-90">Days streak</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Weekly Nutrition Progress
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={nutritionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="calories" stroke="#f59e0b" strokeWidth={3} />
              <Line type="monotone" dataKey="target" stroke="#6b7280" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Macro Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Today's Meal Plan
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => {
            const recipe = mockRecipes[index];
            return (
              <div key={meal} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-600 mb-2">{meal}</h4>
                <img src={recipe.image} alt={recipe.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                <h5 className="font-bold mb-1">{recipe.name}</h5>
                <div className="text-sm text-gray-600 flex justify-between">
                  <span>{recipe.calories} cal</span>
                  <span>{recipe.cookTime} min</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const MealPlanTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Weekly Meal Plan</h2>
        <div className="flex gap-3">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Generate New Plan
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {mealPlan.map((day, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              {day.day}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { meal: 'Breakfast', recipe: day.breakfast },
                { meal: 'Lunch', recipe: day.lunch },
                { meal: 'Dinner', recipe: day.dinner }
              ].map(({ meal, recipe }) => (
                <div key={meal} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => setSelectedRecipe(recipe)}>
                  <h4 className="font-semibold text-gray-600 mb-2">{meal}</h4>
                  <img src={recipe.image} alt={recipe.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                  <h5 className="font-bold mb-2">{recipe.name}</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Calories:</span>
                      <span>{recipe.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cook time:</span>
                      <span>{recipe.cookTime} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RecipesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recipe Collection</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search recipes..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'Vegetarian', 'Gluten-Free', 'Mediterranean', 'Asian', 'Quick & Easy'].map(filter => (
          <button key={filter} className="bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 px-4 py-2 rounded-full transition-colors">
            {filter}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRecipes.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            onClick={setSelectedRecipe}
          />
        ))}
      </div>
    </div>
  );

  const GroceryTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Smart Grocery List</h2>
        <div className="flex gap-3">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Find Stores
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            Shopping List
          </h3>
          <div className="space-y-3">
            {groceryList.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${item.checked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleGroceryItem(index)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                  >
                    {item.checked && <CheckCircle className="w-3 h-3 text-white" />}
                  </button>
                  <div>
                    <div className={`font-medium ${item.checked ? 'line-through text-gray-500' : ''}`}>
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.amount} {item.unit}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${item.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span>${groceryList.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600">
              {groceryList.filter(item => item.checked).length} of {groceryList.length} items completed
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Kitchen Inventory
          </h3>
          <div className="space-y-3">
            {inventory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.amount} {item.unit}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Expires: {item.expires}
                  </div>
                  {item.status === 'expiring' && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">Expiring soon</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const NutritionTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Nutrition Tracking</h2>
        <div className="flex gap-3">
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Goals
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Reports
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4">Today's Intake</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Calories</span>
                <span>1,485 / 1,600</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '93%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Protein</span>
                <span>85g / 120g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '71%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Carbs</span>
                <span>165g / 200g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Fat</span>
                <span>58g / 70g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4">Weekly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={nutritionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="protein" fill="#8b5cf6" />
              <Bar dataKey="carbs" fill="#06d6a0" />
              <Bar dataKey="fat" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold mb-4">Health Insights</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-green-800">Great Progress!</span>
            </div>
            <p className="text-green-700 text-sm">You've maintained your calorie goals for 5 days straight.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-blue-800">Protein Boost</span>
            </div>
            <p className="text-blue-700 text-sm">Consider adding more protein to reach your muscle building goals.</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-yellow-800">Meal Timing</span>
            </div>
            <p className="text-yellow-700 text-sm">Try eating your largest meal earlier in the day for better metabolism.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NutriPlan AI</h1>
                <p className="text-sm text-gray-500">Smart meal planning made simple</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>Goal: {userProfile.goal.replace('-', ' ')}</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'meal-plan', label: 'Meal Plan', icon: Calendar },
              { id: 'recipes', label: 'Recipes', icon: ChefHat },
              { id: 'grocery', label: 'Grocery', icon: ShoppingCart },
              { id: 'nutrition', label: 'Nutrition', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'meal-plan' && <MealPlanTab />}
        {activeTab === 'recipes' && <RecipesTab />}
        {activeTab === 'grocery' && <GroceryTab />}
        {activeTab === 'nutrition' && <NutritionTab />}
      </main>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  );
};

export default MealPlanningPlatform;
