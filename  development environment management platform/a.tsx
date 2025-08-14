import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Code, 
  Database, 
  Terminal, 
  GitBranch, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  Clock, 
  Zap, 
  Monitor, 
  FileCode, 
  AlertCircle, 
  CheckCircle, 
  Coffee, 
  Brain, 
  Layers,
  BarChart3,
  Calendar,
  Timer,
  Users,
  Shield,
  Cpu,
  HardDrive,
  Wifi,
  Container
} from 'lucide-react';

const DevFlowManager = () => {
  const [activeProject, setActiveProject] = useState('ecommerce-app');
  const [focusMode, setFocusMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const projects = [
    {
      id: 'ecommerce-app',
      name: 'E-commerce Platform',
      status: 'active',
      language: 'TypeScript',
      framework: 'Next.js',
      services: ['postgres', 'redis', 'docker'],
      lastActive: '2 min ago',
      healthScore: 98,
      linesOfCode: 47832,
      coverage: 89
    },
    {
      id: 'ml-pipeline',
      name: 'ML Data Pipeline',
      status: 'standby',
      language: 'Python',
      framework: 'FastAPI',
      services: ['mongodb', 'celery'],
      lastActive: '1 hour ago',
      healthScore: 94,
      linesOfCode: 23156,
      coverage: 76
    },
    {
      id: 'mobile-app',
      name: 'React Native App',
      status: 'inactive',
      language: 'JavaScript',
      framework: 'React Native',
      services: ['firebase'],
      lastActive: '3 days ago',
      healthScore: 91,
      linesOfCode: 15673,
      coverage: 82
    }
  ];

  const currentProject = projects.find(p => p.id === activeProject);

  const productivityData = [
    { time: '09:00', focus: 78, commits: 3, tests: 12 },
    { time: '10:00', focus: 89, commits: 5, tests: 8 },
    { time: '11:00', focus: 95, commits: 7, tests: 15 },
    { time: '12:00', focus: 72, commits: 2, tests: 4 },
    { time: '14:00', focus: 88, commits: 6, tests: 11 },
    { time: '15:00', focus: 92, commits: 8, tests: 9 },
    { time: '16:00', focus: 85, commits: 4, tests: 13 }
  ];

  const environmentServices = [
    { name: 'PostgreSQL', status: 'running', cpu: 15, memory: 256 },
    { name: 'Redis', status: 'running', cpu: 8, memory: 128 },
    { name: 'Docker Compose', status: 'running', cpu: 22, memory: 512 },
    { name: 'VS Code Server', status: 'running', cpu: 35, memory: 1024 },
    { name: 'Node.js Dev Server', status: 'running', cpu: 45, memory: 768 }
  ];

  const codeQualityMetrics = [
    { metric: 'Code Coverage', value: 89, trend: '+3%', status: 'good' },
    { metric: 'Technical Debt', value: 23, trend: '-5%', status: 'improving' },
    { metric: 'Complexity Score', value: 6.8, trend: '-0.2', status: 'good' },
    { metric: 'Security Issues', value: 2, trend: '-1', status: 'warning' }
  ];

  const recentActivities = [
    { time: '2 min ago', action: 'Automated test suite completed', status: 'success' },
    { time: '5 min ago', action: 'Docker container optimized', status: 'info' },
    { time: '12 min ago', action: 'Code quality check passed', status: 'success' },
    { time: '18 min ago', action: 'Environment sync completed', status: 'success' },
    { time: '25 min ago', action: 'New dependency vulnerability detected', status: 'warning' }
  ];

  const aiInsights = [
    {
      type: 'productivity',
      title: 'Peak Performance Window',
      description: 'You code 34% more efficiently between 10-11 AM. Consider scheduling complex features during this time.',
      impact: 'high'
    },
    {
      type: 'code-quality',
      title: 'Refactoring Opportunity',
      description: 'UserService.ts has grown to 450 lines. Consider splitting into smaller modules.',
      impact: 'medium'
    },
    {
      type: 'automation',
      title: 'Workflow Automation',
      description: 'Detected repetitive Git workflow. Created automated branch naming script.',
      impact: 'low'
    }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'environments', label: 'Environments', icon: Settings },
    { id: 'insights', label: 'AI Insights', icon: Brain }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/50',
      standby: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      running: 'bg-green-500/20 text-green-400 border-green-500/50'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${colors[status]} transition-all duration-300`}>
        {status}
      </span>
    );
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <motion.div
      variants={itemVariants}
      className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {trend && (
          <span className={`text-sm ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );

  const ProjectCard = ({ project, isActive, onClick }) => (
    <motion.div
      variants={itemVariants}
      className={`bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border cursor-pointer transition-all duration-300 ${
        isActive ? 'border-blue-500/50 bg-blue-900/20' : 'border-gray-800/50 hover:border-gray-700/50'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Code className="w-4 h-4" />
            {project.language}
          </span>
          <span>{project.framework}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Health Score</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${project.healthScore}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
            <span className="text-green-400 text-sm font-medium">{project.healthScore}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {project.services.map((service, index) => (
            <span key={index} className="px-2 py-1 bg-gray-800/50 rounded">
              {service}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const ProductivityChart = () => (
    <motion.div
      variants={itemVariants}
      className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Today's Productivity</h3>
      <div className="space-y-4">
        {productivityData.map((data, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-sm text-gray-400 w-12">{data.time}</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${data.focus}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
              <span className="text-sm text-purple-400 w-8">{data.focus}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-400">{data.commits} commits</span>
              <span className="text-blue-400">{data.tests} tests</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const EnvironmentServices = () => (
    <motion.div
      variants={itemVariants}
      className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Environment Services</h3>
        <motion.button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Optimize All
        </motion.button>
      </div>
      
      <div className="space-y-4">
        {environmentServices.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white font-medium">{service.name}</span>
              <StatusBadge status={service.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-4 h-4" />
                {service.cpu}%
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-4 h-4" />
                {service.memory}MB
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const AIInsightsPanel = () => (
    <motion.div
      variants={itemVariants}
      className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
    >
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">AI Insights</h3>
      </div>
      
      <div className="space-y-4">
        {aiInsights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="p-4 bg-gray-800/30 rounded-lg border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">{insight.title}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                insight.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {insight.impact} impact
              </span>
            </div>
            <p className="text-gray-400 text-sm">{insight.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                  title="Active Sessions" 
                  value="3" 
                  icon={Activity} 
                  trend="+1" 
                  color="green" 
                />
                <MetricCard 
                  title="Code Quality" 
                  value="94%" 
                  icon={CheckCircle} 
                  trend="+2%" 
                  color="blue" 
                />
                <MetricCard 
                  title="Focus Score" 
                  value="89%" 
                  icon={Zap} 
                  trend="+5%" 
                  color="purple" 
                />
              </div>
              <ProductivityChart />
              <EnvironmentServices />
            </div>
            
            <div className="space-y-6">
              <motion.div
                variants={itemVariants}
                className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Active Project</h3>
                {currentProject && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">{currentProject.name}</h4>
                      <StatusBadge status={currentProject.status} />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lines of Code</span>
                        <span className="text-white">{currentProject.linesOfCode.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Test Coverage</span>
                        <span className="text-green-400">{currentProject.coverage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Active</span>
                        <span className="text-blue-400">{currentProject.lastActive}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivities.slice(0, 4).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-green-400' :
                        activity.status === 'warning' ? 'bg-yellow-400' :
                        'bg-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        );
      
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Project Management</h2>
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                New Project
              </motion.button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isActive={activeProject === project.id}
                  onClick={() => setActiveProject(project.id)}
                />
              ))}
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Development Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-4">
                {codeQualityMetrics.map((metric, index) => (
                  <MetricCard
                    key={index}
                    title={metric.metric}
                    value={metric.value}
                    icon={BarChart3}
                    trend={metric.trend}
                    color={metric.status === 'good' ? 'green' : metric.status === 'warning' ? 'yellow' : 'blue'}
                  />
                ))}
              </div>
              <ProductivityChart />
            </div>
          </div>
        );
      
      case 'environments':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Environment Management</h2>
            <EnvironmentServices />
          </div>
        );
      
      case 'insights':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">AI-Powered Insights</h2>
            <AIInsightsPanel />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">DevFlow</h1>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </motion.button>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setFocusMode(!focusMode)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  focusMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Coffee className="w-4 h-4" />
              </motion.button>
              
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50 text-center"
            >
              <Coffee className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Focus Mode Active</h2>
              <p className="text-gray-400 mb-6">Minimizing distractions for optimal coding flow</p>
              <motion.button
                onClick={() => setFocusMode(false)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Exit Focus Mode
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DevFlowManager;
