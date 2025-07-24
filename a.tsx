import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Brain, 
  Zap, 
  Users, 
  BarChart3, 
  Settings, 
  Plus, 
  ChevronDown, 
  ArrowRight, 
  Shield, 
  Calendar, 
  Paperclip,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Target,
  Activity,
  Archive,
  Reply,
  Forward,
  Trash2,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Send,
  Mic,
  Paperclip,
  Smile,
  MoreHorizontal
} from 'lucide-react';

// Mock data for demonstration
const mockEmails = [
  {
    id: 1,
    sender: "Sarah Johnson",
    senderEmail: "sarah.j@techcorp.com",
    subject: "Q4 Project Deadline - Action Required",
    preview: "Hi team, I need your input on the Q4 deliverables by Friday...",
    time: "2 min ago",
    priority: "high",
    category: "work",
    unread: true,
    sentiment: "urgent",
    aiScore: 95,
    hasAttachment: true,
    isVIP: true,
    responseType: "action_required"
  },
  {
    id: 2,
    sender: "Marketing Team",
    senderEmail: "noreply@newsletter.com",
    subject: "Weekly Newsletter - Industry Updates",
    preview: "This week's top industry trends and insights...",
    time: "1 hour ago",
    priority: "low",
    category: "newsletter",
    unread: true,
    sentiment: "neutral",
    aiScore: 30,
    hasAttachment: false,
    isVIP: false,
    responseType: "read_only"
  },
  {
    id: 3,
    sender: "David Chen",
    senderEmail: "d.chen@client.com",
    subject: "Meeting Follow-up and Next Steps",
    preview: "Thanks for the productive meeting yesterday. Here are the action items...",
    time: "3 hours ago",
    priority: "medium",
    category: "client",
    unread: false,
    sentiment: "positive",
    aiScore: 75,
    hasAttachment: true,
    isVIP: true,
    responseType: "follow_up"
  },
  {
    id: 4,
    sender: "HR Department",
    senderEmail: "hr@company.com",
    subject: "Benefits Enrollment Reminder",
    preview: "Don't forget to complete your benefits enrollment by...",
    time: "5 hours ago",
    priority: "medium",
    category: "hr",
    unread: true,
    sentiment: "reminder",
    aiScore: 60,
    hasAttachment: false,
    isVIP: false,
    responseType: "deadline"
  }
];

const mockAnalytics = {
  totalEmails: 1247,
  unreadCount: 23,
  avgResponseTime: "2.4 hours",
  productivityScore: 87,
  topSenders: [
    { name: "Sarah Johnson", count: 45, trend: "up" },
    { name: "David Chen", count: 32, trend: "up" },
    { name: "Marketing Team", count: 28, trend: "down" }
  ],
  categoryBreakdown: [
    { category: "Work", percentage: 45, color: "bg-blue-500" },
    { category: "Client", percentage: 30, color: "bg-green-500" },
    { category: "Newsletter", percentage: 15, color: "bg-yellow-500" },
    { category: "Personal", percentage: 10, color: "bg-purple-500" }
  ]
};

const EmailIntelligencePlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
    tone: 'professional'
  });

  const priorityColors = {
    high: 'border-l-red-500 bg-red-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    low: 'border-l-green-500 bg-green-50'
  };

  const categoryIcons = {
    work: Brain,
    client: Users,
    newsletter: Mail,
    hr: Shield,
    personal: Star
  };

  const sentimentColors = {
    urgent: 'text-red-600',
    positive: 'text-green-600',
    neutral: 'text-gray-600',
    reminder: 'text-blue-600'
  };

  // Sidebar Navigation
  const Sidebar = () => (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">EmailIQ</h1>
          <p className="text-sm text-slate-300">Smart Communication</p>
        </div>
      </div>

      <nav className="space-y-2">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
          { id: 'inbox', icon: Mail, label: 'Smart Inbox' },
          { id: 'compose', icon: Plus, label: 'Compose' },
          { id: 'analytics', icon: Activity, label: 'Analytics' },
          { id: 'automation', icon: Zap, label: 'Automation' },
          { id: 'settings', icon: Settings, label: 'Settings' }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-slate-700 rounded-lg">
        <h3 className="font-semibold mb-2">AI Insights</h3>
        <p className="text-sm text-slate-300">Your productivity is up 23% this week!</p>
        <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
        </div>
      </div>
    </div>
  );

  // Dashboard Component
  const Dashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Communication Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            All systems operational
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Emails</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalEmails}</p>
            </div>
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12% from last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.unreadCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <Target className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-blue-600">-8 from yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.avgResponseTime}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">15% faster</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Productivity Score</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.productivityScore}</p>
            </div>
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <Activity className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-600">Excellent performance</span>
          </div>
        </div>
      </div>

      {/* Email Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Email Categories</h3>
          <div className="space-y-3">
            {mockAnalytics.categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{category.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${category.color} h-2 rounded-full`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Top Senders</h3>
          <div className="space-y-3">
            {mockAnalytics.topSenders.map((sender, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
                      {sender.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-gray-700">{sender.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{sender.count}</span>
                  <TrendingUp className={`w-4 h-4 ${sender.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Smart Inbox Component
  const SmartInbox = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Smart Inbox</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails with AI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Emails</option>
            <option value="unread">Unread</option>
            <option value="high">High Priority</option>
            <option value="work">Work</option>
            <option value="client">Client</option>
          </select>
        </div>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {mockEmails.map((email) => {
          const CategoryIcon = categoryIcons[email.category];
          return (
            <div
              key={email.id}
              className={`p-4 border-l-4 ${priorityColors[email.priority]} border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors`}
              onClick={() => setSelectedEmail(email)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    email.isVIP ? 'bg-gold-100 border-2 border-yellow-400' : 'bg-gray-100'
                  }`}>
                    <span className="text-sm font-medium">
                      {email.sender.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-semibold ${email.unread ? 'text-gray-900' : 'text-gray-600'}`}>
                        {email.sender}
                      </p>
                      {email.isVIP && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      <CategoryIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    
                    <p className={`text-sm mb-1 ${email.unread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {email.subject}
                    </p>
                    
                    <p className="text-sm text-gray-500 truncate">
                      {email.preview}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">{email.time}</span>
                      <div className="flex items-center gap-1">
                        <Brain className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600">AI Score: {email.aiScore}</span>
                      </div>
                      {email.hasAttachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${sentimentColors[email.sentiment]} bg-gray-100`}>
                    {email.sentiment}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${
                    email.priority === 'high' ? 'bg-red-500' : 
                    email.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Email Compose Component
  const EmailCompose = () => (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Compose Email</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input
                type="email"
                value={composeData.to}
                onChange={(e) => setComposeData({...composeData, to: e.target.value})}
                placeholder="Enter recipient email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={composeData.subject}
                onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                placeholder="Enter subject line..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Tone:</label>
                  <select
                    value={composeData.tone}
                    onChange={(e) => setComposeData({...composeData, tone: e.target.value})}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
              </div>
              <textarea
                value={composeData.body}
                onChange={(e) => setComposeData({...composeData, body: e.target.value})}
                placeholder="Type your message here..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            {/* AI Suggestions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">AI Suggestions</span>
              </div>
              <div className="space-y-2">
                <button className="text-sm text-blue-700 hover:text-blue-900 block">
                  "Thank you for your email. I'll review this and get back to you by..."
                </button>
                <button className="text-sm text-blue-700 hover:text-blue-900 block">
                  "I appreciate you reaching out. Let me schedule a call to discuss..."
                </button>
                <button className="text-sm text-blue-700 hover:text-blue-900 block">
                  "Thanks for the update. I've noted the changes and will proceed..."
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Save Draft
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Automation Component
  const Automation = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Email Automation</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Active Rules
          </h3>
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-archive newsletters</p>
                  <p className="text-sm text-gray-600">Automatically archive marketing emails</p>
                </div>
                <div className="w-8 h-4 bg-green-500 rounded-full p-1">
                  <div className="w-2 h-2 bg-white rounded-full ml-auto"></div>
                </div>
              </div>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">VIP notifications</p>
                  <p className="text-sm text-gray-600">Instant alerts for important senders</p>
                </div>
                <div className="w-8 h-4 bg-green-500 rounded-full p-1">
                  <div className="w-2 h-2 bg-white rounded-full ml-auto"></div>
                </div>
              </div>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Meeting auto-responses</p>
                  <p className="text-sm text-gray-600">Auto-reply to meeting requests</p>
                </div>
                <div className="w-8 h-4 bg-gray-300 rounded-full p-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Create New Rule
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
              <input
                type="text"
                placeholder="Enter rule name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Condition</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Sender contains...</option>
                <option>Subject contains...</option>
                <option>Email body contains...</option>
                <option>Has attachment</option>
                <option>Priority level is...</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Move to folder</option>
                <option>Mark as read</option>
                <option>Send auto-reply</option>
                <option>Create task</option>
                <option>Forward to...</option>
              </select>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Create Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inbox':
        return <SmartInbox />;
      case 'compose':
        return <EmailCompose />;
      case 'automation':
        return <Automation />;
      case 'analytics':
        return <Dashboard />; // For now, using dashboard
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailIntelligencePlatform;
