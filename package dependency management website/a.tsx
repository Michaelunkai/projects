import React, { useState, useEffect } from 'react';
import { Upload, AlertTriangle, CheckCircle, XCircle, TrendingUp, FileText, GitBranch, Play, Eye, Shield, Zap, Activity } from 'lucide-react';

const SafeUpdatePlatform = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Mock data for demonstration
  const mockProjects = [
    {
      id: 1,
      name: 'E-commerce Frontend',
      type: 'npm',
      file: 'package.json',
      lastScan: '2 hours ago',
      dependencies: 47,
      outdated: 12,
      riskScore: 'medium',
      criticalIssues: 2
    },
    {
      id: 2,
      name: 'API Backend',
      type: 'pip',
      file: 'requirements.txt',
      lastScan: '1 day ago',
      dependencies: 23,
      outdated: 8,
      riskScore: 'low',
      criticalIssues: 0
    }
  ];

  const mockDependencies = [
    {
      name: 'react',
      current: '17.0.2',
      latest: '18.2.0',
      type: 'major',
      riskLevel: 'high',
      breakingChanges: ['Concurrent rendering', 'Strict mode changes', 'useEffect cleanup'],
      usageInCode: 23,
      deprecatedAPIs: ['ReactDOM.render'],
      testCoverage: 85,
      confidence: 65
    },
    {
      name: 'axios',
      current: '0.21.1',
      latest: '1.4.0',
      type: 'major',
      riskLevel: 'medium',
      breakingChanges: ['Request/Response interceptors API'],
      usageInCode: 8,
      deprecatedAPIs: [],
      testCoverage: 92,
      confidence: 78
    },
    {
      name: 'lodash',
      current: '4.17.19',
      latest: '4.17.21',
      type: 'patch',
      riskLevel: 'low',
      breakingChanges: [],
      usageInCode: 15,
      deprecatedAPIs: [],
      testCoverage: 95,
      confidence: 95
    }
  ];

  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch(level) {
      case 'high': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SafeUpdate Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your dependencies with confidence, not anxiety</p>
        </div>
        <button 
          onClick={() => setCurrentView('upload')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Analyze New Project
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-gray-600">Active Projects</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">20</p>
              <p className="text-gray-600">Outdated Dependencies</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-gray-600">Critical Issues</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">78%</p>
              <p className="text-gray-600">Avg. Confidence Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
          <p className="text-gray-600 mt-1">Click on a project to view detailed dependency analysis</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {mockProjects.map(project => (
              <div 
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setCurrentView('analysis');
                }}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-gray-600 text-sm">{project.file} • Last scan: {project.lastScan}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{project.dependencies} dependencies</p>
                      <p className="text-sm font-medium text-orange-600">{project.outdated} outdated</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm border ${getRiskColor(project.riskScore)}`}>
                      {project.riskScore} risk
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const UploadView = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analyze Your Project</h1>
        <p className="text-gray-600">Upload your dependency file to get started with risk-free updates</p>
      </div>

      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop your files here</h3>
        <p className="text-gray-600 mb-4">Or click to browse</p>
        <p className="text-sm text-gray-500">
          Supported: package.json, requirements.txt, Gemfile, composer.json
        </p>
        <button 
          onClick={() => {
            setAnalysisComplete(true);
            setTimeout(() => setCurrentView('analysis'), 2000);
          }}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Choose Files
        </button>
      </div>

      {analysisComplete && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="font-semibold text-blue-900">Analyzing your project...</span>
          </div>
          <div className="space-y-2 text-sm text-blue-800">
            <p>✓ Parsing package.json</p>
            <p>✓ Scanning codebase for API usage</p>
            <p>✓ Checking for breaking changes</p>
            <p>✓ Calculating risk scores</p>
            <p>✓ Generating test recommendations</p>
          </div>
        </div>
      )}
    </div>
  );

  const AnalysisView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedProject?.name || 'E-commerce Frontend'} Analysis
          </h1>
          <p className="text-gray-600 mt-2">Detailed dependency risk assessment and update plan</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <GitBranch className="w-5 h-5" />
            Create Test Branches
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Play className="w-5 h-5" />
            Run Tests
          </button>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">12</div>
            <div className="text-gray-700">Outdated Dependencies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">71%</div>
            <div className="text-gray-700">Overall Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">3</div>
            <div className="text-gray-700">Safe Updates</div>
          </div>
        </div>
      </div>

      {/* Dependencies List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Dependency Analysis</h2>
          <p className="text-gray-600 mt-1">Click on any dependency to see detailed impact analysis</p>
        </div>
        <div className="divide-y divide-gray-200">
          {mockDependencies.map((dep, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getRiskIcon(dep.riskLevel)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{dep.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {dep.current} → {dep.latest} ({dep.type} update)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Used in {dep.usageInCode} files</p>
                    <p className="text-sm text-gray-600">{dep.testCoverage}% test coverage</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm border ${getRiskColor(dep.riskLevel)}`}>
                      {dep.confidence}% confidence
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs mt-1 ${getRiskColor(dep.riskLevel)}`}>
                      {dep.riskLevel} risk
                    </div>
                  </div>
                  <button 
                    onClick={() => setCurrentView('details')}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {dep.breakingChanges.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-2">Potential Breaking Changes:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {dep.breakingChanges.map((change, i) => (
                      <li key={i}>• {change}</li>
                    ))}
                  </ul>
                </div>
              )}

              {dep.deprecatedAPIs.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Deprecated APIs in Your Code:</p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {dep.deprecatedAPIs.map((api, i) => (
                      <li key={i}>• {api}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DetailView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">React Update Analysis</h1>
          <p className="text-gray-600 mt-2">17.0.2 → 18.2.0 (Major Version)</p>
        </div>
        <div className="flex gap-3">
          <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            View Changes
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
            Create Update Branch
          </button>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Assessment
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Breaking Changes</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">High Impact</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">API Usage</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">3 Deprecated</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Test Coverage</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Confidence Score</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">65%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Impact Analysis
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 mb-2">Files Affected: <strong>23</strong></p>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '48%'}}></div>
              </div>
            </div>
            <div>
              <p className="text-gray-700 mb-2">Breaking Changes: <strong>3</strong></p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ReactDOM.render → createRoot</li>
                <li>• useEffect strict mode behavior</li>
                <li>• Event handler prop changes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Code Impact */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Code Impact Preview</h3>
          <p className="text-gray-600 mt-1">See exactly what needs to change in your codebase</p>
        </div>
        <div className="p-6">
          <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono">
            <div className="text-red-400 mb-2">- ReactDOM.render(&lt;App /&gt;, document.getElementById('root'));</div>
            <div className="text-green-400">+ const root = ReactDOM.createRoot(document.getElementById('root'));</div>
            <div className="text-green-400">+ root.render(&lt;App /&gt;);</div>
          </div>
          <p className="text-gray-600 text-sm mt-3">Found in: src/index.js, src/components/Modal.js</p>
        </div>
      </div>

      {/* Automated Tests */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recommended Tests</h3>
          <p className="text-gray-600 mt-1">Automated test plan for validating this update</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Component Rendering Tests</h4>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Automated</span>
              </div>
              <p className="text-gray-600 text-sm">Test all components render correctly with React 18</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">useEffect Behavior Tests</h4>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Manual Review</span>
              </div>
              <p className="text-gray-600 text-sm">Verify side effects work correctly in strict mode</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Event Handler Tests</h4>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Passing</span>
              </div>
              <p className="text-gray-600 text-sm">All event handlers work with new React event system</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Navigation = () => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SafeUpdate</span>
            </div>
            <nav className="flex gap-6">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('analysis')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'analysis' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analysis
              </button>
              <button 
                onClick={() => setCurrentView('details')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'details' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Details
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch(currentView) {
      case 'upload': return <UploadView />;
      case 'analysis': return <AnalysisView />;
      case 'details': return <DetailView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default SafeUpdatePlatform;
