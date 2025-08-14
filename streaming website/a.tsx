import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Settings, 
  Users, 
  MessageCircle, 
  BarChart3, 
  DollarSign, 
  Heart, 
  Share, 
  Eye, 
  Play, 
  Pause, 
  Monitor, 
  Smartphone, 
  Camera, 
  Layers,
  Gift,
  Crown,
  Star,
  Zap,
  TrendingUp,
  Calendar,
  Bell,
  Filter,
  MoreVertical,
  Send,
  ThumbsUp,
  Award,
  Target,
  Activity
} from 'lucide-react';

const StreamingPlatform = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'StreamFan2024', message: 'Amazing content! 🔥', timestamp: '2:34 PM', badges: ['vip'] },
    { id: 2, user: 'TechGuru', message: 'How did you set this up?', timestamp: '2:35 PM', badges: ['follower'] },
    { id: 3, user: 'LiveViewer', message: 'This is incredible!', timestamp: '2:36 PM', badges: [] },
    { id: 4, user: 'ProStreamer', message: 'Mind sharing your setup?', timestamp: '2:37 PM', badges: ['moderator'] }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(1247);
  const [followers, setFollowers] = useState(15420);
  const [donations, setDonations] = useState(234.50);
  const [activePoll, setActivePoll] = useState({
    question: "What game should I play next?",
    options: [
      { text: "Cyberpunk 2077", votes: 45 },
      { text: "The Witcher 3", votes: 32 },
      { text: "Elden Ring", votes: 28 },
      { text: "Baldur's Gate 3", votes: 19 }
    ]
  });
  const [selectedTab, setSelectedTab] = useState('chat');
  const [overlayElements, setOverlayElements] = useState([
    { id: 1, type: 'webcam', position: { x: 80, y: 70 }, size: { w: 15, h: 25 } },
    { id: 2, type: 'donation', position: { x: 5, y: 5 }, size: { w: 25, h: 8 } },
    { id: 3, type: 'chat', position: { x: 70, y: 5 }, size: { w: 25, h: 40 } }
  ]);

  const cameras = [
    { id: 0, name: 'Main Camera', type: 'webcam', quality: '1080p' },
    { id: 1, name: 'Secondary Cam', type: 'webcam', quality: '720p' },
    { id: 2, name: 'Screen Capture', type: 'screen', quality: '1440p' },
    { id: 3, name: 'Game Capture', type: 'game', quality: '1080p' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10 - 5));
      if (Math.random() > 0.7) {
        const newMsg = {
          id: Date.now(),
          user: `Viewer${Math.floor(Math.random() * 1000)}`,
          message: ['Great stream!', 'Amazing content!', 'Love this!', '🔥🔥🔥'][Math.floor(Math.random() * 4)],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badges: Math.random() > 0.8 ? ['vip'] : Math.random() > 0.6 ? ['follower'] : []
        };
        setChatMessages(prev => [...prev.slice(-20), newMsg]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const msg = {
        id: Date.now(),
        user: 'StreamerName',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badges: ['broadcaster']
      };
      setChatMessages(prev => [...prev, msg]);
      setNewMessage('');
    }
  };

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  const renderStreamPreview = () => (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center relative">
        {/* Stream Content Simulation */}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="text-white text-center z-10">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-60" />
          <p className="text-lg font-medium">
            {isStreaming ? 'Live Stream Active' : 'Stream Preview'}
          </p>
        </div>
        
        {/* Live Indicator */}
        {isStreaming && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            LIVE
          </div>
        )}
        
        {/* Viewer Count */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center">
          <Eye className="w-4 h-4 mr-1" />
          {viewerCount.toLocaleString()}
        </div>
        
        {/* Stream Overlays */}
        {overlayElements.map(element => (
          <div
            key={element.id}
            className="absolute border-2 border-purple-400 border-dashed rounded"
            style={{
              left: `${element.position.x}%`,
              top: `${element.position.y}%`,
              width: `${element.size.w}%`,
              height: `${element.size.h}%`
            }}
          >
            <div className="bg-purple-400 text-white text-xs px-2 py-1 rounded-tl">
              {element.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {chatMessages.map(msg => (
          <div key={msg.id} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {msg.badges.map(badge => (
                  <span
                    key={badge}
                    className={`text-xs px-1 py-0.5 rounded ${
                      badge === 'broadcaster' ? 'bg-red-500 text-white' :
                      badge === 'moderator' ? 'bg-green-500 text-white' :
                      badge === 'vip' ? 'bg-purple-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}
                  >
                    {badge === 'broadcaster' ? '📺' : badge === 'moderator' ? '🛡️' : badge === 'vip' ? '👑' : '❤️'}
                  </span>
                ))}
                <span className="font-semibold text-purple-300">{msg.user}</span>
                <span className="text-xs text-gray-400">{msg.timestamp}</span>
              </div>
            </div>
            <p className="text-white pl-2">{msg.message}</p>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={sendMessage}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPoll = () => (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">{activePoll.question}</h3>
      <div className="space-y-3">
        {activePoll.options.map((option, index) => {
          const totalVotes = activePoll.options.reduce((sum, opt) => sum + opt.votes, 0);
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          
          return (
            <div key={index} className="relative">
              <div className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{option.text}</span>
                  <span className="text-purple-300 text-sm">{option.votes} votes</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">
        Create New Poll
      </button>
    </div>
  );

  const renderAnalytics = () => (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-white">45.2K</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">+12.5%</span>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-white">${donations.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">+8.3%</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Recent Donations</h4>
        <div className="space-y-2">
          {[
            { user: 'MegaFan123', amount: 50, message: 'Amazing stream!' },
            { user: 'TechLover', amount: 25, message: 'Keep it up!' },
            { user: 'StreamSupporter', amount: 10, message: 'Great content' }
          ].map((donation, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-700 rounded p-2">
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">{donation.user}</span>
                <span className="text-gray-400 text-sm">"{donation.message}"</span>
              </div>
              <span className="text-green-400 font-bold">${donation.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-purple-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                StreamCast Pro
              </h1>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 rounded-full px-3 py-1">
              <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm">{isStreaming ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{followers.toLocaleString()} followers</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4 text-green-400" />
                <span>{viewerCount.toLocaleString()} watching</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span>${donations.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-6 space-y-6">
          {/* Stream Preview */}
          <div className="flex-1">
            {renderStreamPreview()}
          </div>
          
          {/* Controls */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Broadcasting Controls</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Stream Quality:</span>
                <select className="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                  <option>1080p 60fps</option>
                  <option>720p 60fps</option>
                  <option>480p 30fps</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Stream Toggle */}
                <button
                  onClick={toggleStream}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isStreaming 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isStreaming ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isStreaming ? 'Stop Stream' : 'Start Stream'}
                </button>
                
                {/* Audio/Video Controls */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-lg transition-colors ${
                    isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-lg transition-colors ${
                    isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Camera Switching */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Camera:</span>
                <div className="flex space-x-2">
                  {cameras.map((camera) => (
                    <button
                      key={camera.id}
                      onClick={() => setSelectedCamera(camera.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCamera === camera.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {camera.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            {[
              { id: 'chat', label: 'Chat', icon: MessageCircle },
              { id: 'polls', label: 'Polls', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {selectedTab === 'chat' && renderChat()}
            {selectedTab === 'polls' && renderPoll()}
            {selectedTab === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingPlatform;
