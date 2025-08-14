import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Brain,
  Coffee,
  AlertTriangle,
  TrendingUp,
  Bug,
  RefreshCw,
  Search,
  Bookmark,
  Clock,
  Eye,
  Target,
  Lightbulb,
  ArrowUp,
  X
} from 'lucide-react';

export default function DevTimeTracker() {
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [currentProblem, setCurrentProblem] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patterns, setPatterns] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [rabbitHoleDetected, setRabbitHoleDetected] = useState(false);

  // Simulated activity types that indicate potential rabbit holes
  const activityTypes = [
    'Running same test',
    'Refreshing documentation',
    'Small code changes',
    'Googling same error',
    'Checking Stack Overflow',
    'Reading logs',
    'Debugging step-through'
  ];

  // Start new session
  const startSession = () => {
    const session = {
      id: Date.now(),
      startTime: new Date(),
      problem: currentProblem,
      description: problemDescription,
      status: 'active',
      activities: [],
      productivity: 100
    };
    setActiveSession(session);
    setCurrentProblem('');
    setProblemDescription('');
    setShowProblemModal(false);
  };

  // Stop current session
  const stopSession = () => {
    if (activeSession) {
      const completedSession = {
        ...activeSession,
        endTime: new Date(),
        status: 'completed'
      };
      setSessions(prev => [completedSession, ...prev]);
      setActiveSession(null);
      setRabbitHoleDetected(false);
    }
  };

  // Simulate activity detection
  const simulateActivity = useCallback(() => {
    if (!activeSession) return;

    const activity = {
      id: Date.now(),
      type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
      timestamp: new Date(),
      sessionId: activeSession.id
    };

    setActivities(prev => [activity, ...prev.slice(0, 19)]); // Keep last 20 activities

    // Update active session activities
    setActiveSession(prev => ({
      ...prev,
      activities: [activity, ...prev.activities]
    }));

    // Pattern detection logic
    detectPatterns([activity, ...activities.slice(0, 9)]); // Check last 10 activities
  }, [activeSession, activities]);

  // Pattern detection
  const detectPatterns = (recentActivities) => {
    if (recentActivities.length < 5) return;

    const last5Activities = recentActivities.slice(0, 5);
    const sameActivityCount = last5Activities.filter(a => a.type === last5Activities[0].type).length;
    
    // Detect rabbit hole patterns
    if (sameActivityCount >= 3) {
      setRabbitHoleDetected(true);
      
      const pattern = {
        id: Date.now(),
        type: 'rabbit_hole',
        description: `Repeated ${last5Activities[0].type} ${sameActivityCount} times`,
        severity: sameActivityCount >= 4 ? 'high' : 'medium',
        timestamp: new Date()
      };
      
      setPatterns(prev => [pattern, ...prev.slice(0, 9)]);
      
      // Suggest intervention after 4 repeated activities
      if (sameActivityCount >= 4) {
        setTimeout(() => setShowBreakModal(true), 2000);
        
        setNotifications(prev => [{
          id: Date.now(),
          title: 'Rabbit Hole Detected!',
          message: `You've been ${last5Activities[0].type.toLowerCase()} repeatedly. Time for a break?`,
          type: 'warning'
        }, ...prev.slice(0, 4)]);
      }
    }

    // Update productivity score
    if (activeSession) {
      const productivity = Math.max(20, 100 - (sameActivityCount * 15));
      setActiveSession(prev => ({ ...prev, productivity }));
    }
  };

  // Auto-simulate activities during active session
  useEffect(() => {
    let interval;
    if (activeSession) {
      interval = setInterval(simulateActivity, 3000); // Every 3 seconds
    }
    return () => clearInterval(interval);
  }, [activeSession, simulateActivity]);

  // Get session duration
  const getSessionDuration = (session) => {
    const start = new Date(session.startTime);
    const end = session.endTime ? new Date(session.endTime) : new Date();
    return Math.round((end - start) / (1000 * 60)); // minutes
  };

  // Notification component
  const Notification = ({ notification, onClose }) => (
    <div className={`mb-4 p-4 rounded-lg border-l-4 ${
      notification.type === 'warning' ? 'bg-orange-50 border-orange-400' : 
      notification.type === 'success' ? 'bg-green-50 border-green-400' : 
      'bg-blue-50 border-blue-400'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-600">{notification.message}</p>
        </div>
        <button onClick={() => onClose(notification.id)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );

  // Modal component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  // Progress ring component
  const ProgressRing = ({ value, size = 80 }) => {
    const radius = (size - 10) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    const color = value > 70 ? '#10b981' : value > 40 ? '#f59e0b' : '#ef4444';

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{value}%</span>
        </div>
      </div>
    );
  };

  // Dashboard tab
  const DashboardTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Current Session</h3>
            {activeSession && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                rabbitHoleDetected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {rabbitHoleDetected ? 'Rabbit Hole Detected' : 'On Track'}
              </span>
            )}
          </div>
          
          {activeSession ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Problem</p>
                  <p className="font-medium">{activeSession.problem || 'Untitled debugging session'}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Duration: {getSessionDuration(activeSession)} minutes
                  </p>
                </div>
                <ProgressRing value={activeSession.productivity} />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={stopSession}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Square size={16} />
                  Stop Session
                </button>
                {rabbitHoleDetected && (
                  <button 
                    onClick={() => setShowBreakModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Coffee size={16} />
                    Take Break
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">No active session</p>
              <button 
                onClick={() => setShowProblemModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play size={16} />
                Start New Session
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activities.slice(0, 8).length === 0 ? (
            <p className="text-gray-600 text-sm">No activity yet</p>
          ) : (
            activities.slice(0, 8).map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">{activity.type}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Pattern Alerts</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {patterns.length === 0 ? (
            <p className="text-gray-600 text-sm">No patterns detected</p>
          ) : (
            patterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`p-3 rounded-lg border-l-4 ${
                  pattern.severity === 'high' ? 'bg-red-50 border-red-400' : 'bg-orange-50 border-orange-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} className="text-orange-600" />
                  <h4 className="font-medium text-sm">{pattern.type.replace('_', ' ').toUpperCase()}</h4>
                </div>
                <p className="text-xs text-gray-600">{pattern.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            onClick={() => window.open('https://stackoverflow.com/search?q=' + encodeURIComponent(activeSession?.problem || 'debugging'), '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Search size={16} />
            Search Stack Overflow
          </button>
          <button 
            onClick={() => {
              setNotifications(prev => [{
                id: Date.now(),
                title: 'Problem State Saved',
                message: 'Your current debugging context has been saved',
                type: 'success'
              }, ...prev.slice(0, 4)]);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Bookmark size={16} />
            Save Problem State
          </button>
          <button 
            onClick={() => setShowBreakModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Lightbulb size={16} />
            Get Unstuck Tips
          </button>
          <button 
            onClick={() => {
              setActivities([]);
              setPatterns([]);
              setRabbitHoleDetected(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Reset Tracking
          </button>
        </div>
      </div>
    </div>
  );

  // Analytics tab
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Productivity Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold">{sessions.length + (activeSession ? 1 : 0)}</p>
            </div>
            <Clock size={32} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Rabbit Holes Detected</p>
              <p className="text-3xl font-bold">{patterns.filter(p => p.type === 'rabbit_hole').length}</p>
            </div>
            <AlertTriangle size={32} className="text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Average Productivity</p>
              <p className="text-3xl font-bold">
                {sessions.length > 0 
                  ? Math.round(sessions.reduce((acc, s) => acc + (s.productivity || 75), 0) / sessions.length)
                  : activeSession?.productivity || '--'
                }%
              </p>
            </div>
            <TrendingUp size={32} className="text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-gray-600">No completed sessions yet</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{session.problem || 'Untitled Session'}</p>
                    <p className="text-sm text-gray-600">
                      {getSessionDuration(session)} minutes • {new Date(session.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (session.productivity || 75) > 70 ? 'bg-green-100 text-green-800' : 
                    (session.productivity || 75) > 40 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {session.productivity || 75}% productivity
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Brain size={28} className="text-blue-600" />
              <h1 className="text-xl font-bold">DevFlow Tracker</h1>
            </div>
            <p className="text-sm text-gray-600">Escape the debugging rabbit hole</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Notifications */}
        <div className="mb-6">
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              notification={notification}
              onClose={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            />
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={16} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp size={16} />
              Analytics
            </button>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'dashboard' ? <DashboardTab /> : <AnalyticsTab />}

        {/* New Problem Modal */}
        <Modal
          isOpen={showProblemModal}
          onClose={() => setShowProblemModal(false)}
          title="Start New Debugging Session"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are you debugging?
              </label>
              <input
                type="text"
                placeholder="e.g., API endpoint not responding"
                value={currentProblem}
                onChange={(e) => setCurrentProblem(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description (optional)
              </label>
              <textarea
                placeholder="Additional context about the issue..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowProblemModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startSession}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Session
              </button>
            </div>
          </div>
        </Modal>

        {/* Break Suggestion Modal */}
        <Modal
          isOpen={showBreakModal}
          onClose={() => setShowBreakModal(false)}
          title="🚨 Rabbit Hole Detected!"
        >
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-600" />
                <p className="text-orange-800">You've been stuck in a repetitive pattern. Time to break the cycle!</p>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-3">Suggested Interventions:</p>
              <div className="space-y-2 text-sm text-gray-700">
                <p>☕ Take a 10-minute break and walk away</p>
                <p>🗣️ Explain the problem to a rubber duck (or colleague)</p>
                <p>📝 Write down exactly what you've tried so far</p>
                <p>🔍 Search for the exact error message on Stack Overflow</p>
                <p>🎯 Break the problem into smaller, testable parts</p>
                <p>🔄 Try a completely different approach</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowBreakModal(false);
                    setRabbitHoleDetected(false);
                    setNotifications(prev => [{
                      id: Date.now(),
                      title: 'Break Started',
                      message: 'Problem state saved. Take your time!',
                      type: 'success'
                    }, ...prev.slice(0, 4)]);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Coffee size={16} />
                  Take Break
                </button>
                <button
                  onClick={() => setShowBreakModal(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ArrowUp size={16} />
                  Push Through
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
