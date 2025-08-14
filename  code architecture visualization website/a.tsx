import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Github, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Eye, Code, GitBranch, AlertTriangle, Layers, Network, FileText, Settings } from 'lucide-react';

// Mock data for demonstration
const mockCodebase = {
  files: [
    { id: 'app.js', type: 'javascript', complexity: 85, lines: 450, functions: ['initApp', 'handleRouting', 'setupMiddleware'] },
    { id: 'api/users.js', type: 'javascript', complexity: 65, lines: 280, functions: ['getUsers', 'createUser', 'updateUser', 'deleteUser'] },
    { id: 'components/UserList.jsx', type: 'javascript', complexity: 45, lines: 180, functions: ['UserList', 'UserItem', 'handleUserClick'] },
    { id: 'services/auth.js', type: 'javascript', complexity: 75, lines: 320, functions: ['login', 'logout', 'validateToken', 'refreshToken'] },
    { id: 'utils/database.py', type: 'python', complexity: 90, lines: 380, functions: ['connect', 'query', 'migrate', 'backup'] },
    { id: 'models/User.java', type: 'java', complexity: 55, lines: 220, functions: ['User', 'getName', 'setEmail', 'validate'] },
    { id: 'controllers/AuthController.cs', type: 'csharp', complexity: 70, lines: 290, functions: ['Login', 'Register', 'Logout', 'RefreshToken'] }
  ],
  dependencies: [
    { from: 'app.js', to: 'api/users.js', type: 'import', strength: 8 },
    { from: 'app.js', to: 'services/auth.js', type: 'import', strength: 9 },
    { from: 'components/UserList.jsx', to: 'api/users.js', type: 'api-call', strength: 7 },
    { from: 'api/users.js', to: 'utils/database.py', type: 'service-call', strength: 9 },
    { from: 'services/auth.js', to: 'utils/database.py', type: 'service-call', strength: 6 },
    { from: 'api/users.js', to: 'models/User.java', type: 'model', strength: 8 },
    { from: 'controllers/AuthController.cs', to: 'services/auth.js', type: 'cross-service', strength: 5 }
  ],
  circularDeps: [
    { nodes: ['app.js', 'services/auth.js', 'api/users.js'], severity: 'medium' }
  ]
};

const CodeArchitectureVisualizer = () => {
  const [viewMode, setViewMode] = useState('modules');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('zip');
  const [graphLayout, setGraphLayout] = useState('force');
  const [showComplexity, setShowComplexity] = useState(true);
  const [highlightCircular, setHighlightCircular] = useState(false);
  const containerRef = useRef(null);
  const codeEditorRef = useRef(null);

  // Mock Monaco Editor content
  const [editorContent, setEditorContent] = useState(`// Selected: app.js
// Sample code preview - click nodes to view their content

function initApp() {
  console.log('Initializing application...');
  
  // Setup authentication
  const auth = require('./services/auth');
  auth.initialize();
  
  // Setup API routes
  const userRoutes = require('./api/users');
  app.use('/api/users', userRoutes);
  
  // Setup middleware
  app.use(cors());
  app.use(express.json());
  
  return app;
}

module.exports = initApp;`);

  // Simulate graph data based on view mode
  const getGraphData = useCallback(() => {
    const nodes = mockCodebase.files.map(file => {
      const size = showComplexity ? Math.max(20, file.complexity / 2) : 30;
      const color = getFileTypeColor(file.type);
      
      return {
        id: file.id,
        label: file.id.split('/').pop(),
        size,
        color,
        complexity: file.complexity,
        type: file.type,
        lines: file.lines,
        functions: file.functions,
        x: Math.random() * 800,
        y: Math.random() * 600
      };
    });

    const edges = mockCodebase.dependencies.map(dep => ({
      id: `${dep.from}-${dep.to}`,
      source: dep.from,
      target: dep.to,
      type: dep.type,
      strength: dep.strength,
      color: highlightCircular && isCircularDependency(dep.from, dep.to) ? '#ef4444' : '#64748b'
    }));

    return { nodes, edges };
  }, [viewMode, showComplexity, highlightCircular]);

  const getFileTypeColor = (type) => {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      java: '#ed8b00',
      csharp: '#239120'
    };
    return colors[type] || '#64748b';
  };

  const isCircularDependency = (from, to) => {
    return mockCodebase.circularDeps.some(cycle => 
      cycle.nodes.includes(from) && cycle.nodes.includes(to)
    );
  };

  const handleNodeClick = (nodeId) => {
    const file = mockCodebase.files.find(f => f.id === nodeId);
    if (file) {
      setSelectedNode(file);
      // Update editor content based on selected file
      const mockContent = generateMockCode(file);
      setEditorContent(mockContent);
    }
  };

  const generateMockCode = (file) => {
    const templates = {
      javascript: `// ${file.id}
${file.functions.map(fn => `
function ${fn}() {
  // Implementation here
  console.log('Executing ${fn}');
}`).join('\n')}

export { ${file.functions.join(', ')} };`,
      python: `# ${file.id}
${file.functions.map(fn => `
def ${fn}():
    """${fn} implementation"""
    print(f"Executing ${fn}")
    pass`).join('\n')}`,
      java: `// ${file.id}
public class ${file.id.split('.')[0]} {
${file.functions.map(fn => `    
    public void ${fn}() {
        System.out.println("Executing ${fn}");
    }`).join('\n')}
}`,
      csharp: `// ${file.id}
public class ${file.id.split('.')[0]} {
${file.functions.map(fn => `    
    public void ${fn}() {
        Console.WriteLine("Executing ${fn}");
    }`).join('\n')}
}`
    };
    return templates[file.type] || `// ${file.id}\n// Code content here...`;
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate analysis progress
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  const GraphVisualization = () => {
    const [hoveredNode, setHoveredNode] = useState(null);
    const graphData = getGraphData();

    return (
      <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
        {/* Graph Canvas Simulation */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
          <svg className="w-full h-full">
            {/* Render edges */}
            {graphData.edges.map(edge => {
              const sourceNode = graphData.nodes.find(n => n.id === edge.source);
              const targetNode = graphData.nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;
              
              return (
                <line
                  key={edge.id}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={edge.color}
                  strokeWidth={edge.strength / 2}
                  className="opacity-60 transition-all duration-300"
                />
              );
            })}
            
            {/* Render nodes */}
            {graphData.nodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={node.color}
                  className="cursor-pointer transition-all duration-300 hover:scale-110"
                  onClick={() => handleNodeClick(node.id)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    filter: hoveredNode?.id === node.id ? 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' : 'none'
                  }}
                />
                <text
                  x={node.x}
                  y={node.y - node.size - 8}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  className="pointer-events-none"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
          
          {/* Node tooltip */}
          {hoveredNode && (
            <div className="absolute bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm shadow-lg"
                 style={{ left: hoveredNode.x + 20, top: hoveredNode.y - 50 }}>
              <div className="font-bold">{hoveredNode.id}</div>
              <div>Type: {hoveredNode.type}</div>
              <div>Complexity: {hoveredNode.complexity}</div>
              <div>Lines: {hoveredNode.lines}</div>
              <div>Functions: {hoveredNode.functions.length}</div>
            </div>
          )}
        </div>
        
        {/* Graph controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
            <ZoomIn size={20} />
          </button>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
            <ZoomOut size={20} />
          </button>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Network size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CodeViz
                </h1>
                <p className="text-gray-400 text-sm">Architecture Visualizer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setUploadMethod('zip')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    uploadMethod === 'zip' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Upload size={16} />
                  Upload ZIP
                </button>
                <button
                  onClick={() => setUploadMethod('github')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    uploadMethod === 'github' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Github size={16} />
                  GitHub Repo
                </button>
              </div>
              
              <button
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Control Panel */}
          <div className="col-span-3 bg-gray-900/50 rounded-lg border border-gray-800 p-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings size={20} />
                View Controls
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">View Mode</label>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="modules">High-level Modules</option>
                    <option value="functions">Function Calls</option>
                    <option value="dataflow">Data Flow</option>
                    <option value="inheritance">Inheritance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Graph Layout</label>
                  <select
                    value={graphLayout}
                    onChange={(e) => setGraphLayout(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="force">Force-directed</option>
                    <option value="circular">Circular</option>
                    <option value="hierarchical">Hierarchical</option>
                    <option value="grid">Grid</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Display Options</h4>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showComplexity}
                  onChange={(e) => setShowComplexity(e.target.checked)}
                  className="rounded bg-gray-800 border-gray-600"
                />
                <span className="text-sm">Show Complexity</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highlightCircular}
                  onChange={(e) => setHighlightCircular(e.target.checked)}
                  className="rounded bg-gray-800 border-gray-600"
                />
                <span className="text-sm">Highlight Circular Deps</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTimeline}
                  onChange={(e) => setShowTimeline(e.target.checked)}
                  className="rounded bg-gray-800 border-gray-600"
                />
                <span className="text-sm">Show Timeline</span>
              </label>
            </div>

            <div>
              <h4 className="font-medium mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors flex items-center gap-2">
                  <Eye size={16} />
                  Focus on Node
                </button>
                <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Find Issues
                </button>
                <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors flex items-center gap-2">
                  <Layers size={16} />
                  Group by Module
                </button>
              </div>
            </div>

            {/* Circular Dependencies Alert */}
            {highlightCircular && mockCodebase.circularDeps.length > 0 && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                  <AlertTriangle size={16} />
                  Circular Dependencies
                </div>
                <div className="text-sm text-red-300">
                  Found {mockCodebase.circularDeps.length} circular dependency cycle(s)
                </div>
                <button className="mt-2 text-xs text-red-400 hover:text-red-300 underline">
                  View suggestions to fix
                </button>
              </div>
            )}
          </div>

          {/* Graph Visualization */}
          <div className="col-span-6">
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 h-full">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Architecture Graph</h3>
                <div className="flex items-center gap-2">
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Analyzing...</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-400">
                    {mockCodebase.files.length} files, {mockCodebase.dependencies.length} connections
                  </span>
                </div>
              </div>
              <div className="p-4 h-[calc(100%-80px)]">
                <GraphVisualization />
              </div>
            </div>
          </div>

          {/* Code Preview */}
          <div className="col-span-3 space-y-4">
            {/* Selected Node Info */}
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText size={20} />
                {selectedNode ? selectedNode.id : 'Select a node'}
              </h3>
              
              {selectedNode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="ml-2 capitalize">{selectedNode.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Lines:</span>
                      <span className="ml-2">{selectedNode.lines}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Complexity:</span>
                      <span className="ml-2">{selectedNode.complexity}/100</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Functions:</span>
                      <span className="ml-2">{selectedNode.functions.length}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Functions:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedNode.functions.map(fn => (
                        <span key={fn} className="px-2 py-1 bg-gray-800 rounded text-xs">
                          {fn}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${selectedNode.complexity}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Click on a node in the graph to view details</p>
              )}
            </div>

            {/* Code Editor */}
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 flex-1">
              <div className="p-3 border-b border-gray-800 flex items-center gap-2">
                <Code size={16} />
                <span className="font-medium">Code Preview</span>
              </div>
              <div className="p-4 h-64 overflow-auto">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                  {editorContent}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {showTimeline && (
          <div className="mt-6 bg-gray-900/50 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <GitBranch size={20} />
                Architecture Evolution Timeline
              </h3>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Play size={16} />
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Pause size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {['v1.0.0', 'v1.1.0', 'v1.2.0', 'v2.0.0', 'v2.1.0'].map((version, index) => (
                <div key={version} className="flex-shrink-0 text-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-medium">{version}</div>
                  <div className="text-xs text-gray-400">
                    {['Initial release', 'Added auth', 'User management', 'Architecture refactor', 'Performance'][index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeArchitectureVisualizer;
