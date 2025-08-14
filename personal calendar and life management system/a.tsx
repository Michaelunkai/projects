import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Brain, 
  Zap, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
  Target,
  Sun,
  Moon,
  CloudRain,
  Coffee,
  Car,
  Plane,
  Home,
  Briefcase,
  Heart
} from 'lucide-react';

// Simulated intelligent scheduling data
const useSmartScheduling = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Team Strategy Meeting",
      start: new Date(2025, 6, 21, 9, 0),
      end: new Date(2025, 6, 21, 10, 30),
      type: "meeting",
      location: "Conference Room A",
      attendees: 4,
      energyLevel: "high",
      travelTime: 5,
      color: "from-blue-500 to-purple-600",
      priority: "high",
      conflicts: [],
      aiSuggestion: "Optimal time - team is most productive at 9 AM"
    },
    {
      id: 2,
      title: "Workout Session",
      start: new Date(2025, 6, 21, 7, 0),
      end: new Date(2025, 6, 21, 8, 0),
      type: "fitness",
      location: "Gym",
      energyLevel: "medium",
      color: "from-green-500 to-emerald-600",
      priority: "medium",
      aiSuggestion: "Perfect timing - matches your energy cycle"
    },
    {
      id: 3,
      title: "Project Deadline",
      start: new Date(2025, 6, 21, 14, 0),
      end: new Date(2025, 6, 21, 17, 0),
      type: "work",
      location: "Home Office",
      energyLevel: "high",
      color: "from-orange-500 to-red-600",
      priority: "urgent",
      aiSuggestion: "Focus block scheduled - all distractions blocked"
    },
    {
      id: 4,
      title: "Flight to San Francisco",
      start: new Date(2025, 6, 22, 15, 30),
      end: new Date(2025, 6, 22, 18, 45),
      type: "travel",
      location: "Airport",
      color: "from-sky-500 to-blue-600",
      priority: "high",
      autoCreated: true,
      aiSuggestion: "Auto-created from email confirmation"
    }
  ]);

  const [insights, setInsights] = useState({
    productiveHours: [9, 10, 14, 15],
    averageMeetingLength: 67,
    focusTimeToday: 240,
    energyPrediction: "high",
    weatherImpact: "none",
    travelOptimization: "15 minutes saved with route optimization"
  });

  return { events, setEvents, insights };
};

const SmartCalendarApp = () => {
  const [currentView, setCurrentView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 21));
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const { events, setEvents, insights } = useSmartScheduling();

  // Auto dark mode based on time
  useEffect(() => {
    const hour = new Date().getHours();
    setIsDarkMode(hour < 7 || hour > 19);
  }, []);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push({
        hour,
        label: hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`,
        isProductive: insights.productiveHours.includes(hour)
      });
    }
    return slots;
  }, [insights.productiveHours]);

  const handleEventDrag = (event, newTime) => {
    const updatedEvents = events.map(e => 
      e.id === event.id 
        ? { ...e, start: newTime, end: new Date(newTime.getTime() + (e.end - e.start)) }
        : e
    );
    setEvents(updatedEvents);
  };

  const WeekView = () => (
    <div className={`grid grid-cols-8 gap-2 h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Time column */}
      <div className="space-y-2">
        <div className="h-12"></div>
        {timeSlots.map(slot => (
          <motion.div 
            key={slot.hour}
            className={`h-16 flex items-center justify-end pr-4 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } ${slot.isProductive ? 'font-semibold' : ''}`}
            animate={{ 
              color: slot.isProductive ? '#10b981' : isDarkMode ? '#9ca3af' : '#6b7280' 
            }}
          >
            {slot.label}
          </motion.div>
        ))}
      </div>

      {/* Days */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
        <div key={day} className="space-y-2">
          <div className={`h-12 flex flex-col items-center justify-center rounded-lg ${
            dayIndex === 0 ? (isDarkMode ? 'bg-blue-900' : 'bg-blue-100') : 
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } backdrop-blur-sm`}>
            <div className={`text-sm font-medium ${
              dayIndex === 0 ? 'text-blue-400' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {day}
            </div>
            <div className={`text-lg font-bold ${
              dayIndex === 0 ? 'text-blue-500' : isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {21 + dayIndex}
            </div>
          </div>

          {/* Time slots */}
          <div className="space-y-2 relative">
            {timeSlots.map(slot => (
              <div 
                key={slot.hour}
                className={`h-16 rounded-lg border-2 border-dashed ${
                  slot.isProductive 
                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                    : isDarkMode 
                      ? 'border-gray-700 bg-gray-800/50' 
                      : 'border-gray-200 bg-white'
                } transition-all duration-300 hover:border-solid hover:shadow-lg`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedEvent) {
                    const newTime = new Date(currentDate);
                    newTime.setDate(21 + dayIndex);
                    newTime.setHours(slot.hour, 0, 0, 0);
                    handleEventDrag(draggedEvent, newTime);
                    setDraggedEvent(null);
                  }
                }}
              />
            ))}

            {/* Events for this day */}
            {events
              .filter(event => event.start.getDate() === 21 + dayIndex)
              .map(event => {
                const startHour = event.start.getHours();
                const duration = (event.end - event.start) / (1000 * 60 * 60);
                const topPosition = (startHour - 6) * 72 + 8; // 72px per hour + 8px for day header
                const height = duration * 72 - 4; // -4px for margin

                return (
                  <motion.div
                    key={event.id}
                    className={`absolute left-1 right-1 rounded-lg bg-gradient-to-r ${event.color} 
                      text-white p-3 cursor-move shadow-lg backdrop-blur-sm z-10
                      hover:scale-105 transition-transform duration-200`}
                    style={{ 
                      top: topPosition, 
                      height: Math.max(height, 60) 
                    }}
                    draggable
                    onDragStart={(e) => setDraggedEvent(event)}
                    onClick={() => setSelectedEvent(event)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {event.type === 'meeting' && <Users className="w-4 h-4" />}
                      {event.type === 'fitness' && <Heart className="w-4 h-4" />}
                      {event.type === 'work' && <Briefcase className="w-4 h-4" />}
                      {event.type === 'travel' && <Plane className="w-4 h-4" />}
                      <span className="font-semibold text-sm truncate">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs opacity-90">
                      <Clock className="w-3 h-3" />
                      {event.start.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    )}
                    {event.autoCreated && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 
                        text-xs px-1 py-0.5 rounded-full font-bold">
                        AI
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );

  const InsightsPanel = () => (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={`absolute right-0 top-0 w-80 h-full ${
        isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
      } backdrop-blur-xl border-l ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      } p-6 overflow-y-auto shadow-2xl`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          AI Insights
        </h3>
        <button
          onClick={() => setShowInsights(false)}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-6 h-6 text-blue-500" />
            <h4 className="font-semibold">Smart Optimization</h4>
          </div>
          <p className="text-sm opacity-80 mb-3">
            {insights.travelOptimization}
          </p>
          <div className="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm">
            15 min saved today
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-6 h-6 text-green-500" />
            <h4 className="font-semibold">Energy Forecast</h4>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {timeSlots.slice(3, 13).map(slot => (
              <div key={slot.hour} className="text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-1 ${
                  slot.isProductive ? 'bg-green-400' : 'bg-gray-300'
                }`} />
                <span className="text-xs">{slot.hour}</span>
              </div>
            ))}
          </div>
          <p className="text-sm opacity-80">
            Peak energy: 9-10 AM, 2-3 PM
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'}`}>
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-6 h-6 text-orange-500" />
            <h4 className="font-semibold">Focus Time</h4>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Today's Progress</span>
            <span className="text-sm font-semibold">{insights.focusTimeToday}m</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(insights.focusTimeToday / 480) * 100}%` }}
            />
          </div>
          <p className="text-sm opacity-80">
            Target: 8 hours of deep work
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-6 h-6 text-purple-500" />
            <h4 className="font-semibold">Meeting Analytics</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Avg Length:</span>
              <span className="font-semibold">{insights.averageMeetingLength}m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Efficiency Score:</span>
              <span className="font-semibold text-green-500">87%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Buffer Time:</span>
              <span className="font-semibold">15m</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const EventDetailsModal = () => (
    <AnimatePresence>
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 
              max-w-md w-full m-4 shadow-2xl border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-r ${selectedEvent.color} rounded-xl p-4 mb-6 text-white`}>
              <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
              <div className="flex items-center gap-2 mt-2 opacity-90">
                <Clock className="w-4 h-4" />
                <span>
                  {selectedEvent.start.toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {selectedEvent.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.attendees && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span>{selectedEvent.attendees} attendees</span>
                </div>
              )}

              {selectedEvent.aiSuggestion && (
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} 
                  border-l-4 border-blue-500`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-sm text-blue-500">AI Insight</span>
                  </div>
                  <p className="text-sm">{selectedEvent.aiSuggestion}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg 
                  hover:bg-blue-600 transition-colors">
                  Edit Event
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg 
                  hover:bg-gray-300 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`${
        isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'
      } backdrop-blur-xl border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      } sticky top-0 z-40`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 
                rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">LifeSync</h1>
                <p className="text-sm opacity-60">Intelligent Calendar</p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r 
                from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Event</span>
            </motion.button>

            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`p-2 rounded-lg ${
                showInsights 
                  ? 'bg-blue-500 text-white' 
                  : isDarkMode 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-100'
              } transition-colors`}
            >
              <Brain className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } transition-colors`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between p-4 pt-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              <button className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm opacity-60">
              <CloudRain className="w-4 h-4" />
              <span>Partly cloudy, 24°C</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        <div className="p-6">
          <motion.div
            className="h-[calc(100vh-200px)] relative overflow-hidden rounded-2xl 
              shadow-2xl backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WeekView />
          </motion.div>
        </div>

        {/* AI Insights Panel */}
        <AnimatePresence>
          {showInsights && <InsightsPanel />}
        </AnimatePresence>
      </main>

      {/* Event Details Modal */}
      <EventDetailsModal />

      {/* Floating Action Button for Mobile */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 
          to-purple-600 rounded-full shadow-lg flex items-center justify-center 
          text-white md:hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default SmartCalendarApp;
