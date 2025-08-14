import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, FileText, FolderOpen, Users, Settings, BarChart3, Filter, Tag, Clock, Download, Eye, Edit3, Share2, Star, Brain, Zap, Shield, Smartphone, Globe, TrendingUp, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronRight, Plus, MoreHorizontal, Bell, User, Calendar, MessageSquare, ThumbsUp, BookOpen, Sparkles, Target, Layers, Database, Cloud, Lock, Activity } from 'lucide-react';

const DocumentIntelligencePlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Mock data
  const mockDocuments = [
    {
      id: 1,
      name: "Q4 Financial Report.pdf",
      type: "financial",
      size: "2.4 MB",
      date: "2024-01-15",
      tags: ["Financial", "Q4", "Reports"],
      confidence: 98.5,
      status: "processed",
      thumbnail: "📊",
      summary: "Comprehensive quarterly financial analysis showing 15% revenue growth",
      aiInsights: ["Revenue increased 15% YoY", "Profit margins improved", "Cash flow positive"],
      collaborators: ["John Doe", "Jane Smith"],
      lastViewed: "2 hours ago",
      category: "Finance"
    },
    {
      id: 2,
      name: "Product Roadmap 2024.docx",
      type: "strategic",
      size: "1.8 MB",
      date: "2024-01-10",
      tags: ["Strategy", "Roadmap", "Product"],
      confidence: 95.2,
      status: "processing",
      thumbnail: "🗺️",
      summary: "Strategic product development plan for 2024 with key milestones",
      aiInsights: ["5 major product releases planned", "AI integration prioritized", "Mobile-first approach"],
      collaborators: ["Alex Johnson", "Sarah Wilson"],
      lastViewed: "1 day ago",
      category: "Strategy"
    },
    {
      id: 3,
      name: "Legal Contract - Vendor Agreement.pdf",
      type: "legal",
      size: "892 KB",
      date: "2024-01-08",
      tags: ["Legal", "Contract", "Vendor"],
      confidence: 99.1,
      status: "processed",
      thumbnail: "⚖️",
      summary: "Vendor service agreement with key terms and conditions",
      aiInsights: ["Contract expires in 6 months", "Auto-renewal clause present", "Payment terms: Net 30"],
      collaborators: ["Legal Team", "Procurement"],
      lastViewed: "3 days ago",
      category: "Legal"
    },
    {
      id: 4,
      name: "Research Paper - AI Innovations.pdf",
      type: "research",
      size: "3.2 MB",
      date: "2024-01-05",
      tags: ["Research", "AI", "Innovation"],
      confidence: 97.8,
      status: "processed",
      thumbnail: "🔬",
      summary: "Cutting-edge research on AI applications in document processing",
      aiInsights: ["15 citations found", "Novel AI approaches discussed", "Implementation roadmap included"],
      collaborators: ["Research Team"],
      lastViewed: "5 days ago",
      category: "Research"
    }
  ];

  const analytics = {
    totalDocuments: 1247,
    processed: 1198,
    pending: 49,
    storage: "89.2 GB",
    monthlyGrowth: "+12%",
    collaborators: 24,
    searchQueries: 1834,
    aiInsights: 892
  };

  const DocumentCard = ({ doc, onClick }) => (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:border-blue-200"
      onClick={() => onClick(doc)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{doc.thumbnail}</div>
          <div>
            <h3 className="font-semibold text-gray-900 truncate max-w-[200px]">{doc.name}</h3>
            <p className="text-sm text-gray-500">{doc.size} • {doc.date}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {doc.status === 'processed' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
          )}
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doc.summary}</p>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {doc.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>{doc.collaborators.length} collaborators</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{doc.confidence}% confidence</span>
        </div>
      </div>
    </div>
  );

  const DocumentViewer = ({ document, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{document.thumbnail}</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{document.name}</h2>
              <p className="text-sm text-gray-500">{document.category} • {document.size}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit3 className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <XCircle className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-2/3 bg-gray-50 p-6 overflow-auto">
            <div className="bg-white rounded-lg p-8 shadow-sm min-h-full">
              <div className="prose max-w-none">
                <h1>Document Preview</h1>
                <p>This is a high-fidelity preview of your document with intelligent text extraction and formatting preservation.</p>
                <h2>Key Insights from AI Analysis:</h2>
                <ul>
                  {document.aiInsights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
                <p>{document.summary}</p>
                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">AI-Generated Summary</span>
                  </div>
                  <p className="text-blue-800">{document.summary}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-1/3 border-l border-gray-200 p-6 overflow-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                  AI Insights
                </h3>
                <div className="space-y-2">
                  {document.aiInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <span className="text-purple-800 text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-blue-500" />
                  Tags & Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-500" />
                  Collaborators
                </h3>
                <div className="space-y-2">
                  {document.collaborators.map((collaborator, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {collaborator.charAt(0)}
                      </div>
                      <span className="text-gray-700">{collaborator}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-orange-500" />
                  Document Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Confidence</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: `${document.confidence}%`}}></div>
                      </div>
                      <span className="text-sm font-medium">{document.confidence}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last viewed</span>
                    <span className="text-gray-900 font-medium">{document.lastViewed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900 font-medium">{document.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const UploadZone = () => (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop files here or click to upload</h3>
          <p className="text-gray-600">Support for PDF, DOC, DOCX, images, and more</p>
        </div>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <span>📄 Documents</span>
          <span>🖼️ Images</span>
          <span>📊 Spreadsheets</span>
          <span>📋 Forms</span>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8" />
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">{analytics.totalDocuments.toLocaleString()}</h3>
                <p className="text-blue-100">Total Documents</p>
                <div className="text-sm text-blue-100 mt-2">{analytics.monthlyGrowth} this month</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8" />
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">{analytics.processed}</h3>
                <p className="text-green-100">AI Processed</p>
                <div className="text-sm text-green-100 mt-2">99.2% success rate</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8" />
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">{analytics.collaborators}</h3>
                <p className="text-purple-100">Active Users</p>
                <div className="text-sm text-purple-100 mt-2">+3 this week</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Database className="w-8 h-8" />
                  <Cloud className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">{analytics.storage}</h3>
                <p className="text-orange-100">Storage Used</p>
                <div className="text-sm text-orange-100 mt-2">of 500 GB</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Document processed successfully</p>
                      <p className="text-xs text-gray-500">Q4 Financial Report.pdf • 2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Document shared with team</p>
                      <p className="text-xs text-gray-500">Product Roadmap 2024.docx • 1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Contract expiring soon</p>
                      <p className="text-xs text-gray-500">Vendor Agreement.pdf • 3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  AI Insights
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Smart Recommendation</span>
                    </div>
                    <p className="text-sm text-purple-800">15 documents could benefit from better tagging for improved searchability.</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Optimization Tip</span>
                    </div>
                    <p className="text-sm text-green-800">Consider archiving 23 old documents to free up storage space.</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Action Required</span>
                    </div>
                    <p className="text-sm text-orange-800">3 contracts require attention within the next 30 days.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Document Library</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                  />
                </div>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDocuments
                .filter(doc => 
                  searchQuery === '' || 
                  doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map(doc => (
                  <DocumentCard key={doc.id} doc={doc} onClick={setSelectedDocument} />
                ))}
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Documents</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our advanced AI will automatically process, categorize, and extract insights from your documents
              </p>
            </div>

            <UploadZone />

            {isProcessing && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Processing Documents</h3>
                  <p className="text-gray-600">AI is analyzing your documents and extracting insights...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Processing</h3>
                <p className="text-gray-600 text-sm">Advanced OCR and NLP extract structured data with 99.9% accuracy</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Auto Organization</h3>
                <p className="text-gray-600 text-sm">Smart categorization and tagging based on content analysis</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
                <p className="text-gray-600 text-sm">Enterprise-grade encryption and compliance features</p>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Document Processing Trends</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-gray-900">342 documents</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>85% vs last month</span>
                    <span className="text-green-600">+12% growth</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Document Categories</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Financial</span>
                    </div>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Legal</span>
                    </div>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700">Strategic</span>
                    </div>
                    <span className="font-medium">22%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">Research</span>
                    </div>
                    <span className="font-medium">15%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Processing Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">99.2%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2.3s</div>
                  <div className="text-gray-600">Avg Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">892</div>
                  <div className="text-gray-600">AI Insights Generated</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DocuMind AI</h1>
              <p className="text-sm text-gray-500">Intelligent Document Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-6 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'search', label: 'Search', icon: Search },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'collaboration', label: 'Collaboration', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer 
          document={selectedDocument} 
          onClose={() => setSelectedDocument(null)} 
        />
      )}
    </div>
  );
};

export default DocumentIntelligencePlatform;
