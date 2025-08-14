import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Plus, Code, Save, Download, Upload, Eye, Settings, Zap } from 'lucide-react';

const WorkflowAutomation = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggedNode, setDraggedNode] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionData, setExecutionData] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const canvasRef = useRef(null);
  const [nextNodeId, setNextNodeId] = useState(1);

  const nodeTypes = [
    { type: 'trigger', label: 'Trigger', icon: '🚀', color: 'from-purple-500 to-pink-500' },
    { type: 'api', label: 'API Call', icon: '🌐', color: 'from-blue-500 to-cyan-500' },
    { type: 'webscrape', label: 'Web Scraper', icon: '🕷️', color: 'from-green-500 to-teal-500' },
    { type: 'transform', label: 'Transform', icon: '🔄', color: 'from-yellow-500 to-orange-500' },
    { type: 'condition', label: 'Condition', icon: '❓', color: 'from-red-500 to-pink-500' },
    { type: 'email', label: 'Email', icon: '📧', color: 'from-indigo-500 to-purple-500' },
    { type: 'file', label: 'File Op', icon: '📁', color: 'from-gray-500 to-slate-500' },
    { type: 'loop', label: 'Loop', icon: '🔁', color: 'from-emerald-500 to-green-500' },
    { type: 'code', label: 'Custom Code', icon: '💻', color: 'from-violet-500 to-purple-500' }
  ];

  const templates = [
    { name: 'Website Monitor', description: 'Monitor website changes and send alerts' },
    { name: 'CSV Processor', description: 'Process and transform CSV data automatically' },
    { name: 'File Backup', description: 'Automated file backup and organization' },
    { name: 'API Integration', description: 'Connect multiple APIs and sync data' }
  ];

  const addNode = useCallback((type, x = 100, y = 100) => {
    const newNode = {
      id: `node-${nextNodeId}`,
      type,
      x,
      y,
      data: {},
      outputs: type === 'condition' ? ['true', 'false'] : ['output']
    };
    setNodes(prev => [...prev, newNode]);
    setNextNodeId(prev => prev + 1);
  }, [nextNodeId]);

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('nodeType', type);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addNode(type, x, y);
  };

  const executeWorkflow = async () => {
    setIsExecuting(true);
    setExecutionData({});
    
    // Simulate workflow execution
    const startNode = nodes.find(n => n.type === 'trigger');
    if (!startNode) {
      setIsExecuting(false);
      return;
    }

    // Animate data flow through nodes
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const node = nodes[i];
      setExecutionData(prev => ({
        ...prev,
        [node.id]: {
          status: 'executing',
          data: `Processing ${node.type} node...`,
          timestamp: new Date().toISOString()
        }
      }));
    }

    // Complete execution
    await new Promise(resolve => setTimeout(resolve, 500));
    setExecutionData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(nodeId => {
        updated[nodeId].status = 'completed';
      });
      return updated;
    });
    
    setIsExecuting(false);
  };

  const generateCode = () => {
    const code = `# Generated Workflow Code
import requests
import json
from datetime import datetime

def execute_workflow():
    """
    Auto-generated workflow from visual editor
    Created: ${new Date().toISOString()}
    """
    
${nodes.map(node => {
  switch(node.type) {
    case 'trigger':
      return `    # Trigger: Start workflow
    print("Starting workflow execution...")`;
    case 'api':
      return `    # API Call
    response = requests.get("https://api.example.com/data")
    data = response.json()`;
    case 'webscrape':
      return `    # Web Scraping
    from bs4 import BeautifulSoup
    page = requests.get("https://example.com")
    soup = BeautifulSoup(page.content, 'html.parser')`;
    case 'transform':
      return `    # Data Transformation
    transformed_data = transform_data(data)`;
    case 'email':
      return `    # Send Email
    send_email(data, "recipient@example.com")`;
    default:
      return `    # ${node.type.charAt(0).toUpperCase() + node.type.slice(1)}
    process_${node.type}(data)`;
  }
}).join('\n')}

    print("Workflow completed successfully!")
    return True

if __name__ == "__main__":
    execute_workflow()`;
    
    return code;
  };

  const NodeComponent = ({ node, isExecuting, executionData }) => {
    const nodeConfig = nodeTypes.find(t => t.type === node.type);
    const execution = executionData[node.id];
    
    return (
      <div
        className={`absolute cursor-move transform transition-all duration-300 ${
          isExecuting && execution?.status === 'executing' ? 'scale-110' : ''
        }`}
        style={{ left: node.x, top: node.y }}
        onClick={() => setSelectedNode(node)}
      >
        <div className={`relative bg-gradient-to-r ${nodeConfig?.color} p-4 rounded-xl backdrop-blur-lg bg-opacity-20 border border-white/20 shadow-xl min-w-[120px] hover:shadow-2xl transition-all duration-300`}>
          {/* Execution status indicator */}
          {execution && (
            <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${
              execution.status === 'executing' ? 'bg-yellow-400 animate-pulse' :
              execution.status === 'completed' ? 'bg-green-400' : 'bg-gray-400'
            }`} />
          )}
          
          {/* Data flow animation */}
          {isExecuting && execution?.status === 'executing' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-xl" />
          )}
          
          <div className="text-center">
            <div className="text-2xl mb-2">{nodeConfig?.icon}</div>
            <div className="text-white font-medium text-sm">{nodeConfig?.label}</div>
          </div>
          
          {/* Connection points */}
          <div className="absolute -right-2 top-1/2 w-4 h-4 bg-blue-400 rounded-full border-2 border-white transform -translate-y-1/2" />
          <div className="absolute -left-2 top-1/2 w-4 h-4 bg-green-400 rounded-full border-2 border-white transform -translate-y-1/2" />
        </div>
        
        {/* Execution data preview */}
        {execution && execution.data && (
          <div className="absolute top-full mt-2 bg-black/80 text-white p-2 rounded-lg text-xs min-w-[200px] backdrop-blur-lg">
            <div className="text-green-400 font-mono">{execution.data}</div>
            <div className="text-gray-400 text-xs mt-1">{new Date(execution.timestamp).toLocaleTimeString()}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="backdrop-blur-lg bg-black/20 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              FlowForge AI
            </h1>
            <div className="text-sm text-gray-400">Visual Workflow Automation</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={executeWorkflow}
              disabled={isExecuting || nodes.length === 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Play size={16} />
              <span>{isExecuting ? 'Running...' : 'Execute'}</span>
            </button>
            
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
            >
              <Code size={16} />
              <span>Code</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar - Node Palette */}
        <div className="w-64 backdrop-blur-lg bg-black/20 border-r border-white/10 p-4 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-300">Node Types</h3>
            <div className="space-y-2">
              {nodeTypes.map(nodeType => (
                <div
                  key={nodeType.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType.type)}
                  className={`p-3 rounded-lg cursor-move bg-gradient-to-r ${nodeType.color} bg-opacity-20 border border-white/10 hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{nodeType.icon}</span>
                    <span className="text-sm font-medium">{nodeType.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-purple-300">Templates</h3>
            <div className="space-y-2">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-white/10 hover:border-white/20 cursor-pointer transition-all duration-300"
                  onClick={() => {
                    // Load template
                    if (template.name === 'Website Monitor') {
                      setNodes([
                        { id: 'node-1', type: 'trigger', x: 100, y: 100, data: {}, outputs: ['output'] },
                        { id: 'node-2', type: 'webscrape', x: 300, y: 100, data: {}, outputs: ['output'] },
                        { id: 'node-3', type: 'condition', x: 500, y: 100, data: {}, outputs: ['true', 'false'] },
                        { id: 'node-4', type: 'email', x: 700, y: 50, data: {}, outputs: ['output'] }
                      ]);
                      setNextNodeId(5);
                    }
                  }}
                >
                  <div className="text-sm font-medium text-white">{template.name}</div>
                  <div className="text-xs text-gray-300 mt-1">{template.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full relative bg-gradient-to-br from-slate-800/50 to-purple-800/50"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Grid Background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />

            {/* Nodes */}
            {nodes.map(node => (
              <NodeComponent
                key={node.id}
                node={node}
                isExecuting={isExecuting}
                executionData={executionData}
              />
            ))}

            {/* Canvas Instructions */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center backdrop-blur-lg bg-white/5 p-8 rounded-2xl border border-white/10">
                  <Zap className="mx-auto mb-4 text-purple-400" size={48} />
                  <h3 className="text-xl font-semibold mb-2 text-purple-300">Start Building Your Workflow</h3>
                  <p className="text-gray-400 mb-4">Drag nodes from the sidebar to create your automation</p>
                  <p className="text-sm text-gray-500">Or try a template to get started quickly</p>
                </div>
              </div>
            )}
          </div>

          {/* Minimap */}
          <div className="absolute bottom-4 right-4 w-48 h-32 backdrop-blur-lg bg-black/40 border border-white/20 rounded-lg p-2">
            <div className="text-xs text-gray-400 mb-1">Minimap</div>
            <div className="relative w-full h-full bg-gradient-to-br from-slate-700/50 to-purple-700/50 rounded">
              {nodes.map(node => (
                <div
                  key={node.id}
                  className="absolute w-2 h-2 bg-blue-400 rounded-full"
                  style={{
                    left: `${(node.x / 1000) * 100}%`,
                    top: `${(node.y / 600) * 100}%`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Code Panel */}
        {showCode && (
          <div className="w-96 backdrop-blur-lg bg-black/30 border-l border-white/10 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-300">Generated Code</h3>
              <button
                onClick={() => setShowCode(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <pre className="text-sm text-green-400 font-mono bg-black/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {generateCode()}
            </pre>
            <div className="mt-4 space-y-2">
              <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300">
                <Download size={16} />
                <span>Download Python</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300">
                <Download size={16} />
                <span>Download JavaScript</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Node Properties Panel */}
      {selectedNode && (
        <div className="fixed top-20 right-4 w-80 backdrop-blur-lg bg-black/40 border border-white/20 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-300">
              {nodeTypes.find(t => t.type === selectedNode.type)?.label} Properties
            </h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Node ID</label>
              <input
                type="text"
                value={selectedNode.id}
                readOnly
                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
              />
            </div>
            
            {selectedNode.type === 'api' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Endpoint</label>
                <input
                  type="text"
                  placeholder="https://api.example.com/data"
                  className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500"
                />
              </div>
            )}
            
            {selectedNode.type === 'webscrape' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target URL</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500"
                />
              </div>
            )}
            
            {selectedNode.type === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Recipient</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execution Status */}
      {isExecuting && (
        <div className="fixed bottom-4 left-4 backdrop-blur-lg bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 font-medium">Workflow Executing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowAutomation;
