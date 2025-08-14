import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ScrapingDashboard = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      name: 'E-commerce Product Data',
      url: 'https://example-store.com',
      status: 'running',
      progress: 67,
      itemsCollected: 3420,
      totalItems: 5100,
      startTime: '2025-01-15 10:30',
      estimatedCompletion: '2025-01-15 14:20',
      dataPoints: 15,
      successRate: 94.2
    },
    {
      id: 2,
      name: 'News Article Mining',
      url: 'https://news-site.com',
      status: 'completed',
      progress: 100,
      itemsCollected: 1250,
      totalItems: 1250,
      startTime: '2025-01-15 08:00',
      estimatedCompletion: '2025-01-15 12:30',
      dataPoints: 8,
      successRate: 98.7
    },
    {
      id: 3,
      name: 'Social Media Posts',
      url: 'https://social-platform.com',
      status: 'paused',
      progress: 23,
      itemsCollected: 890,
      totalItems: 3800,
      startTime: '2025-01-15 09:15',
      estimatedCompletion: '2025-01-15 16:45',
      dataPoints: 12,
      successRate: 89.1
    },
    {
      id: 4,
      name: 'Real Estate Listings',
      url: 'https://property-site.com',
      status: 'error',
      progress: 45,
      itemsCollected: 2100,
      totalItems: 4680,
      startTime: '2025-01-15 11:00',
      estimatedCompletion: '2025-01-15 17:30',
      dataPoints: 18,
      successRate: 76.3
    }
  ]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewJobDialog, setOpenNewJobDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [newJobStep, setNewJobStep] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const [performanceData] = useState([
    { time: '10:00', items: 120, errors: 2 },
    { time: '10:30', items: 340, errors: 1 },
    { time: '11:00', items: 580, errors: 3 },
    { time: '11:30', items: 820, errors: 2 },
    { time: '12:00', items: 1100, errors: 1 },
    { time: '12:30', items: 1350, errors: 4 },
    { time: '13:00', items: 1620, errors: 2 }
  ]);

  const [systemStats] = useState({
    totalJobs: 47,
    activeJobs: 12,
    successRate: 92.4,
    dataCollected: '2.3M',
    avgSpeed: '145/min'
  });

  const statusStyles = {
    running: 'bg-green-500 text-white',
    completed: 'bg-blue-500 text-white',
    paused: 'bg-orange-500 text-white',
    error: 'bg-red-500 text-white'
  };

  const statusIcons = {
    running: '▶️',
    completed: '✅',
    paused: '⏸️',
    error: '❌'
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prevJobs => 
        prevJobs.map(job => {
          if (job.status === 'running' && job.progress < 100) {
            const newProgress = Math.min(job.progress + Math.random() * 2, 100);
            const newItemsCollected = Math.floor((newProgress / 100) * job.totalItems);
            return {
              ...job,
              progress: newProgress,
              itemsCollected: newItemsCollected,
              status: newProgress >= 100 ? 'completed' : 'running'
            };
          }
          return job;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleJobAction = (jobId, action) => {
    setJobs(prevJobs =>
      prevJobs.map(job => {
        if (job.id === jobId) {
          switch (action) {
            case 'start':
              return { ...job, status: 'running' };
            case 'pause':
              return { ...job, status: 'paused' };
            case 'stop':
              return { ...job, status: 'completed', progress: 100 };
            default:
              return job;
          }
        }
        return job;
      })
    );
    showNotification(`Job ${action}ed successfully`, 'success');
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 4000);
  };

  const handleExport = (format) => {
    showNotification(`Exporting data as ${format}...`, 'info');
    setMenuOpen(null);
  };

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{job.name}</h3>
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(menuOpen === job.id ? null : job.id)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {menuOpen === job.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border">
                <div className="py-1">
                  <button onClick={() => { handleJobAction(job.id, 'start'); setMenuOpen(null); }} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">▶️ Start Job</button>
                  <button onClick={() => { handleJobAction(job.id, 'pause'); setMenuOpen(null); }} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">⏸️ Pause Job</button>
                  <button onClick={() => handleExport('CSV')} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">📥 Export Data</button>
                  <button onClick={() => setMenuOpen(null)} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">🗑️ Delete Job</button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 truncate">{job.url}</p>
        
        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[job.status]}`}>
            {statusIcons[job.status]} {job.status.toUpperCase()}
          </span>
          <span className="text-sm text-gray-600">
            {job.itemsCollected.toLocaleString()} / {job.totalItems.toLocaleString()} items
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(job.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                job.status === 'running' ? 'bg-green-500' :
                job.status === 'completed' ? 'bg-blue-500' :
                job.status === 'paused' ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${job.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500">Success Rate</p>
            <p className="font-semibold">{job.successRate}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Data Points</p>
            <p className="font-semibold">{job.dataPoints}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleJobAction(job.id, job.status === 'running' ? 'pause' : 'start')}
            className="flex-1 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            {job.status === 'running' ? '⏸️ Pause' : '▶️ Start'}
          </button>
          <button
            onClick={() => {
              setSelectedJob(job);
              setOpenDialog(true);
            }}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            📊 View Data
          </button>
        </div>
      </div>
    </div>
  );

  const NewJobDialog = () => {
    const [jobConfig, setJobConfig] = useState({
      name: '',
      url: '',
      selectors: [],
      schedule: 'once',
      concurrency: 5
    });

    const steps = ['Basic Info', 'Selectors', 'Configuration'];

    const renderStepContent = () => {
      switch (newJobStep) {
        case 0:
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Name</label>
                <input
                  type="text"
                  value={jobConfig.name}
                  onChange={(e) => setJobConfig({...jobConfig, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter job name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
                <input
                  type="url"
                  value={jobConfig.url}
                  onChange={(e) => setJobConfig({...jobConfig, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          );
        case 1:
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">CSS Selectors</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">⚡</div>
                <p className="text-gray-600">Drag and drop elements here or add selectors manually</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add CSS Selector</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., .product-title, #price, .description"
                />
              </div>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                <select
                  value={jobConfig.schedule}
                  onChange={(e) => setJobConfig({...jobConfig, schedule: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="once">Run Once</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Concurrency Level</label>
                <input
                  type="number"
                  value={jobConfig.concurrency}
                  onChange={(e) => setJobConfig({...jobConfig, concurrency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="20"
                />
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return openNewJobDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-90vh overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Create New Scraping Job</h2>
          </div>
          
          <div className="p-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= newJobStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${index <= newJobStep ? 'text-blue-500' : 'text-gray-500'}`}>
                    {step}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${index < newJobStep ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            
            {renderStepContent()}
          </div>
          
          <div className="p-6 border-t flex justify-between">
            <button 
              onClick={() => setOpenNewJobDialog(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <div className="flex gap-2">
              {newJobStep > 0 && (
                <button 
                  onClick={() => setNewJobStep(newJobStep - 1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              {newJobStep < steps.length - 1 ? (
                <button 
                  onClick={() => setNewJobStep(newJobStep + 1)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setOpenNewJobDialog(false);
                    setNewJobStep(0);
                    showNotification('New scraping job created successfully!', 'success');
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Job
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sampleData = [
    { id: 1, title: 'Premium Laptop Pro', price: '$1,299.99', category: 'Electronics', status: 'Active' },
    { id: 2, title: 'Wireless Headphones', price: '$89.99', category: 'Electronics', status: 'Active' },
    { id: 3, title: 'Smart Watch Series X', price: '$349.99', category: 'Electronics', status: 'Active' },
    { id: 4, title: 'Gaming Mouse RGB', price: '$59.99', category: 'Electronics', status: 'Active' },
    { id: 5, title: 'Mechanical Keyboard', price: '$129.99', category: 'Electronics', status: 'Active' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Web Scraping Management Platform</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setDrawerOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Navigation</h2>
              <nav className="space-y-2">
                <a href="#" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <span>📊</span> Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <span>🔧</span> Jobs
                </a>
                <a href="#" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <span>⏰</span> Scheduler
                </a>
                <a href="#" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <span>💾</span> Data Storage
                </a>
                <a href="#" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <span>⚙️</span> Settings
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🔧</div>
              <div>
                <div className="text-2xl font-bold">{systemStats.totalJobs}</div>
                <div className="text-purple-100 text-sm">Total Jobs</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">▶️</div>
              <div>
                <div className="text-2xl font-bold">{systemStats.activeJobs}</div>
                <div className="text-green-100 text-sm">Active Jobs</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📈</div>
              <div>
                <div className="text-2xl font-bold">{systemStats.successRate}%</div>
                <div className="text-blue-100 text-sm">Success Rate</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💾</div>
              <div>
                <div className="text-2xl font-bold">{systemStats.dataCollected}</div>
                <div className="text-orange-100 text-sm">Data Collected</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⚡</div>
              <div>
                <div className="text-2xl font-bold">{systemStats.avgSpeed}</div>
                <div className="text-pink-100 text-sm">Avg Speed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Jobs Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Scraping Jobs</h2>
                <button
                  onClick={() => setOpenNewJobDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                >
                  <span>➕</span> New Job
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Real-time Performance</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #ccc', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="items" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Items Collected"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="errors" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Errors"
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Activity Log */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-green-500 mt-1">✅</div>
                  <div>
                    <p className="text-sm font-medium">News scraping completed</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-orange-500 mt-1">⚠️</div>
                  <div>
                    <p className="text-sm font-medium">Rate limit reached on job #3</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 mt-1">▶️</div>
                  <div>
                    <p className="text-sm font-medium">New job started: Product data</p>
                    <p className="text-xs text-gray-500">12 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-500 mt-1">❌</div>
                  <div>
                    <p className="text-sm font-medium">Connection failed for job #4</p>
                    <p className="text-xs text-gray-500">18 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleExport('CSV')}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>📥</span> Export All Data
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span>⏰</span> Schedule Manager
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span>⚙️</span> System Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Preview Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-90vh overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Data Preview - {selectedJob?.name}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('CSV')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  📥 Export
                </button>
                <button
                  onClick={() => setOpenDialog(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab(0)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 0 ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Data Table
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 1 ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab(2)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 2 ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Export
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {activeTab === 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sampleData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeTab === 1 && (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="items" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {activeTab === 2 && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Export Options</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleExport('CSV')}
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                    >
                      <div className="text-3xl mb-2">📄</div>
                      <div className="font-medium">CSV</div>
                    </button>
                    <button
                      onClick={() => handleExport('JSON')}
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                    >
                      <div className="text-3xl mb-2">📝</div>
                      <div className="font-medium">JSON</div>
                    </button>
                    <button
                      onClick={() => handleExport('Excel')}
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                    >
                      <div className="text-3xl mb-2">📊</div>
                      <div className="font-medium">Excel</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Job Dialog */}
      <NewJobDialog />

      {/* Floating Action Button */}
      <button
        onClick={() => setOpenNewJobDialog(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-xl z-40"
      >
        ➕
      </button>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span>
              {notification.type === 'success' ? '✅' :
               notification.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapingDashboard;
