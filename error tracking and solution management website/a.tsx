import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Clock, TrendingUp, Brain, Share2, Terminal, Code, Globe, Wrench, Filter, Star, GitBranch, Settings } from 'lucide-react';

const ErrorTracker = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedError, setSelectedError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Simulated error data
  const [errors, setErrors] = useState([
    {
      id: 1,
      title: "Module not found: Can't resolve 'react-router-dom'",
      category: 'dependency',
      frequency: 15,
      lastOccurred: '2 hours ago',
      timeWasted: '45 minutes',
      project: 'E-commerce Dashboard',
      stack: 'React + Vite',
      pattern: 'Missing dependency import',
      solution: {
        steps: ['npm install react-router-dom', 'Restart dev server'],
        confidence: 95,
        timesSolved: 8
      },
      severity: 'high',
      source: 'terminal'
    },
    {
      id: 2,
      title: "TypeError: Cannot read properties of undefined (reading 'map')",
      category: 'runtime',
      frequency: 23,
      lastOccurred: '1 day ago',
      timeWasted: '2 hours',
      project: 'Blog Platform',
      stack: 'Next.js + TypeScript',
      pattern: 'Undefined array access',
      solution: {
        steps: ['Add optional chaining: data?.map()', 'Add loading state check'],
        confidence: 92,
        timesSolved: 12
      },
      severity: 'medium',
      source: 'browser'
    },
    {
      id: 3,
      title: "ESLint: 'useState' is not defined (no-undef)",
      category: 'linting',
      frequency: 8,
      lastOccurred: '3 hours ago',
      timeWasted: '20 minutes',
      project: 'Mobile App',
      stack: 'React Native',
      pattern: 'Missing React import',
      solution: {
        steps: ["Add: import { useState } from 'react'", 'Update ESLint React config'],
        confidence: 98,
        timesSolved: 5
      },
      severity: 'low',
      source: 'ide'
    },
    {
      id: 4,
      title: "Build failed: Unexpected token '<' in JSON",
      category: 'build',
      frequency: 6,
      lastOccurred: '5 hours ago',
      timeWasted: '1.5 hours',
      project: 'Analytics Dashboard',
      stack: 'Vue 3 + Vite',
      pattern: 'Malformed JSON config',
      solution: {
        steps: ['Check package.json syntax', 'Validate all JSON files', 'Clear node_modules and reinstall'],
        confidence: 87,
        timesSolved: 3
      },
      severity: 'high',
      source: 'build'
    }
  ]);

  const [patterns, setPatterns] = useState([
    { name: 'Missing Dependencies', count: 34, avgTime: '25 min', trend: 'down' },
    { name: 'Undefined Object Access', count: 28, avgTime: '40 min', trend: 'up' },
    { name: 'Import/Export Issues', count: 19, avgTime: '15 min', trend: 'stable' },
    { name: 'Type Errors', count: 16, avgTime: '30 min', trend: 'down' },
    { name: 'Build Configuration', count: 12, avgTime: '55 min', trend: 'up' }
  ]);

  const [solutions, setSolutions] = useState([
    {
      id: 1,
      title: 'Quick React Import Fix',
      description: 'Automatically adds missing React imports',
      timesUsed: 156,
      successRate: 94,
      tags: ['react', 'import', 'eslint']
    },
    {
      id: 2,
      title: 'Dependency Installer',
      description: 'Detects and installs missing packages',
      timesUsed: 89,
      successRate: 91,
      tags: ['npm', 'dependency', 'install']
    },
    {
      id: 3,
      title: 'Safe Navigation Pattern',
      description: 'Adds optional chaining for undefined checks',
      timesUsed: 67,
      successRate: 88,
      tags: ['javascript', 'optional-chaining', 'safety']
    }
  ]);

  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || error.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'terminal': return <Terminal className="w-4 h-4" />;
      case 'browser': return <Globe className="w-4 h-4" />;
      case 'ide': return <Code className="w-4 h-4" />;
      case 'build': return <Wrench className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Errors</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">↓ 12% from last week</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Saved</p>
              <p className="text-2xl font-bold text-gray-900">45.2h</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">↑ 23% from last week</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Auto-Solved</p>
              <p className="text-2xl font-bold text-gray-900">89%</p>
            </div>
            <Brain className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">↑ 5% from last week</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patterns Found</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">↑ 8 new this week</p>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Errors</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {errors.slice(0, 3).map(error => (
              <div key={error.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getSeverityColor(error.severity)}`}>
                    {getSourceIcon(error.source)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{error.title}</h4>
                    <p className="text-sm text-gray-600">{error.project} • {error.lastOccurred}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{error.frequency}x</p>
                  <p className="text-xs text-gray-500">{error.timeWasted}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Patterns */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Top Error Patterns</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{pattern.name}</h4>
                    <p className="text-sm text-gray-600">{pattern.count} occurrences • Avg: {pattern.avgTime}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  pattern.trend === 'up' ? 'bg-red-100 text-red-600' :
                  pattern.trend === 'down' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {pattern.trend === 'up' ? '↗' : pattern.trend === 'down' ? '↘' : '→'} {pattern.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ErrorsTab = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search errors, projects, or solutions..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="dependency">Dependencies</option>
            <option value="runtime">Runtime</option>
            <option value="linting">Linting</option>
            <option value="build">Build</option>
          </select>
        </div>
      </div>

      {/* Error List */}
      <div className="space-y-4">
        {filteredErrors.map(error => (
          <div key={error.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${getSeverityColor(error.severity)}`}>
                      {getSourceIcon(error.source)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{error.title}</h3>
                      <p className="text-sm text-gray-600">{error.project} • {error.stack}</p>
                    </div>
                  </div>
                  
                  <div className="ml-12">
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <span>Pattern: {error.pattern}</span>
                      <span>Frequency: {error.frequency}x</span>
                      <span>Last: {error.lastOccurred}</span>
                      <span>Time lost: {error.timeWasted}</span>
                    </div>
                    
                    {error.solution && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-green-800">Auto-Suggested Solution</h4>
                          <span className="text-sm text-green-600">{error.solution.confidence}% confidence</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
                          {error.solution.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                        <p className="text-xs text-green-600 mt-2">
                          Used successfully {error.solution.timesSolved} times
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedError(error)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SolutionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Smart Solutions Library</h3>
          <p className="text-gray-600">Automatically learned solutions from your past fixes</p>
        </div>
        <div className="p-6">
          <div className="grid gap-6">
            {solutions.map(solution => (
              <div key={solution.id} className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{solution.title}</h4>
                    <p className="text-gray-600 mb-3">{solution.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{solution.successRate}% success rate</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>Used {solution.timesUsed} times</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {solution.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                      Share
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Use Solution
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Error Timeline</h3>
          <p className="text-gray-600">Your most time-consuming error patterns over time</p>
        </div>
        <div className="p-6">
          <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Interactive timeline chart would appear here</p>
              <p className="text-sm text-gray-500">Showing error frequency, resolution time, and patterns</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Project Impact</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'E-commerce Dashboard', errors: 45, time: '12.3h' },
                { name: 'Blog Platform', errors: 32, time: '8.7h' },
                { name: 'Mobile App', errors: 28, time: '6.1h' },
                { name: 'Analytics Dashboard', errors: 19, time: '4.2h' }
              ].map((project, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.errors} errors</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{project.time}</p>
                    <p className="text-xs text-gray-500">time lost</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Technology Stack Impact</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { stack: 'React + TypeScript', errors: 67, efficiency: '89%' },
                { stack: 'Next.js', errors: 43, efficiency: '92%' },
                { stack: 'Vue 3', errors: 28, efficiency: '85%' },
                { stack: 'React Native', errors: 21, efficiency: '88%' }
              ].map((tech, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{tech.stack}</h4>
                    <p className="text-sm text-gray-600">{tech.errors} errors</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{tech.efficiency}</p>
                    <p className="text-xs text-gray-500">auto-solved</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">DevError Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Share2 className="w-4 h-4" />
                <span>Share Solutions</span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'errors', label: 'Error Management', icon: AlertTriangle },
              { id: 'solutions', label: 'Smart Solutions', icon: Brain },
              { id: 'analytics', label: 'Analytics', icon: GitBranch }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'errors' && <ErrorsTab />}
        {activeTab === 'solutions' && <SolutionsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>

      {/* Monitoring Status */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white rounded-lg border shadow-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Monitoring Active</p>
              <p className="text-xs text-gray-600">Terminal • Browser • IDE • Build</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTracker;
