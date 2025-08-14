import React, { useState, useEffect, useRef } from 'react';
import { Calendar, CheckCircle, TrendingUp, Brain, Users, Target, Zap, Clock, BarChart3, Award, Sun, Moon, Cloud, MapPin, Lightbulb, Settings, Home, Activity, User, Bell } from 'lucide-react';
import * as d3 from 'd3';

const HabitTracker = () => {
  const [habits, setHabits] = useState([
    {
      id: 1,
      name: 'Morning Meditation',
      category: 'Mindfulness',
      streak: 15,
      difficulty: 3,
      timeOfDay: 'morning',
      completionRate: 87,
      energy: 'high',
      mood: 'calm',
      lastCompleted: new Date().toISOString().split('T')[0],
      weeklyPattern: [1, 1, 0, 1, 1, 1, 0]
    },
    {
      id: 2,
      name: 'Read 30 minutes',
      category: 'Learning',
      streak: 8,
      difficulty: 2,
      timeOfDay: 'evening',
      completionRate: 92,
      energy: 'medium',
      mood: 'focused',
      lastCompleted: new Date().toISOString().split('T')[0],
      weeklyPattern: [1, 1, 1, 0, 1, 1, 1]
    },
    {
      id: 3,
      name: 'Exercise',
      category: 'Health',
      streak: 22,
      difficulty: 4,
      timeOfDay: 'morning',
      completionRate: 78,
      energy: 'high',
      mood: 'energized',
      lastCompleted: new Date().toISOString().split('T')[0],
      weeklyPattern: [1, 0, 1, 1, 1, 0, 1]
    }
  ]);

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [insights, setInsights] = useState([]);
  const chartRef = useRef(null);
  const heatmapRef = useRef(null);
  const correlationRef = useRef(null);

  // Generate insights based on habit data
  useEffect(() => {
    const generateInsights = () => {
      const newInsights = [
        {
          type: 'pattern',
          title: 'Morning Momentum',
          description: 'Your morning habits have 15% higher completion rates. Consider moving struggling habits to morning.',
          icon: Sun,
          priority: 'high'
        },
        {
          type: 'correlation',
          title: 'Exercise-Mood Connection',
          description: 'Data shows exercise days correlate with 23% better mood ratings throughout the day.',
          icon: TrendingUp,
          priority: 'medium'
        },
        {
          type: 'optimization',
          title: 'Habit Stacking Opportunity',
          description: 'Try linking meditation with your morning coffee routine for better consistency.',
          icon: Lightbulb,
          priority: 'high'
        }
      ];
      setInsights(newInsights);
    };

    generateInsights();
  }, [habits]);

  // D3.js Habit Progress Chart
  useEffect(() => {
    if (!chartRef.current || activeView !== 'analytics') return;

    const container = d3.select(chartRef.current);
    container.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Generate sample time series data
    const data = habits.map(habit => ({
      name: habit.name,
      values: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        completion: Math.random() * 0.3 + habit.completionRate / 100 - 0.15
      }))
    }));

    const xScale = d3.scaleLinear()
      .domain([1, 30])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    const line = d3.line()
      .x(d => xScale(d.day))
      .y(d => yScale(Math.max(0, Math.min(1, d.completion))))
      .curve(d3.curveMonotoneX);

    const colors = ['#6366f1', '#10b981', '#f59e0b'];

    data.forEach((habit, i) => {
      g.append("path")
        .datum(habit.values)
        .attr("fill", "none")
        .attr("stroke", colors[i])
        .attr("stroke-width", 3)
        .attr("d", line)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .delay(i * 200)
        .style("opacity", 1);

      // Add dots for data points
      g.selectAll(`.dot-${i}`)
        .data(habit.values)
        .enter().append("circle")
        .attr("class", `dot-${i}`)
        .attr("cx", d => xScale(d.day))
        .attr("cy", d => yScale(Math.max(0, Math.min(1, d.completion))))
        .attr("r", 4)
        .attr("fill", colors[i])
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .delay(i * 200 + 500)
        .style("opacity", 0.8);
    });

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));

    // Legend
    const legend = g.selectAll(".legend")
      .data(data)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d, i) => colors[i]);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .text(d => d.name);

  }, [activeView, habits]);

  // D3.js Habit Heatmap
  useEffect(() => {
    if (!heatmapRef.current || activeView !== 'calendar') return;

    const container = d3.select(heatmapRef.current);
    container.selectAll("*").remove();

    const cellSize = 15;
    const weeks = 12;
    const days = 7;

    const svg = container
      .append("svg")
      .attr("width", weeks * cellSize + 50)
      .attr("height", days * cellSize + 100);

    // Generate sample heatmap data
    const heatmapData = [];
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < days; day++) {
        heatmapData.push({
          week,
          day,
          value: Math.random()
        });
      }
    }

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, 1]);

    svg.selectAll(".cell")
      .data(heatmapData)
      .enter().append("rect")
      .attr("class", "cell")
      .attr("x", d => d.week * cellSize)
      .attr("y", d => d.day * cellSize + 30)
      .attr("width", cellSize - 1)
      .attr("height", cellSize - 1)
      .style("fill", d => colorScale(d.value))
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 10)
      .style("opacity", 1);

    // Add day labels
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    svg.selectAll(".day-label")
      .data(dayLabels)
      .enter().append("text")
      .attr("class", "day-label")
      .attr("x", -10)
      .attr("y", (d, i) => i * cellSize + cellSize/2 + 30)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .style("fill", "#666")
      .text(d => d);

    // Title
    svg.append("text")
      .attr("x", weeks * cellSize / 2)
      .attr("y", 20)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Habit Completion Heatmap");

  }, [activeView]);

  const completeHabit = (habitId) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, streak: habit.streak + 1, lastCompleted: new Date().toISOString().split('T')[0] }
        : habit
    ));
  };

  const NavButton = ({ icon: Icon, label, view, isActive }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg transform scale-105' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const HabitCard = ({ habit }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{habit.name}</h3>
          <span className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{habit.category}</span>
        </div>
        <button
          onClick={() => completeHabit(habit.id)}
          className="text-green-500 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-full"
        >
          <CheckCircle size={24} />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Streak</span>
          <div className="flex items-center space-x-1">
            <Award className="text-yellow-500" size={16} />
            <span className="font-semibold text-yellow-600">{habit.streak} days</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Completion Rate</span>
          <span className="font-semibold text-green-600">{habit.completionRate}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${habit.completionRate}%` }}
          ></div>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>{habit.timeOfDay}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap size={12} />
            <span>{habit.energy} energy</span>
          </div>
        </div>
      </div>
    </div>
  );

  const InsightCard = ({ insight }) => {
    const Icon = insight.icon;
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
        insight.priority === 'high' ? 'border-red-500' : 'border-yellow-500'
      } hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${
            insight.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
          }`}>
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{insight.description}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Good morning! 🌟</h1>
        <p className="text-indigo-100 text-lg">You're on track with 3 habits today. Keep up the momentum!</p>
        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">87%</div>
            <div className="text-sm text-indigo-200">Overall Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">15</div>
            <div className="text-sm text-indigo-200">Longest Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-indigo-200">Active Habits</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Habits</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Brain className="text-indigo-600" />
          <span>Smart Insights</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <BarChart3 className="text-indigo-600" />
          <span>Habit Progress Analytics</span>
        </h2>
        <div ref={chartRef}></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Patterns</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Morning habits</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <span className="text-sm font-semibold">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Evening habits</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <span className="text-sm font-semibold">72%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Weekend habits</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="text-sm font-semibold">65%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Habit Correlations</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">Strong Positive</span>
              </div>
              <p className="text-sm text-green-600">Exercise → Better Mood (r=0.78)</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-800">Moderate Positive</span>
              </div>
              <p className="text-sm text-blue-600">Meditation → Focus (r=0.65)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Calendar className="text-indigo-600" />
          <span>Habit Calendar</span>
        </h2>
        <div ref={heatmapRef}></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Performance</h3>
          <div className="space-y-4">
            {habits.map(habit => (
              <div key={habit.id} className="flex items-center justify-between">
                <span className="text-gray-700">{habit.name}</span>
                <div className="flex space-x-1">
                  {habit.weeklyPattern.map((completed, index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded ${
                        completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reminders</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
              <Bell className="text-indigo-600" size={16} />
              <div>
                <p className="font-medium text-indigo-900">Morning Meditation</p>
                <p className="text-sm text-indigo-600">Tomorrow at 7:00 AM</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Bell className="text-green-600" size={16} />
              <div>
                <p className="font-medium text-green-900">Exercise</p>
                <p className="text-sm text-green-600">Tomorrow at 8:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Target className="text-indigo-600" />
          <span>Goal Tracking</span>
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
            <h3 className="font-semibold text-lg text-gray-900 mb-3">Mindfulness Master</h3>
            <p className="text-gray-600 text-sm mb-4">Complete 30 days of meditation</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-semibold">15/30 days</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <h3 className="font-semibold text-lg text-gray-900 mb-3">Fitness Enthusiast</h3>
            <p className="text-gray-600 text-sm mb-4">Exercise 4 times per week for 8 weeks</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-semibold">22/32 sessions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '69%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Habit-Goal Connections</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">Morning Meditation</p>
              <p className="text-sm text-gray-600">Contributing to: Mindfulness Master goal</p>
            </div>
            <div className="text-indigo-600 font-semibold">+3.3% daily</div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">Exercise</p>
              <p className="text-sm text-gray-600">Contributing to: Fitness Enthusiast goal</p>
            </div>
            <div className="text-green-600 font-semibold">+12.5% weekly</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-xl h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HabitFlow</h1>
                <p className="text-xs text-gray-500">Smart Habit Tracking</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <NavButton icon={Home} label="Dashboard" view="dashboard" isActive={activeView === 'dashboard'} />
              <NavButton icon={BarChart3} label="Analytics" view="analytics" isActive={activeView === 'analytics'} />
              <NavButton icon={Calendar} label="Calendar" view="calendar" isActive={activeView === 'calendar'} />
              <NavButton icon={Target} label="Goals" view="goals" isActive={activeView === 'goals'} />
              <NavButton icon={Users} label="Social" view="social" isActive={activeView === 'social'} />
              <NavButton icon={Brain} label="Coaching" view="coaching" isActive={activeView === 'coaching'} />
              <NavButton icon={Settings} label="Settings" view="settings" isActive={activeView === 'settings'} />
            </nav>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Alex Chen</p>
                  <p className="text-xs text-gray-500">Premium Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'analytics' && renderAnalytics()}
          {activeView === 'calendar' && renderCalendar()}
          {activeView === 'goals' && renderGoals()}
          {activeView === 'social' && (
            <div className="text-center py-20">
              <Users size={64} className="text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Features</h2>
              <p className="text-gray-600">Connect with friends and share your habit journey!</p>
            </div>
          )}
          {activeView === 'coaching' && (
            <div className="text-center py-20">
              <Brain size={64} className="text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Coaching</h2>
              <p className="text-gray-600">Get personalized insights and recommendations.</p>
            </div>
          )}
          {activeView === 'settings' && (
            <div className="text-center py-20">
              <Settings size={64} className="text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">Customize your habit tracking experience.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
