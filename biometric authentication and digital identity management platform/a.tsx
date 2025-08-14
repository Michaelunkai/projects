import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, Eye, Fingerprint, Mic, User, Brain, Cpu, 
  Activity, Lock, Unlock, AlertTriangle, CheckCircle,
  Settings, BarChart3, Globe, Smartphone, Key,
  RefreshCw, Zap, Camera, Clock, MapPin, Users,
  FileText, Download, Upload, Search, Filter,
  TrendingUp, Target, Layers, Network, Database,
  Scan, Waves, Monitor, Bell, Calendar, Mail
} from 'lucide-react';

// Biometric Authentication Platform
const BiometricAuthPlatform = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMethods, setAuthMethods] = useState({
    facial: false,
    fingerprint: false,
    voice: false,
    iris: false,
    behavioral: false,
    gait: false
  });
  const [securityLevel, setSecurityLevel] = useState(85);
  const [threatLevel, setThreatLevel] = useState(25);
  const [activeUsers, setActiveUsers] = useState(1247);
  const [blockchainVerified, setBlockchainVerified] = useState(false);
  
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [biometricEnrollment, setBiometricEnrollment] = useState({
    step: 1,
    progress: 0,
    currentMethod: 'facial'
  });

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityLevel(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setThreatLevel(prev => Math.max(0, Math.min(50, prev + (Math.random() - 0.5) * 8)));
      setActiveUsers(prev => Math.max(1000, Math.min(2000, prev + Math.floor((Math.random() - 0.5) * 20))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // WebAuthn Implementation
  const handleWebAuthn = async (type) => {
    try {
      if (type === 'register') {
        // Simulate WebAuthn registration
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "SecureAuth Platform" },
            user: {
              id: new Uint8Array(16),
              name: "user@example.com",
              displayName: "User"
            },
            pubKeyCredParams: [{alg: -7, type: "public-key"}],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
            }
          }
        });
        if (credential) {
          setIsAuthenticated(true);
          return true;
        }
      } else {
        // Simulate WebAuthn authentication
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            userVerification: "required"
          }
        });
        if (credential) {
          setIsAuthenticated(true);
          return true;
        }
      }
    } catch (error) {
      console.log('WebAuthn not available, using simulation');
      // Fallback to simulation
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  // Biometric enrollment simulation
  const startBiometricEnrollment = async (method) => {
    setBiometricEnrollment({ step: 1, progress: 0, currentMethod: method });
    
    if (method === 'facial' && videoRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      } catch (err) {
        console.log('Camera not available');
      }
    }

    // Simulate enrollment progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setAuthMethods(prev => ({ ...prev, [method]: true }));
        if (method === 'facial' && videoRef.current) {
          const stream = videoRef.current.srcObject;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          setCameraActive(false);
        }
      }
      setBiometricEnrollment(prev => ({ ...prev, progress }));
    }, 500);
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium">Security Level</p>
              <p className="text-3xl font-bold text-blue-900">{Math.round(securityLevel)}%</p>
            </div>
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <div className="mt-4 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${securityLevel}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">Active Users</p>
              <p className="text-3xl font-bold text-green-900">{activeUsers.toLocaleString()}</p>
            </div>
            <Users className="w-10 h-10 text-green-600" />
          </div>
          <p className="text-green-600 text-sm mt-2">↗ 12% from last hour</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 font-medium">Threat Level</p>
              <p className="text-3xl font-bold text-red-900">{Math.round(threatLevel)}%</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-orange-600" />
          </div>
          <div className="mt-4 bg-orange-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${threatLevel}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-medium">Blockchain Verified</p>
              <p className="text-3xl font-bold text-purple-900">847</p>
            </div>
            <Layers className="w-10 h-10 text-purple-600" />
          </div>
          <p className="text-purple-600 text-sm mt-2">Identity attestations</p>
        </div>
      </div>

      {/* Real-time Authentication Activity */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Real-time Authentication Activity
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Recent Authentication Events</h4>
            <div className="space-y-3">
              {[
                { method: 'Facial Recognition', user: 'john.doe@company.com', status: 'success', time: '2 min ago' },
                { method: 'Fingerprint + Voice', user: 'sarah.smith@company.com', status: 'success', time: '3 min ago' },
                { method: 'Iris Scan', user: 'mike.johnson@company.com', status: 'failed', time: '5 min ago' },
                { method: 'Behavioral Analysis', user: 'alice.brown@company.com', status: 'success', time: '7 min ago' }
              ].map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${event.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-medium text-sm">{event.method}</p>
                      <p className="text-xs text-gray-600">{event.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{event.time}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Authentication Methods Usage</h4>
            <div className="space-y-3">
              {[
                { method: 'Facial Recognition', usage: 89, color: 'bg-blue-500' },
                { method: 'Fingerprint', usage: 76, color: 'bg-green-500' },
                { method: 'Voice Recognition', usage: 65, color: 'bg-purple-500' },
                { method: 'Behavioral Analysis', usage: 54, color: 'bg-orange-500' },
                { method: 'Iris Scanning', usage: 43, color: 'bg-red-500' }
              ].map((method, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{method.method}</span>
                    <span>{method.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${method.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${method.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Threat Intelligence Dashboard */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-red-600" />
          Threat Intelligence & Risk Assessment
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-gray-800 mb-3">Global Threat Map</h4>
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-lg p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="w-4 h-4 bg-red-500 rounded-full absolute top-1/4 left-1/3 animate-pulse" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full absolute top-1/2 right-1/4 animate-pulse" />
                <div className="w-2 h-2 bg-orange-500 rounded-full absolute bottom-1/3 left-1/4 animate-pulse" />
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-bold">Global Security Status</p>
                <p className="text-blue-200">Monitoring 127 countries</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-red-400">High Risk Zones: 8</p>
                    <p className="text-yellow-400">Medium Risk: 23</p>
                  </div>
                  <div>
                    <p className="text-green-400">Secure Regions: 96</p>
                    <p className="text-blue-400">Active Monitoring</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Security Alerts</h4>
            <div className="space-y-3">
              {[
                { type: 'Critical', message: 'Unusual login pattern detected', time: '5 min ago', color: 'red' },
                { type: 'Warning', message: 'Multiple failed auth attempts', time: '12 min ago', color: 'yellow' },
                { type: 'Info', message: 'New device registered', time: '25 min ago', color: 'blue' }
              ].map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 border-${alert.color}-500 bg-${alert.color}-50`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold text-${alert.color}-700 uppercase`}>{alert.type}</span>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Biometric Enrollment Component
  const BiometricEnrollment = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Scan className="w-8 h-8 text-blue-600" />
          Multi-Modal Biometric Enrollment
        </h3>
        
        {/* Enrollment Progress */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-900">Enrollment Progress</span>
            <span className="text-blue-700">{Math.round(biometricEnrollment.progress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${biometricEnrollment.progress}%` }}
            />
          </div>
          <p className="text-sm text-blue-700 mt-2">Currently enrolling: {biometricEnrollment.currentMethod}</p>
        </div>

        {/* Biometric Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Facial Recognition */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-bold text-blue-900">Facial Recognition</h4>
                <p className="text-sm text-blue-700">AI-powered face detection</p>
              </div>
            </div>
            {cameraActive && biometricEnrollment.currentMethod === 'facial' ? (
              <div className="space-y-3">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-32 object-cover rounded-lg bg-gray-200"
                />
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-blue-600">
                    <Camera className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Analyzing facial features...</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
                <button 
                  onClick={() => startBiometricEnrollment('facial')}
                  disabled={authMethods.facial}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                    authMethods.facial 
                      ? 'bg-green-100 text-green-800 cursor-default' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {authMethods.facial ? '✓ Enrolled' : 'Start Enrollment'}
                </button>
              </div>
            )}
          </div>

          {/* Fingerprint */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Fingerprint className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-bold text-green-900">Fingerprint</h4>
                <p className="text-sm text-green-700">Minutiae extraction</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Fingerprint className="w-12 h-12 text-gray-400" />
              </div>
              <button 
                onClick={() => startBiometricEnrollment('fingerprint')}
                disabled={authMethods.fingerprint}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  authMethods.fingerprint 
                    ? 'bg-green-100 text-green-800 cursor-default' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {authMethods.fingerprint ? '✓ Enrolled' : 'Start Enrollment'}
              </button>
            </div>
          </div>

          {/* Voice Recognition */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Mic className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="font-bold text-purple-900">Voice Recognition</h4>
                <p className="text-sm text-purple-700">Speaker verification</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Waves className="w-12 h-12 text-gray-400" />
              </div>
              <button 
                onClick={() => startBiometricEnrollment('voice')}
                disabled={authMethods.voice}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  authMethods.voice 
                    ? 'bg-green-100 text-green-800 cursor-default' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {authMethods.voice ? '✓ Enrolled' : 'Start Enrollment'}
              </button>
            </div>
          </div>

          {/* Iris Scanning */}
          <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-8 h-8 text-orange-600" />
              <div>
                <h4 className="font-bold text-orange-900">Iris Scanning</h4>
                <p className="text-sm text-orange-700">Unique iris patterns</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Target className="w-12 h-12 text-gray-400" />
              </div>
              <button 
                onClick={() => startBiometricEnrollment('iris')}
                disabled={authMethods.iris}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  authMethods.iris 
                    ? 'bg-green-100 text-green-800 cursor-default' 
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {authMethods.iris ? '✓ Enrolled' : 'Start Enrollment'}
              </button>
            </div>
          </div>

          {/* Behavioral Analysis */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-6 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-indigo-600" />
              <div>
                <h4 className="font-bold text-indigo-900">Behavioral Analysis</h4>
                <p className="text-sm text-indigo-700">Typing & mouse patterns</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Activity className="w-12 h-12 text-gray-400" />
              </div>
              <button 
                onClick={() => startBiometricEnrollment('behavioral')}
                disabled={authMethods.behavioral}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  authMethods.behavioral 
                    ? 'bg-green-100 text-green-800 cursor-default' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {authMethods.behavioral ? '✓ Enrolled' : 'Start Enrollment'}
              </button>
            </div>
          </div>

          {/* Gait Analysis */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-6 rounded-xl border border-teal-200">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-8 h-8 text-teal-600" />
              <div>
                <h4 className="font-bold text-teal-900">Gait Analysis</h4>
                <p className="text-sm text-teal-700">Walking patterns</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <button 
                onClick={() => startBiometricEnrollment('gait')}
                disabled={authMethods.gait}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  authMethods.gait 
                    ? 'bg-green-100 text-green-800 cursor-default' 
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {authMethods.gait ? '✓ Enrolled' : 'Start Enrollment'}
              </button>
            </div>
          </div>
        </div>

        {/* Anti-Spoofing & Security Features */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Anti-Spoofing & Security Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Liveness detection active</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Template encryption enabled</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Multi-modal fusion active</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Presentation attack detection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Behavioral anomaly detection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Homomorphic encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Blockchain Identity Component
  const BlockchainIdentity = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Layers className="w-8 h-8 text-purple-600" />
          Blockchain Identity Management
        </h3>

        {/* Blockchain Status */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold">Decentralized Identity Status</h4>
              <p className="text-purple-200">Self-sovereign identity verified</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                blockchainVerified ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  {blockchainVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">847</p>
              <p className="text-purple-300 text-sm">Identity Attestations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">23.4K</p>
              <p className="text-purple-300 text-sm">Verifiable Credentials</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">99.8%</p>
              <p className="text-purple-300 text-sm">Verification Success</p>
            </div>
          </div>
        </div>

        {/* Smart Contracts & Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Smart Contracts
            </h4>
            
            <div className="space-y-3">
              {[
                { name: 'Identity Verification', status: 'Active', txs: 1247, gas: 'Low' },
                { name: 'Compliance Checking', status: 'Active', txs: 856, gas: 'Medium' },
                { name: 'Audit Trail', status: 'Active', txs: 2134, gas: 'Low' },
                { name: 'Credential Issuance', status: 'Pending', txs: 0, gas: 'High' }
              ].map((contract, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{contract.name}</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contract.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {contract.status}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Transactions: {contract.txs.toLocaleString()}</span>
                    <span className={`${
                      contract.gas === 'Low' ? 'text-green-600' :
                      contract.gas === 'Medium' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      Gas: {contract.gas}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Verifiable Credentials
            </h4>
            
            <div className="space-y-3">
              {[
                { type: 'Educational Credential', issuer: 'Stanford University', status: 'Verified', date: '2024-01-15' },
                { type: 'Professional License', issuer: 'CA State Board', status: 'Verified', date: '2024-02-20' },
                { type: 'Security Clearance', issuer: 'Federal Agency', status: 'Verified', date: '2024-03-10' },
                { type: 'Medical Record', issuer: 'Health System', status: 'Pending', date: '2024-07-15' }
              ].map((credential, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{credential.type}</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      credential.status === 'Verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {credential.status}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Issuer: {credential.issuer}</p>
                    <p>Date: {credential.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zero-Knowledge Proofs */}
        <div className="mt-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
          <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-600" />
            Zero-Knowledge Proof System
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-indigo-800 mb-3">Proof Generation</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Age Verification</span>
                  <span className="text-green-600 font-medium">✓ Generated</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Income Bracket</span>
                  <span className="text-green-600 font-medium">✓ Generated</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Security Clearance</span>
                  <span className="text-orange-600 font-medium">⏳ Processing</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medical Eligibility</span>
                  <span className="text-gray-500 font-medium">○ Not Required</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-indigo-800 mb-3">Privacy Metrics</h5>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Data Privacy Level</span>
                    <span>98%</span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Anonymization</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Authentication Flow Component
  const AuthenticationFlow = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Lock className="w-8 h-8 text-green-600" />
          Multi-Factor Authentication
        </h3>

        {!isAuthenticated ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Secure Authentication</h4>
              <p className="text-gray-600">Choose your authentication method</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleWebAuthn('register')}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Key className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">WebAuthn / FIDO2</p>
                  <p className="text-sm text-gray-600">Passwordless authentication</p>
                </div>
              </button>

              <button
                onClick={() => setIsAuthenticated(true)}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all"
              >
                <Fingerprint className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Biometric Login</p>
                  <p className="text-sm text-gray-600">Multi-modal biometric auth</p>
                </div>
              </button>

              <button
                onClick={() => setIsAuthenticated(true)}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all"
              >
                <Layers className="w-6 h-6 text-purple-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Blockchain Identity</p>
                  <p className="text-sm text-gray-600">Decentralized verification</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-green-900">Authentication Successful</h4>
            <p className="text-gray-600 mb-6">Welcome to the SecureAuth Platform</p>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Adaptive Security Policies */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-600" />
          Adaptive Security Policies
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Risk-Based Authentication</h4>
            <div className="space-y-3">
              {[
                { factor: 'Device Trust Level', value: 92, status: 'Trusted' },
                { factor: 'Location Risk Score', value: 15, status: 'Low Risk' },
                { factor: 'Behavior Pattern', value: 88, status: 'Normal' },
                { factor: 'Time-based Risk', value: 78, status: 'Standard' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{item.factor}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{item.value}%</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'Trusted' || item.status === 'Normal' 
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'Low Risk' || item.status === 'Standard'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Active Security Measures</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Continuous Authentication</span>
                </div>
                <span className="text-xs text-green-700">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Behavioral Monitoring</span>
                </div>
                <span className="text-xs text-blue-700">Monitoring</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Geolocation Verification</span>
                </div>
                <span className="text-xs text-purple-700">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">Time-based Controls</span>
                </div>
                <span className="text-xs text-orange-700">Configured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Compliance & Audit Component
  const ComplianceAudit = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Compliance & Audit Management
        </h3>

        {/* Compliance Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { name: 'GDPR', status: 'Compliant', score: 98, color: 'green' },
            { name: 'CCPA', status: 'Compliant', score: 95, color: 'green' },
            { name: 'HIPAA', status: 'Review Required', score: 87, color: 'orange' },
            { name: 'SOX', status: 'Compliant', score: 92, color: 'green' }
          ].map((compliance, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 border-${compliance.color}-200 bg-${compliance.color}-50`}>
              <div className="text-center">
                <h4 className="font-bold text-lg">{compliance.name}</h4>
                <p className={`text-${compliance.color}-700 font-medium text-sm mb-2`}>{compliance.status}</p>
                <div className={`text-2xl font-bold text-${compliance.color}-800`}>{compliance.score}%</div>
                <div className={`w-full bg-${compliance.color}-200 rounded-full h-2 mt-2`}>
                  <div 
                    className={`bg-${compliance.color}-600 h-2 rounded-full`}
                    style={{ width: `${compliance.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-6 h-6 text-blue-600" />
              Recent Audit Events
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[
                { event: 'User authentication attempt', user: 'john.doe@company.com', result: 'Success', time: '2 min ago', risk: 'Low' },
                { event: 'Data export request', user: 'compliance@company.com', result: 'Approved', time: '15 min ago', risk: 'Medium' },
                { event: 'Privacy setting change', user: 'sarah.smith@company.com', result: 'Success', time: '32 min ago', risk: 'Low' },
                { event: 'Admin privilege escalation', user: 'admin@company.com', result: 'Success', time: '1 hour ago', risk: 'High' },
                { event: 'Biometric enrollment', user: 'mike.johnson@company.com', result: 'Success', time: '2 hours ago', risk: 'Low' },
                { event: 'Failed login attempt', user: 'unknown@external.com', result: 'Blocked', time: '3 hours ago', risk: 'High' }
              ].map((event, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{event.event}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.risk === 'Low' ? 'bg-green-100 text-green-800' :
                        event.risk === 'Medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.risk}
                      </span>
                      <span className="text-xs text-gray-500">{event.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{event.user}</span>
                    <span className={`${
                      event.result === 'Success' || event.result === 'Approved' ? 'text-green-600' :
                      event.result === 'Blocked' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {event.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-6 h-6 text-green-600" />
              Compliance Reports
            </h4>
            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">Generate automated compliance report</p>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    GDPR Compliance Report
                  </button>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Security Assessment
                  </button>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Audit Trail Export
                  </button>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-800 mb-3">Data Retention Policies</h5>
                <div className="space-y-2">
                  {[
                    { type: 'Biometric Templates', retention: '5 years', status: 'Active' },
                    { type: 'Audit Logs', retention: '7 years', status: 'Active' },
                    { type: 'User Credentials', retention: '3 years', status: 'Active' },
                    { type: 'Session Data', retention: '90 days', status: 'Active' }
                  ].map((policy, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>{policy.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{policy.retention}</span>
                        <span className="text-green-600 text-xs">✓ {policy.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Navigation
  const tabs = [
    { id: 'dashboard', label: 'Security Dashboard', icon: Monitor },
    { id: 'auth', label: 'Authentication', icon: Lock },
    { id: 'biometric', label: 'Biometric Enrollment', icon: Fingerprint },
    { id: 'blockchain', label: 'Blockchain Identity', icon: Layers },
    { id: 'compliance', label: 'Compliance & Audit', icon: FileText }
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard />;
      case 'auth': return <AuthenticationFlow />;
      case 'biometric': return <BiometricEnrollment />;
      case 'blockchain': return <BlockchainIdentity />;
      case 'compliance': return <ComplianceAudit />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SecureAuth Platform</h1>
                <p className="text-sm text-gray-600">Enterprise Biometric Identity Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-800 text-sm font-medium">System Secure</span>
              </div>
              <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-600" />
              <Settings className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    currentTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-medium'
                      : 'border-transparent text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">SecureAuth Platform</h3>
              <p className="text-gray-400 text-sm">
                Enterprise-grade biometric authentication and digital identity management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Security Features</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Multi-modal Biometrics</li>
                <li>Blockchain Identity</li>
                <li>Zero-Knowledge Proofs</li>
                <li>WebAuthn Integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Compliance</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>GDPR Compliant</li>
                <li>HIPAA Ready</li>
                <li>SOX Compatible</li>
                <li>CCPA Certified</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enterprise</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>SSO Integration</li>
                <li>API Gateway</li>
                <li>24/7 Monitoring</li>
                <li>Global Scalability</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 SecureAuth Platform. All rights reserved. | Enterprise Security Solutions</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BiometricAuthPlatform;
