import React, { useState, useEffect } from 'react';
import { Play, Database, Camera, RotateCcw, Shield, Zap, GitBranch, Clock, CheckCircle, AlertTriangle, Plus, Settings, Eye, Download, Trash2, Users, Table, Key, FileText } from 'lucide-react';

const DatabaseLifecycleManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [databases, setDatabases] = useState([
    { id: 1, name: 'dev_ecommerce', type: 'PostgreSQL', status: 'connected', port: 5432, lastSnapshot: '2 hours ago', size: '45MB' },
    { id: 2, name: 'test_analytics', type: 'MySQL', status: 'connected', port: 3306, lastSnapshot: '1 day ago', size: '128MB' },
    { id: 3, name: 'staging_cache', type: 'MongoDB', status: 'disconnected', port: 27017, lastSnapshot: '3 days ago', size: '89MB' },
    { id: 4, name: 'local_cms', type: 'SQLite', status: 'connected', port: null, lastSnapshot: '5 minutes ago', size: '12MB' }
  ]);

  const [snapshots, setSnapshots] = useState([
    { 
      id: 1, 
      name: 'Pre Auth Refactor', 
      database: 'dev_ecommerce', 
      created: '2025-01-20T10:30:00Z', 
      size: '45MB', 
      status: 'completed',
      changes: ['Added user_sessions table', 'Modified users.email index'],
      dataRows: 1250,
      description: 'Snapshot before implementing OAuth integration'
    },
    { 
      id: 2, 
      name: 'Feature Complete State', 
      database: 'dev_ecommerce', 
      created: '2025-01-19T15:20:00Z', 
      size: '42MB', 
      status: 'completed',
      changes: ['Added orders table', 'Updated product schema'],
      dataRows: 1180,
      description: 'All payment features implemented and tested'
    },
    { 
      id: 3, 
      name: 'Fresh Install + Sample Data', 
      database: 'test_analytics', 
      created: '2025-01-18T09:15:00Z', 
      size: '128MB', 
      status: 'completed',
      changes: ['Initial schema', 'Seeded with realistic data'],
      dataRows: 5000,
      description: 'Clean state with generated test data patterns'
    }
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [showCreateSnapshot, setShowCreateSnapshot] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState(null);

  const scanDatabases = async () => {
    setIsScanning(true);
    // Simulate scanning
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsScanning(false);
  };

  const createSnapshot = (dbId, name, description) => {
    const db = databases.find(d => d.id === dbId);
    const newSnapshot = {
      id: snapshots.length + 1,
      name,
      database: db.name,
      created: new Date().toISOString(),
      size: db.size,
      status: 'creating',
      changes: ['Current state capture'],
      dataRows: Math.floor(Math.random() * 5000) + 500,
      description
    };
    setSnapshots([newSnapshot, ...snapshots]);
    
    // Simulate completion
    setTimeout(() => {
      setSnapshots(prev => prev.map(s => 
        s.id === newSnapshot.id ? { ...s, status: 'completed' } : s
      ));
    }, 3000);
    
    setShowCreateSnapshot(false);
  };

  const restoreSnapshot = (snapshotId) => {
    setSnapshots(prev => prev.map(s => 
      s.id === snapshotId ? { ...s, status: 'restoring' } : s
    ));
    
    setTimeout(() => {
      setSnapshots(prev => prev.map(s => 
        s.id === snapshotId ? { ...s, status: 'completed' } : s
      ));
    }, 2000);
  };

  const DatabaseCard = ({ db }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Database className={`w-8 h-8 ${db.status === 'connected' ? 'text-green-400' : 'text-red-400'}`} />
          <div>
            <h3 className="text-lg font-semibold text-white">{db.name}</h3>
            <p className="text-gray-400 text-sm">{db.type} {db.port && `• Port ${db.port}`}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          db.status === 'connected' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
        }`}>
          {db.status}
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex justify-between">
          <span>Size:</span>
          <span className="text-white">{db.size}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Snapshot:</span>
          <span className="text-white">{db.lastSnapshot}</span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <button 
          onClick={() => {setSelectedDatabase(db); setShowCreateSnapshot(true);}}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Camera className="w-4 h-4" />
          <span>Snapshot</span>
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const SnapshotCard = ({ snapshot }) => {
    const timeAgo = new Date(Date.now() - new Date(snapshot.created).getTime()).toISOString().substr(11, 8);
    
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              snapshot.status === 'completed' ? 'bg-green-400' : 
              snapshot.status === 'creating' ? 'bg-yellow-400 animate-pulse' : 
              'bg-blue-400 animate-pulse'
            }`} />
            <div>
              <h3 className="text-lg font-semibold text-white">{snapshot.name}</h3>
              <p className="text-gray-400 text-sm">{snapshot.database} • {snapshot.dataRows.toLocaleString()} rows</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">{new Date(snapshot.created).toLocaleDateString()}</p>
            <p className="text-gray-500 text-xs">{snapshot.size}</p>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">{snapshot.description}</p>
        
        <div className="mb-4">
          <p className="text-gray-400 text-xs mb-2">Recent Changes:</p>
          <div className="space-y-1">
            {snapshot.changes.map((change, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-gray-300">
                <GitBranch className="w-3 h-3 text-blue-400" />
                <span>{change}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => restoreSnapshot(snapshot.id)}
            disabled={snapshot.status !== 'completed'}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{snapshot.status === 'restoring' ? 'Restoring...' : 'Restore'}</span>
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const CreateSnapshotModal = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [anonymizeData, setAnonymizeData] = useState(false);
    
    if (!showCreateSnapshot) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
          <h2 className="text-xl font-semibold text-white mb-4">Create Snapshot</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Snapshot Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                placeholder="e.g., Pre-feature Implementation"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 h-20 resize-none"
                placeholder="Brief description of current state..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymize"
                checked={anonymizeData}
                onChange={(e) => setAnonymizeData(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded"
              />
              <label htmlFor="anonymize" className="text-gray-300 text-sm">
                Anonymize PII data
              </label>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowCreateSnapshot(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedDatabase && createSnapshot(selectedDatabase.id, name, description)}
              disabled={!name.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create Snapshot
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DataGeneratorPanel = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          <span>Intelligent Test Data Generation</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-white">Data Patterns</h4>
            <div className="space-y-3">
              {['User Profiles', 'E-commerce Orders', 'Financial Transactions', 'Social Media Posts', 'IoT Sensor Data'].map((pattern) => (
                <div key={pattern} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">{pattern}</span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                    Generate
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-white">Smart Relationships</h4>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Auto-detect foreign keys</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Maintain referential integrity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Table className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Populate related tables</span>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all">
              Generate Realistic Dataset
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SchemaAnalyzer = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <GitBranch className="w-6 h-6 text-blue-400" />
          <span>Schema Migration & Analysis</span>
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-300">Compatible</span>
              </div>
              <p className="text-sm text-gray-300">15 snapshots ready for migration</p>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-yellow-300">Needs Review</span>
              </div>
              <p className="text-sm text-gray-300">3 snapshots with schema conflicts</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-blue-300">Auto-Migrate</span>
              </div>
              <p className="text-sm text-gray-300">8 snapshots can be auto-updated</p>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Recent Schema Changes</h4>
            <div className="space-y-2">
              {[
                { table: 'users', change: 'Added email_verified column', type: 'addition' },
                { table: 'orders', change: 'Modified status enum values', type: 'modification' },
                { table: 'products', change: 'Removed legacy_id column', type: 'removal' }
              ].map((change, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      change.type === 'addition' ? 'bg-green-400' :
                      change.type === 'modification' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className="text-gray-300 text-sm">{change.table}</span>
                    <span className="text-gray-400 text-sm">{change.change}</span>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">Review</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Database className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  DevDB Manager
                </h1>
              </div>
              <div className="hidden md:flex space-x-1">
                {[
                  { id: 'dashboard', name: 'Dashboard', icon: Database },
                  { id: 'snapshots', name: 'Snapshots', icon: Camera },
                  { id: 'generator', name: 'Data Generator', icon: Zap },
                  { id: 'schema', name: 'Schema', icon: GitBranch }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={scanDatabases}
                disabled={isScanning}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isScanning ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{isScanning ? 'Scanning...' : 'Scan DBs'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Database className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{databases.length}</p>
                    <p className="text-gray-400 text-sm">Connected DBs</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Camera className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{snapshots.length}</p>
                    <p className="text-gray-400 text-sm">Snapshots</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">100%</p>
                    <p className="text-gray-400 text-sm">PII Protected</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">2.3s</p>
                    <p className="text-gray-400 text-sm">Avg Restore</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Databases Grid */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Connected Databases</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {databases.map(db => (
                  <DatabaseCard key={db.id} db={db} />
                ))}
              </div>
            </div>

            {/* Recent Snapshots */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Recent Snapshots</h2>
                <button
                  onClick={() => setActiveTab('snapshots')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {snapshots.slice(0, 2).map(snapshot => (
                  <SnapshotCard key={snapshot.id} snapshot={snapshot} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'snapshots' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Database Snapshots</h2>
              <button
                onClick={() => setShowCreateSnapshot(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Snapshot</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {snapshots.map(snapshot => (
                <SnapshotCard key={snapshot.id} snapshot={snapshot} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'generator' && <DataGeneratorPanel />}
        {activeTab === 'schema' && <SchemaAnalyzer />}
      </main>

      <CreateSnapshotModal />
    </div>
  );
};

export default DatabaseLifecycleManager;
