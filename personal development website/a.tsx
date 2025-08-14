import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Brain, 
  Heart, 
  TrendingUp, 
  BookOpen, 
  Timer, 
  Zap, 
  Award,
  CheckCircle,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Flame,
  Star,
  Activity,
  Sun,
  Moon,
  Coffee,
  Lightbulb
} from 'lucide-react';

const LifeOptimizationPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [habits, setHabits] = useState([
    { id: 1, name: 'Morning Meditation', streak: 7, completed: true, category: 'wellness' },
    { id: 2, name: 'Read 30 minutes', streak: 12, completed: false, category: 'learning' },
    { id: 3, name: 'Exercise', streak: 5, completed: true, category: 'fitness' },
    { id: 4, name: 'Drink 8 glasses water', streak: 3, completed: false, category: 'health' }
  ]);
  
  const [goals, setGoals] = useState([
    { id: 1, title: 'Learn React Advanced Patterns', progress: 65, deadline: '2025-08-15', milestones: 4 },
    { id: 2, title: 'Run 10K Marathon', progress: 30, deadline: '2025-09-01', milestones: 6 },
    { id: 3, title: 'Read 24 Books This Year', progress: 45, deadline: '2025-12-31', milestones: 12 }
  ]);

  const [mood, setMood] = useState({ current: 8, trend: 'improving' });
  const [focusTimer, setFocusTimer] = useState({ minutes: 25, seconds: 0, isActive: false, mode: 'focus' });
  const [newHabit, setNewHabit] = useState('');

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (focusTimer.isActive && (focusTimer.minutes > 0 || focusTimer.seconds > 0)) {
      interval = setInterval(() => {
        setFocusTimer(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            return { ...prev, isActive: false };
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusTimer.isActive, focusTimer.minutes, focusTimer.seconds]);

  const toggleHabit = (id) => {
    setHabits(habits.map(habit => 
      habit.id === id 
        ? { ...habit, completed: !habit.completed, streak: habit.completed ? habit.streak : habit.streak + 1 }
        : habit
    ));
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits([...habits, {
        id: Date.now(),
        name: newHabit,
        streak: 0,
        completed: false,
        category: 'personal'
      }]);
      setNewHabit('');
    }
  };

  const aiInsights = [
    "🎯 Your goal completion rate improved 23% this week! Keep building on this momentum.",
    "🧘 Consider extending meditation to 15 minutes - your mood scores are highest on meditation days.",
    "📚 You're 3 days ahead on reading goals! Perfect time to tackle that challenging book.",
    "⚡ Your energy peaks at 10 AM - schedule important tasks during this window.",
    "🌱 Adding a gratitude practice could boost your mood scores by an estimated 15%."
  ];

  const moodEmojis = ['😢', '😞', '😐', '🙂', '😊', '😄', '🤩', '✨', '🚀', '🌟'];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'habits', label: 'Habits', icon: CheckCircle },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'mood', label: 'Mood', icon: Heart },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'focus', label: 'Focus', icon: Timer }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                LifeFlow AI
              </h1>
            </motion.div>
            
            <nav className="flex space-x-1 bg-purple-100/50 rounded-2xl p-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white text-purple-600 shadow-lg' 
                        : 'text-purple-500 hover:text-purple-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden md:block text-sm font-medium">{tab.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-2">Good morning! 🌅</h2>
                <p className="text-gray-600">Ready to make today amazing?</p>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Current Streak', value: '7 days', icon: Flame, color: 'from-orange-500 to-red-500' },
                  { label: 'Goals Progress', value: '68%', icon: Target, color: 'from-green-500 to-emerald-500' },
                  { label: 'Mood Score', value: '8.2/10', icon: Heart, color: 'from-pink-500 to-rose-500' },
                  { label: 'Focus Time', value: '2.5hrs', icon: Timer, color: 'from-blue-500 to-indigo-500' }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                      <p className="text-gray-600">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* AI Insights */}
              <motion.div variants={itemVariants} className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <Lightbulb className="w-6 h-6" />
                  <h3 className="text-xl font-bold">AI Insights & Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {aiInsights.slice(0, 3).map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="bg-white/20 rounded-lg p-3 backdrop-blur-sm"
                    >
                      {insight}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('focus')}
                  className="bg-white/70 rounded-2xl p-6 text-left border border-purple-100 hover:border-purple-300 transition-all"
                >
                  <Timer className="w-8 h-8 text-purple-500 mb-3" />
                  <h4 className="font-bold text-gray-800">Start Focus Session</h4>
                  <p className="text-gray-600 text-sm">25-minute Pomodoro timer</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('mood')}
                  className="bg-white/70 rounded-2xl p-6 text-left border border-purple-100 hover:border-purple-300 transition-all"
                >
                  <Heart className="w-8 h-8 text-pink-500 mb-3" />
                  <h4 className="font-bold text-gray-800">Log Mood</h4>
                  <p className="text-gray-600 text-sm">Track your emotional state</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('habits')}
                  className="bg-white/70 rounded-2xl p-6 text-left border border-purple-100 hover:border-purple-300 transition-all"
                >
                  <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
                  <h4 className="font-bold text-gray-800">Check Habits</h4>
                  <p className="text-gray-600 text-sm">Mark today's progress</p>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Habits Tab */}
          {activeTab === 'habits' && (
            <motion.div
              key="habits"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Daily Habits</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    placeholder="Add new habit..."
                    className="px-4 py-2 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addHabit}
                    className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>

              <div className="grid gap-4">
                {habits.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    variants={itemVariants}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-white/70 rounded-2xl p-6 border-2 transition-all ${
                      habit.completed ? 'border-green-300 bg-green-50/50' : 'border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleHabit(habit.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            habit.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-purple-500'
                          }`}
                        >
                          {habit.completed && <CheckCircle className="w-4 h-4" />}
                        </motion.button>
                        <div>
                          <h3 className={`font-semibold ${habit.completed ? 'text-green-800' : 'text-gray-800'}`}>
                            {habit.name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">{habit.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Flame className="w-5 h-5 text-orange-500" />
                          <span className="font-bold text-orange-600">{habit.streak}</span>
                        </div>
                        {habit.streak >= 7 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-yellow-400 rounded-full p-1"
                          >
                            <Award className="w-4 h-4 text-yellow-800" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Goals & Milestones</h2>
              </motion.div>

              <div className="space-y-6">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/70 rounded-2xl p-6 border border-purple-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{goal.title}</h3>
                        <p className="text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{goal.progress}%</div>
                        <div className="text-sm text-gray-600">{goal.milestones} milestones</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{goal.progress}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {Array.from({ length: goal.milestones }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            i < Math.floor((goal.progress / 100) * goal.milestones)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Mood Tab */}
          {activeTab === 'mood' && (
            <motion.div
              key="mood"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Mood Tracking</h2>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white/70 rounded-2xl p-8 border border-purple-200 text-center"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-6">How are you feeling today?</h3>
                <div className="flex justify-center space-x-3 mb-6">
                  {moodEmojis.map((emoji, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setMood({ ...mood, current: index + 1 })}
                      className={`text-3xl p-3 rounded-full transition-all ${
                        mood.current === index + 1 
                          ? 'bg-purple-100 ring-4 ring-purple-300' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
                <div className="text-6xl font-bold text-purple-600">{mood.current}/10</div>
                <p className="text-gray-600 mt-2">
                  Your mood is {mood.trend === 'improving' ? '📈 improving' : '📊 stable'} this week
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white"
              >
                <h4 className="font-bold text-lg mb-3">Emotional Intelligence Insights</h4>
                <div className="space-y-2 text-sm">
                  <p>🎯 Your energy levels peak around 10 AM - perfect for challenging tasks!</p>
                  <p>💤 Consider winding down 1 hour earlier for better mood consistency.</p>
                  <p>🤝 Social interactions boost your mood by an average of 1.3 points.</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Learning Tab */}
          {activeTab === 'learn' && (
            <motion.div
              key="learn"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Learning Progress</h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  variants={itemVariants}
                  className="bg-white/70 rounded-2xl p-6 border border-purple-200"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold text-gray-800">Reading Goals</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Books This Year</span>
                        <span>11/24</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full w-11/24" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Daily Reading</span>
                        <span>22/30 min</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-3/4" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="bg-white/70 rounded-2xl p-6 border border-purple-200"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-xl font-bold text-gray-800">Skills Development</h3>
                  </div>
                  <div className="space-y-3">
                    {['React Mastery', 'Design Systems', 'TypeScript'].map((skill, index) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-gray-700">{skill}</span>
                        <div className="flex space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < 3 + index ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white"
              >
                <h4 className="font-bold text-lg mb-3">AI Learning Recommendations</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <h5 className="font-semibold mb-2">📚 Suggested Reading</h5>
                    <p className="text-sm">"Atomic Habits" - Perfect for your current growth phase</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <h5 className="font-semibold mb-2">🎯 Skill Focus</h5>
                    <p className="text-sm">Advanced React patterns - You're ready for the next level</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <h5 className="font-semibold mb-2">⏰ Optimal Learning</h5>
                    <p className="text-sm">10-11 AM sessions show 40% better retention</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Focus Tab */}
          {activeTab === 'focus' && (
            <motion.div
              key="focus"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Focus & Meditation</h2>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pomodoro Timer */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-white/70 rounded-2xl p-8 border border-purple-200 text-center"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Focus Timer</h3>
                  <div className="mb-8">
                    <motion.div
                      className="text-8xl font-bold text-purple-600 mb-4"
                      animate={{ scale: focusTimer.isActive ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 1, repeat: focusTimer.isActive ? Infinity : 0 }}
                    >
                      {String(focusTimer.minutes).padStart(2, '0')}:
                      {String(focusTimer.seconds).padStart(2, '0')}
                    </motion.div>
                    <p className="text-gray-600 capitalize">{focusTimer.mode} Session</p>
                  </div>
                  
                  <div className="flex justify-center space-x-4 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFocusTimer(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 ${
                        focusTimer.isActive 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {focusTimer.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      <span>{focusTimer.isActive ? 'Pause' : 'Start'}</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFocusTimer({ minutes: 25, seconds: 0, isActive: false, mode: 'focus' })}
                      className="px-6 py-3 rounded-xl bg-gray-500 text-white hover:bg-gray-600 font-semibold flex items-center space-x-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Reset</span>
                    </motion.button>
                  </div>

                  <div className="flex justify-center space-x-2">
                    {['focus', 'break', 'long-break'].map(mode => (
                      <motion.button
                        key={mode}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const minutes = mode === 'focus' ? 25 : mode === 'break' ? 5 : 15;
                          setFocusTimer({ minutes, seconds: 0, isActive: false, mode });
                        }}
                        className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                          focusTimer.mode === mode 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {mode.replace('-', ' ')}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Meditation Options */}
                <motion.div 
                  variants={itemVariants}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-gray-800">Meditation Sessions</h3>
                  
                  {[
                    { name: 'Morning Mindfulness', duration: '10 min', icon: Sun, color: 'from-yellow-400 to-orange-500' },
                    { name: 'Midday Reset', duration: '5 min', icon: Coffee, color: 'from-blue-400 to-indigo-500' },
                    { name: 'Evening Wind-down', duration: '15 min', icon: Moon, color: 'from-purple-400 to-indigo-600' }
                  ].map((session, index) => {
                    const IconComponent = session.icon;
                    return (
                      <motion.button
                        key={session.name}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, rotateY: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white/70 rounded-2xl p-6 border border-purple-200 text-left hover:border-purple-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${session.color} rounded-xl flex items-center justify-center`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{session.name}</h4>
                              <p className="text-gray-600">{session.duration}</p>
                            </div>
                          </div>
                          <Play className="w-6 h-6 text-purple-500" />
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>

              {/* Focus Stats */}
              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white"
              >
                <h4 className="font-bold text-lg mb-4">Today's Focus Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">2.5</div>
                    <div className="text-green-100">Hours Focused</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">6</div>
                    <div className="text-green-100">Sessions Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">85%</div>
                    <div className="text-green-100">Productivity Score</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LifeOptimizationPlatform;
