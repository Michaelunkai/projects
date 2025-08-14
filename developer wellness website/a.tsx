import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Eye, 
  Timer, 
  TrendingUp, 
  Heart, 
  Brain, 
  Zap, 
  Moon, 
  Coffee,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Monitor,
  Headphones,
  Dumbbell,
  Target,
  Award,
  Bell,
  Settings,
  ChevronRight,
  BarChart3,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';

const DevWellnessPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [focusTimer, setFocusTimer] = useState(25 * 60); // 25 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [postureScore, setPostureScore] = useState(78);
  const [eyeStrainLevel, setEyeStrainLevel] = useState(32);
  const [stressLevel, setStressLevel] = useState(45);
  const [todayScreenTime, setTodayScreenTime] = useState(6.5);
  const [breaksTaken, setBreaksTaken] = useState(4);
  const [ambientSound, setAmbientSound] = useState('rain');
  const timerRef = useRef(null);

  // Sample data for charts
  const productivityData = [
    { time: '9:00', focus: 85, energy: 90, stress: 20 },
    { time: '10:00', focus: 92, energy: 85, stress: 15 },
    { time: '11:00', focus: 78, energy: 75, stress: 35 },
    { time: '12:00', focus: 65, energy: 60, stress: 45 },
    { time: '13:00', focus: 45, energy: 70, stress: 25 },
    { time: '14:00', focus: 88, energy: 85, stress: 20 },
    { time: '15:00', focus: 95, energy: 90, stress: 15 },
    { time: '16:00', focus: 82, energy: 80, stress: 30 }
  ];

  const sleepCorrelationData = [
    { date: 'Mon', sleep: 7.5, performance: 85 },
    { date: 'Tue', sleep: 6.2, performance: 72 },
    { date: 'Wed', sleep: 8.1, performance: 94 },
    { date: 'Thu', sleep: 5.8, performance: 68 },
    { date: 'Fri', sleep: 7.8, performance: 88 },
    { date: 'Sat', sleep: 9.2, performance: 96 },
    { date: 'Sun', sleep: 8.5, performance: 91 }
  ];

  const postureData = [
    { name: 'Good Posture', value: 65, color: '#10B981' },
    { name: 'Neutral', value: 25, color: '#F59E0B' },
    { name: 'Poor Posture', value: 10, color: '#EF4444' }
  ];

  // Timer functionality
  useEffect(() => {
    if (isTimerRunning && focusTimer > 0) {
      timerRef.current = setTimeout(() => {
        setFocusTimer(focusTimer - 1);
      }, 1000);
    } else if (focusTimer === 0) {
      setIsTimerRunning(false);
      // Trigger break reminder
      alert('Time for a break! Stand up and stretch for 5 minutes.');
    }
    return () => clearTimeout(timerRef.current);
  }, [isTimerRunning, focusTimer]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate real-time data updates
      setPostureScore(prev => Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 4)));
      setEyeStrainLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 6)));
      setStressLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 3)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setFocusTimer(25 * 60);
  };

  const WellnessCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
    </div>
  );

  const exercises = [
    { name: "Neck Rolls", duration: "30s", description: "Gentle circular neck movements" },
    { name: "Shoulder Shrugs", duration: "20s", description: "Lift shoulders to ears, hold, release" },
    { name: "Wrist Circles", duration: "30s", description: "Rotate wrists clockwise and counter-clockwise" },
    { name: "Eye Focus Shifts", duration: "60s", description: "Focus near and far objects alternately" },
    { name: "Spinal Twists", duration: "45s", description: "Gentle seated spinal rotation" }
  ];

  const recommendations = [
    { icon: Eye, title: "Take a 20-20-20 break", desc: "Look at something 20 feet away for 20 seconds every 20 minutes", priority: "high" },
    { icon: Dumbbell, title: "Stretch your wrists", desc: "Prevent RSI with wrist and finger stretches", priority: "medium" },
    { icon: Moon, title: "Improve sleep hygiene", desc: "Your coding performance correlates with sleep quality", priority: "high" },
    { icon: Coffee, title: "Hydration reminder", desc: "Drink water to maintain focus and reduce eye strain", priority: "low" }
  ];

  const ambientSounds = [
    { id: 'rain', name: 'Rain', icon: '🌧️' },
    { id: 'forest', name: 'Forest', icon: '🌲' },
    { id: 'ocean', name: 'Ocean', icon: '🌊' },
    { id: 'cafe', name: 'Café', icon: '☕' },
    { id: 'white-noise', name: 'White Noise', icon: '🔊' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DevWell
                </h1>
                <p className="text-gray-500 text-sm">Developer Wellness Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <Bell className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <Settings className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/70 backdrop-blur-sm p-1 rounded-2xl mb-8 border border-gray-200">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
            { id: 'focus', name: 'Focus Timer', icon: Timer },
            { id: 'exercises', name: 'Exercises', icon: Dumbbell },
            { id: 'analytics', name: 'Analytics', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Wellness Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <WellnessCard
                title="Posture Score"
                value={`${Math.round(postureScore)}%`}
                icon={Activity}
                color="bg-gradient-to-r from-green-500 to-emerald-600"
                trend={2}
                subtitle="Good ergonomics today"
              />
              <WellnessCard
                title="Eye Strain Level"
                value={`${Math.round(eyeStrainLevel)}%`}
                icon={Eye}
                color="bg-gradient-to-r from-blue-500 to-cyan-600"
                trend={-5}
                subtitle="Take a 20-20-20 break"
              />
              <WellnessCard
                title="Stress Level"
                value={`${Math.round(stressLevel)}%`}
                icon={Brain}
                color="bg-gradient-to-r from-purple-500 to-pink-600"
                trend={-3}
                subtitle="Practice deep breathing"
              />
              <WellnessCard
                title="Screen Time Today"
                value={`${todayScreenTime}h`}
                icon={Monitor}
                color="bg-gradient-to-r from-orange-500 to-red-600"
                trend={-8}
                subtitle={`${breaksTaken} breaks taken`}
              />
            </div>

            {/* Real-time Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Productivity</h3>
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Area type="monotone" dataKey="focus" stackId="1" stroke="#8b5cf6" fill="url(#focusGradient)" />
                    <Area type="monotone" dataKey="energy" stackId="2" stroke="#06b6d4" fill="url(#energyGradient)" />
                    <defs>
                      <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Posture Distribution</h3>
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={postureData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {postureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {postureData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Personalized Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-xl border-l-4 ${
                    rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                    rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-green-500 bg-green-50'
                  } hover:shadow-md transition-shadow duration-300`}>
                    <div className="flex items-start space-x-3">
                      <rec.icon className={`h-5 w-5 mt-1 ${
                        rec.priority === 'high' ? 'text-red-600' :
                        rec.priority === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <p className="text-sm text-gray-600">{rec.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Focus Timer Tab */}
        {activeTab === 'focus' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Timer Section */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8">Focus Session</h3>
                
                <div className="relative w-64 h-64 mx-auto mb-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="url(#timerGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (focusTimer / (25 * 60))}`}
                      className="transition-all duration-1000 ease-linear"
                    />
                    <defs>
                      <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {formatTime(focusTimer)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {isTimerRunning ? 'Focus Time' : 'Paused'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  {!isTimerRunning ? (
                    <button
                      onClick={startTimer}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Play className="h-5 w-5" />
                      <span>Start</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Pause className="h-5 w-5" />
                      <span>Pause</span>
                    </button>
                  )}
                  <button
                    onClick={resetTimer}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Ambient Sounds */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Headphones className="h-5 w-5 mr-2 text-purple-500" />
                  Ambient Sounds
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {ambientSounds.map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => setAmbientSound(sound.id)}
                      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                        ambientSound === sound.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{sound.icon}</span>
                      <span className="font-medium">{sound.name}</span>
                      {ambientSound === sound.id && (
                        <div className="ml-auto flex items-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-2">Break Reminders</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Eye break (20-20-20)</span>
                      <span className="text-green-600 font-medium">Every 20 min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Stretch break</span>
                      <span className="text-blue-600 font-medium">Every 1 hour</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Movement break</span>
                      <span className="text-purple-600 font-medium">Every 2 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 text-green-500" />
                RSI Prevention Exercises
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((exercise, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {exercise.duration}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{exercise.description}</p>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 group-hover:scale-105 flex items-center justify-center space-x-2">
                      <Play className="h-4 w-4" />
                      <span>Start Exercise</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Exercise Streak</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">12</div>
                  <div className="text-gray-600">Days in a row</div>
                  <div className="mt-4 flex justify-center space-x-1">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          i < 5 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-all duration-300">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-900">Start 20-20-20 Eye Exercise</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-all duration-300">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span className="text-gray-900">Posture Check Reminder</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all duration-300">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-900">5-Minute Meditation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Moon className="h-5 w-5 mr-2 text-indigo-500" />
                Sleep vs. Coding Performance
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sleepCorrelationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#666" />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Line yAxisId="left" type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="performance" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', strokeWidth: 2, r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Weekly Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Focus Time</span>
                    <span className="font-medium">5.2h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Break Compliance</span>
                    <span className="font-medium text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exercise Sessions</span>
                    <span className="font-medium">12</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Health Trends</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posture Score</span>
                    <span className="font-medium text-green-600">↑ 15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Eye Strain</span>
                    <span className="font-medium text-green-600">↓ 23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stress Level</span>
                    <span className="font-medium text-green-600">↓ 18%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Achievements</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm">7-Day Streak</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-purple-500" />
                    <span className="text-sm">Break Master</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Posture Pro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevWellnessPlatform;
