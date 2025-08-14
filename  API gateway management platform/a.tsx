import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  Settings, 
  Globe, 
  Shield, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  RefreshCw,
  Terminal,
  Code,
  Book,
  Users,
  TrendingUp,
  Database,
  Server,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data
const apiMetrics = [
  { time: '00:00', requests: 1200, latency: 45, errors: 2 },
  { time: '04:00', requests: 800, latency: 38, errors: 1 },
  { time: '08:00', requests: 2400, latency: 52, errors: 8 },
  { time: '12:00', requests: 3200, latency: 67, errors: 12 },
  { time: '16:00', requests: 2800, latency: 58, errors: 6 },
  { time: '20:00', requests: 1800, latency: 41, errors: 3 }
];

const endpoints = [
  { id: 1, name: '/api/v1/users', method: 'GET', status: 'active', requests: 15420, avgLatency: 45, uptime: 99.9, errors: 12 },
  { id: 2, name: '/api/v1/orders', method: 'POST', status: 'active', requests: 8930, avgLatency: 78, uptime: 99.7, errors: 23 },
  { id: 3, name: '/api/v1/products', method: 'GET', status: 'warning', requests: 22150, avgLatency: 120, uptime: 98.2, errors: 45 },
  { id: 4, name: '/api/v1/auth', method: 'POST', status: 'active', requests: 5670, avgLatency: 32, uptime: 99.9, errors: 2 },
  { id: 5, name: '/api/v1/analytics', method: 'GET', status: 'error', requests: 1240, avgLatency: 340, uptime: 95.1, errors: 89 }
];

const rateLimitData = [
  { endpoint: '/api/v1/users', current: 450, limit: 1000, percentage: 45 },
  { endpoint: '/api/v1/orders', current: 780, limit: 1000, percentage: 78 },
  { endpoint: '/api/v1/products', current: 920, limit: 1000, percentage: 92 },
  { endpoint: '/api/v1/auth', current: 340, limit: 500, percentage: 68 }
];

const ApiGatewayManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [realTimeData, setRealTimeData] = useState(apiMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => prev.map(item => ({
        ...item,
        requests: item.requests + Math.floor(Math.random() * 100) - 50,
        latency: Math.max(20, item.latency + Math.floor(Math.random() * 20) - 10),
        errors: Math.max(0, item.errors + Math.floor(Math.random() * 4) - 2)
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      warning: <AlertTriangle className="w-3 h-3" />,
      error: <XCircle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center gap-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ConfigModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Configure Endpoint</h2>
          <p className="text-sm text-gray-600 mt-1">Modify endpoint settings and rate limits</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint Path</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="/api/v1/users"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit (req/min)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (ms)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="5000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Authentication Required</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input type="radio" name="auth" className="mr-2" defaultChecked />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="auth" className="mr-2" />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Endpoint description..."
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            onClick={() => setShowConfigModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const TestModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">API Testing Console</h2>
          <p className="text-sm text-gray-600 mt-1">Test your API endpoints in real-time</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="https://api.example.com/v1/users"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Headers</label>
            <div className="bg-gray-50 rounded-md p-4 font-mono text-sm">
              <div className="space-y-2">
                <div>Content-Type: application/json</div>
                <div>Authorization: Bearer token_here</div>
                <div>X-API-Key: your_api_key</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              rows="6"
              placeholder='{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Response</h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-600">Status: 200 OK</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">Time: 145ms</span>
              </div>
            </div>
            <div className="bg-gray-900 rounded-md p-4 text-green-400 font-mono text-sm overflow-x-auto">
              <pre>{`{
  "id": 12345,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00Z",
  "status": "active"
}`}</pre>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button 
            onClick={() => setShowTestModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <div className="space-x-3">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copy cURL
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" />
              Send Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Requests" value="125.4K" change={12.5} icon={Activity} color="blue" />
        <MetricCard title="Avg Response Time" value="58ms" change={-8.2} icon={Clock} color="green" />
        <MetricCard title="Error Rate" value="0.12%" change={-15.3} icon={Shield} color="red" />
        <MetricCard title="Active Endpoints" value="23" change={4.2} icon={Globe} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rate Limiting Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limiting Status</h3>
        <div className="space-y-4">
          {rateLimitData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{item.endpoint}</span>
                  <span className="text-sm text-gray-600">{item.current}/{item.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      item.percentage > 90 ? 'bg-red-500' : 
                      item.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEndpoints = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Endpoints</h2>
          <p className="text-gray-600">Manage and monitor your API endpoints</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Endpoint
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search endpoints..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
            <button 
              onClick={handleRefresh}
              className={`p-2 text-gray-500 hover:text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Latency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {endpoints.map((endpoint) => (
                <tr key={endpoint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-3 ${
                        endpoint.method === 'GET' ? 'bg-blue-500' :
                        endpoint.method === 'POST' ? 'bg-green-500' :
                        endpoint.method === 'PUT' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                        <div className="text-sm text-gray-500">{endpoint.method}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={endpoint.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endpoint.requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endpoint.avgLatency}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endpoint.uptime}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endpoint.errors}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setShowTestModal(true)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowConfigModal(true)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDocumentation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Documentation</h2>
          <p className="text-gray-600">Interactive API documentation and examples</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Code className="w-4 h-4" />
            Generate SDK
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Endpoints</h3>
          <div className="space-y-2">
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="text-sm text-gray-900">{endpoint.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GET /api/v1/users</h3>
            <p className="text-gray-600 mb-6">Retrieve a list of all users in the system with optional filtering and pagination.</p>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Parameters</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="text-sm font-medium text-gray-700 pb-2">Name</th>
                        <th className="text-sm font-medium text-gray-700 pb-2">Type</th>
                        <th className="text-sm font-medium text-gray-700 pb-2">Required</th>
                        <th className="text-sm font-medium text-gray-700 pb-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      <tr>
                        <td className="text-sm text-gray-900 py-1">page</td>
                        <td className="text-sm text-gray-600 py-1">integer</td>
                        <td className="text-sm text-gray-600 py-1">No</td>
                        <td className="text-sm text-gray-600 py-1">Page number for pagination</td>
                      </tr>
                      <tr>
                        <td className="text-sm text-gray-900 py-1">limit</td>
                        <td className="text-sm text-gray-600 py-1">integer</td>
                        <td className="text-sm text-gray-600 py-1">No</td>
                        <td className="text-sm text-gray-600 py-1">Number of items per page</td>
                      </tr>
                      <tr>
                        <td className="text-sm text-gray-900 py-1">search</td>
                        <td className="text-sm text-gray-600 py-1">string</td>
                        <td className="text-sm text-gray-600 py-1">No</td>
                        <td className="text-sm text-gray-600 py-1">Search term for filtering users</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Example Request</h4>
                <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-x-auto">
                  <pre>{`curl -X GET "https://api.example.com/v1/users?page=1&limit=10" \\
  -H "Authorization: Bearer your_token_here" \\
  -H "Content-Type: application/json"`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Example Response</h4>
                <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00Z",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}`}</pre>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowTestModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Try it out
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
                  <Copy className="w-4 h-4" />
                  Copy cURL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">API Gateway</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'endpoints', label: 'Endpoints', icon: Globe },
              { id: 'documentation', label: 'Documentation', icon: Book },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'endpoints' && renderEndpoints()}
        {activeTab === 'documentation' && renderDocumentation()}
        {activeTab === 'analytics' && renderDashboard()}
        {activeTab === 'settings' && renderDashboard()}
      </main>

      {/* Modals */}
      {showConfigModal && <ConfigModal />}
      {showTestModal && <TestModal />}
    </div>
  );
};

export default ApiGatewayManager;
