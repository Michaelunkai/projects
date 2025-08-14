import React, { useState, useEffect, useRef } from 'react';
import { GitBranch, GitCommit, GitPullRequest, FileText, Bug, Sparkles, Zap, AlertTriangle, CheckCircle, Clock, User, Hash, Eye, Settings, Play, Pause, RefreshCw, Brain } from 'lucide-react';

const GitWorkflowAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentDiff, setCurrentDiff] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [changeType, setChangeType] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [breakingChanges, setBreakingChanges] = useState([]);
  const [issueRefs, setIssueRefs] = useState([]);
  const [learningData, setLearningData] = useState({});
  const editorRef = useRef(null);
  const [realTimeMode, setRealTimeMode] = useState(true);

  // Simulated file changes and analysis data
  const [mockChanges] = useState([
    {
      file: 'src/components/UserProfile.tsx',
      type: 'modified',
      additions: 23,
      deletions: 8,
      diff: `@@ -15,8 +15,23 @@ interface UserProfileProps {
 
-const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
+const UserProfile: React.FC<UserProfileProps> = ({ 
+  user, 
+  onUpdate,
+  showActions = true 
+}) => {
   const [isEditing, setIsEditing] = useState(false);
+  const [validationErrors, setValidationErrors] = useState<string[]>([]);
 
-  const handleSave = async () => {
+  const validateUserData = (userData: UserData): string[] => {
+    const errors: string[] = [];
+    if (!userData.email?.includes('@')) {
+      errors.push('Invalid email format');
+    }
+    if (userData.name?.length < 2) {
+      errors.push('Name must be at least 2 characters');
+    }
+    return errors;
+  };
+
+  const handleSave = async (userData: UserData) => {
+    const errors = validateUserData(userData);
+    if (errors.length > 0) {
+      setValidationErrors(errors);
+      return;
+    }
     try {
-      await updateUser(user.id, editedData);
+      await updateUser(user.id, userData);
+      onUpdate?.(userData);
       setIsEditing(false);
     } catch (error) {`
    },
    {
      file: 'src/hooks/useAuth.ts',
      type: 'modified',
      additions: 12,
      deletions: 3,
      diff: `@@ -8,6 +8,15 @@ interface AuthState {
   loading: boolean;
 }
 
+interface LoginCredentials {
+  email: string;
+  password: string;
+  rememberMe?: boolean;
+}
+
+interface AuthError {
+  code: string;
+  message: string;
+}
+
 export const useAuth = () => {
   const [authState, setAuthState] = useState<AuthState>({
     user: null,
@@ -25,7 +34,10 @@ export const useAuth = () => {
     }
   }, []);
 
-  const login = async (email: string, password: string) => {
+  const login = async (credentials: LoginCredentials) => {
+    const { email, password, rememberMe } = credentials;
     setAuthState(prev => ({ ...prev, loading: true }));
+    
     try {
       const response = await authService.login(email, password);
       setAuthState({`
    },
    {
      file: 'README.md',
      type: 'modified',
      additions: 15,
      deletions: 2,
      diff: `@@ -12,8 +12,23 @@ A comprehensive Git workflow analyzer that learns your coding patterns.
 
 ## Installation
 
-\`\`\`bash
-npm install
+\`\`\`bash
+# Install dependencies
+npm install
+
+# Set up environment variables
+cp .env.example .env.local
+
+# Configure your Git repository
+npm run setup
+\`\`\`
+
+## Configuration
+
+Create a \`.env.local\` file with the following variables:
+
+\`\`\`
+GITHUB_TOKEN=your_github_token
+OPENAI_API_KEY=your_openai_key
+DATABASE_URL=your_database_url
 \`\`\`
 
 ## Usage`
    }
  ]);

  const [commitHistory] = useState([
    'feat(auth): implement secure login with 2FA support',
    'fix(ui): resolve button alignment in mobile navigation',
    'refactor(api): optimize database queries for user profiles',
    'docs(readme): add comprehensive installation guide',
    'feat(dashboard): add real-time analytics widgets',
    'fix(auth): handle expired token edge cases properly',
    'perf(images): implement lazy loading for gallery',
    'test(utils): add comprehensive validation tests'
  ]);

  const [teamPatterns] = useState({
    preferredTypes: ['feat', 'fix', 'refactor', 'docs'],
    averageLength: 65,
    commonPhrases: ['implement', 'resolve', 'optimize', 'add support for'],
    breakingChangeStyle: 'BREAKING CHANGE:',
    issueFormat: '(#123)',
    scopeUsage: 0.85
  });

  // AI-powered commit message generation
  const analyzeChanges = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = {
      type: 'feat',
      scope: 'auth',
      description: 'add user profile validation and update handling',
      confidence: 94,
      breakingChanges: [],
      issues: ['#247', '#251'],
      reasoning: 'Detected new validation function, enhanced error handling, and interface changes'
    };

    setChangeType(analysis.type);
    setConfidence(analysis.confidence);
    setBreakingChanges(analysis.breakingChanges);
    setIssueRefs(analysis.issues);
    
    const message = `${analysis.type}(${analysis.scope}): ${analysis.description}

- Add comprehensive user data validation
- Implement proper error state handling  
- Enhance UserProfile component with callback support
- Add TypeScript interfaces for better type safety

Resolves ${analysis.issues.join(', ')}`;
    
    setGeneratedMessage(message);
    setIsAnalyzing(false);
  };

  // Real-time analysis simulation
  useEffect(() => {
    if (realTimeMode) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          analyzeChanges();
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [realTimeMode]);

  const ChangeTypeIcon = ({ type }) => {
    const icons = {
      feat: <Sparkles className="w-4 h-4" />,
      fix: <Bug className="w-4 h-4" />,
      refactor: <RefreshCw className="w-4 h-4" />,
      docs: <FileText className="w-4 h-4" />,
      perf: <Zap className="w-4 h-4" />
    };
    return icons[type] || <GitCommit className="w-4 h-4" />;
  };

  const DiffViewer = ({ changes }) => (
    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-slate-300">File Changes</span>
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span className="text-green-400">+{changes.reduce((a, c) => a + c.additions, 0)}</span>
            <span className="text-red-400">-{changes.reduce((a, c) => a + c.deletions, 0)}</span>
          </div>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {changes.map((change, idx) => (
          <div key={idx} className="border-b border-slate-700 last:border-b-0">
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="font-mono text-sm text-slate-200">{change.file}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-green-400">+{change.additions}</span>
                <span className="text-red-400">-{change.deletions}</span>
              </div>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto">
              <code className="text-slate-300">{change.diff}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );

  const CommitPreview = ({ message, type, confidence }) => (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <ChangeTypeIcon type={type} />
          <span className="font-semibold text-blue-200 capitalize">{type}</span>
          <div className="flex items-center space-x-1">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">{confidence}% confidence</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {issueRefs.map(ref => (
            <span key={ref} className="px-2 py-1 bg-green-900/30 border border-green-500/30 rounded text-xs text-green-300">
              {ref}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 rounded border border-slate-700 p-3">
        <pre className="text-sm text-slate-200 whitespace-pre-wrap font-mono">{message}</pre>
      </div>
    </div>
  );

  const LearningInsights = ({ data, patterns }) => (
    <div className="bg-slate-800 rounded-lg border border-slate-600 p-4">
      <h3 className="font-semibold text-slate-200 mb-3 flex items-center">
        <Brain className="w-4 h-4 mr-2 text-purple-400" />
        Learning Insights
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">Your Patterns</div>
          <div className="space-y-1">
            <div className="text-sm text-slate-300">Avg length: {patterns.averageLength} chars</div>
            <div className="text-sm text-slate-300">Scope usage: {patterns.scopeUsage * 100}%</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Preferred Types</div>
          <div className="flex flex-wrap gap-1">
            {patterns.preferredTypes.map(type => (
              <span key={type} className="px-2 py-1 bg-blue-900/30 border border-blue-500/30 rounded text-xs text-blue-300">
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">GitFlow AI</h1>
                <p className="text-sm text-slate-400">Intelligent Commit Message Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setRealTimeMode(!realTimeMode)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  realTimeMode 
                    ? 'bg-green-900/30 border-green-500/30 text-green-300' 
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {realTimeMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span className="text-sm">Real-time</span>
              </button>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Bar */}
            <div className="bg-slate-800 rounded-lg border border-slate-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-300">Repository Active</span>
                  </div>
                  <div className="text-slate-500">•</div>
                  <div className="flex items-center space-x-2">
                    <GitCommit className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">3 staged files</span>
                  </div>
                  <div className="text-slate-500">•</div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-slate-300">Last analysis: 2s ago</span>
                  </div>
                </div>
                <button
                  onClick={analyzeChanges}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg transition-colors"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  <span className="text-sm text-white">
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Changes'}
                  </span>
                </button>
              </div>
            </div>

            {/* Diff Viewer */}
            <DiffViewer changes={mockChanges} />

            {/* Generated Commit Message */}
            {generatedMessage && (
              <CommitPreview 
                message={generatedMessage} 
                type={changeType} 
                confidence={confidence}
              />
            )}

            {/* Manual Override */}
            <div className="bg-slate-800 rounded-lg border border-slate-600 p-4">
              <h3 className="font-semibold text-slate-200 mb-3">Manual Override</h3>
              <textarea
                className="w-full h-24 bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                placeholder="Override the generated commit message..."
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
              />
              <div className="flex justify-end mt-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                  <GitCommit className="w-4 h-4" />
                  <span className="text-sm text-white">Commit Changes</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Insights */}
            <LearningInsights data={learningData} patterns={teamPatterns} />

            {/* Recent Commits */}
            <div className="bg-slate-800 rounded-lg border border-slate-600 p-4">
              <h3 className="font-semibold text-slate-200 mb-3 flex items-center">
                <GitCommit className="w-4 h-4 mr-2" />
                Recent Commits
              </h3>
              <div className="space-y-2">
                {commitHistory.slice(0, 6).map((commit, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-slate-300 font-mono truncate">{commit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Metrics */}
            <div className="bg-slate-800 rounded-lg border border-slate-600 p-4">
              <h3 className="font-semibold text-slate-200 mb-3">Analysis Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Accuracy</span>
                  <span className="text-sm text-green-400 font-semibold">96%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Commits Analyzed</span>
                  <span className="text-sm text-blue-400 font-semibold">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Patterns Learned</span>
                  <span className="text-sm text-purple-400 font-semibold">43</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Time Saved</span>
                  <span className="text-sm text-yellow-400 font-semibold">12.4h</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-lg border border-slate-600 p-4">
              <h3 className="font-semibold text-slate-200 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 hover:bg-slate-700 rounded flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Preview Changes</span>
                </button>
                <button className="w-full text-left p-2 hover:bg-slate-700 rounded flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">Find Issues</span>
                </button>
                <button className="w-full text-left p-2 hover:bg-slate-700 rounded flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-300">Check Breaking</span>
                </button>
                <button className="w-full text-left p-2 hover:bg-slate-700 rounded flex items-center space-x-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">Team Patterns</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitWorkflowAnalyzer;
