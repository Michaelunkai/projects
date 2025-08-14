import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Play, Pause, Database, Zap, TrendingUp, Activity, Settings, X, ChevronRight } from 'lucide-react';

// Particle component for background effects
const Particle = ({ x, y, delay, duration }) => (
  <div
    className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      animation: `float ${duration}s infinite linear`,
      animationDelay: `${delay}s`
    }}
  />
);

// Streaming data generator
const generateStreamData = (points = 50) => {
  return Array.from({ length: points }, (_, i) => ({
    time: new Date(Date.now() - (points - i) * 1000).toLocaleTimeString(),
    timestamp: Date.now() - (points - i) * 1000,
    throughput: Math.floor(Math.random() * 1000) + 500,
    latency: Math.floor(Math.random() * 50) + 10,
    errors: Math.floor(Math.random() * 5),
    cpu: Math.floor(Math.random() * 30) + 40,
    memory: Math.floor(Math.random() * 40) + 30
  }));
};

const generatePipelineData = () => ({
  processed: Math.floor(Math.random() * 10000) + 50000,
  failed: Math.floor(Math.random() * 100) + 10,
  pending: Math.floor(Math.random() * 1000) + 500,
  rate: Math.floor(Math.random() * 500) + 1000
});

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue" }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-500/20`}>
        <Icon className={`h-6 w-6 text-${color}-400`} />
      </div>
      {trend && (
        <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          <TrendingUp className="h-4 w-4 mr-1" />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{title}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

// Stream Details Modal
const StreamModal = ({ isOpen, onClose, streamData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Stream Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MetricCard
            title="Current Throughput"
            value={`${streamData?.throughput || 0}/s`}
            subtitle="Messages per second"
            icon={Activity}
            color="green"
          />
          <MetricCard
            title="Average Latency"
            value={`${streamData?.latency || 0}ms`}
            subtitle="End-to-end processing"
            icon={Zap}
            color="yellow"
          />
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-b-0">
                <span className="text-gray-300">Message batch #{Math.floor(Math.random() * 10000)}</span>
                <span className="text-green-400 text-sm">Processed</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function StreamingDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamData, setStreamData] = useState(generateStreamData());
  const [pipelineData, setPipelineData] = useState(generatePipelineData());
  const [modalOpen, setModalOpen] = useState(false);
  const [particles, setParticles] = useState([]);

  // Generate particles for background effect
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }));
    setParticles(newParticles);
  }, []);

  // Real-time data updates
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setStreamData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          throughput: Math.floor(Math.random() * 1000) + 500,
          latency: Math.floor(Math.random() * 50) + 10,
          errors: Math.floor(Math.random() * 5),
          cpu: Math.floor(Math.random() * 30) + 40,
          memory: Math.floor(Math.random() * 40) + 30
        };
        return [...prev.slice(-49), newPoint];
      });

      setPipelineData(generatePipelineData());
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const latestData = streamData[streamData.length - 1] || {};

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'pipelines', label: 'Pipelines', icon: Database },
    { id: 'monitoring', label: 'Monitoring', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <Particle key={particle.id} {...particle} />
        ))}
      </div>

      {/* Animated CSS */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) translateX(50px); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .streaming-indicator {
          animation: pulse 2s infinite;
        }
      `}</style>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Database className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">StreamFlow Analytics</h1>
                    <p className="text-sm text-gray-400">Real-time data pipeline monitoring</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-green-400 streaming-indicator' : 'bg-red-400'}`} />
                  <span className="text-sm text-gray-300">
                    {isStreaming ? 'Live' : 'Paused'}
                  </span>
                </div>
                <button
                  onClick={() => setIsStreaming(!isStreaming)}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    isStreaming 
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                  }`}
                >
                  {isStreaming ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Metrics Overview */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Throughput"
              value={`${latestData.throughput || 0}/s`}
              subtitle="Messages processed"
              icon={Activity}
              trend={5.2}
              color="green"
            />
            <MetricCard
              title="Latency"
              value={`${latestData.latency || 0}ms`}
              subtitle="Average processing time"
              icon={Zap}
              trend={-2.1}
              color="yellow"
            />
            <MetricCard
              title="Error Rate"
              value={`${((latestData.errors || 0) / (latestData.throughput || 1) * 100).toFixed(2)}%`}
              subtitle="Failed messages"
              icon={TrendingUp}
              trend={-0.8}
              color="red"
            />
            <MetricCard
              title="Active Streams"
              value="12"
              subtitle="Currently processing"
              icon={Database}
              trend={8.5}
              color="blue"
            />
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Real-time Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Throughput & Latency</h3>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                    >
                      <span className="text-sm">Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={streamData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="throughput" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                        name="Throughput"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="latency" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        dot={false}
                        name="Latency"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-6">System Resources</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={streamData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cpu" 
                        stackId="1"
                        stroke="#8B5CF6" 
                        fill="#8B5CF6"
                        fillOpacity={0.6}
                        name="CPU %"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="memory" 
                        stackId="1"
                        stroke="#06B6D4" 
                        fill="#06B6D4"
                        fillOpacity={0.6}
                        name="Memory %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Error Tracking */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-6">Error Tracking</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={streamData.slice(-20)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => value.split(':')[2]}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar 
                      dataKey="errors" 
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                      name="Errors"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'pipelines' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Processed"
                  value={pipelineData.processed.toLocaleString()}
                  subtitle="Total messages"
                  icon={Database}
                  color="green"
                />
                <MetricCard
                  title="Failed"
                  value={pipelineData.failed.toLocaleString()}
                  subtitle="Error count"
                  icon={TrendingUp}
                  color="red"
                />
                <MetricCard
                  title="Pending"
                  value={pipelineData.pending.toLocaleString()}
                  subtitle="In queue"
                  icon={Activity}
                  color="yellow"
                />
                <MetricCard
                  title="Rate"
                  value={`${pipelineData.rate}/min`}
                  subtitle="Processing rate"
                  icon={Zap}
                  color="blue"
                />
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-6">Pipeline Status</h3>
                <div className="space-y-4">
                  {['user-analytics', 'transaction-processor', 'notification-engine', 'data-warehouse'].map((pipeline, index) => (
                    <div key={pipeline} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full streaming-indicator" />
                        <span className="font-medium">{pipeline}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{Math.floor(Math.random() * 1000) + 500}/s</span>
                        <button className="text-blue-400 hover:text-blue-300">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-6">Data Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Processed', value: 85, fill: '#10B981' },
                          { name: 'Pending', value: 10, fill: '#F59E0B' },
                          { name: 'Failed', value: 5, fill: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-6">Performance Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={streamData.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="throughput" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stream Details Modal */}
      <StreamModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        streamData={latestData}
      />
    </div>
  );
}
