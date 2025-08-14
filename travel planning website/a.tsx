import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Wallet, 
  FileText, 
  Bell, 
  Cloud, 
  Camera, 
  Heart, 
  Share, 
  Settings, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  Check, 
  X, 
  Download, 
  Upload, 
  Users, 
  MessageCircle, 
  Navigation, 
  Sun, 
  Moon, 
  CloudRain, 
  Snowflake, 
  Wind, 
  Thermometer, 
  Route, 
  Map, 
  Compass, 
  Ticket, 
  Bed, 
  Utensils, 
  Building, 
  Mountain, 
  Car, 
  Train, 
  Ship, 
  Plus, 
  Minus, 
  Edit, 
  Trash, 
  RefreshCw, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  ExternalLink, 
  Wifi, 
  WifiOff, 
  CloudDownload, 
  Smartphone, 
  Laptop,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const TravelPlannerApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchOpened, setSearchOpened] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Mock data
  const mockTrips = [
    {
      id: 1,
      destination: 'Tokyo, Japan',
      dates: 'Mar 15-25, 2025',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=400&fit=crop',
      status: 'upcoming',
      budget: { spent: 2800, total: 4500 },
      days: 10,
      travelers: 2,
      weather: { temp: 18, condition: 'sunny' }
    },
    {
      id: 2,
      destination: 'Santorini, Greece',
      dates: 'Jun 8-15, 2025',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=400&fit=crop',
      status: 'planning',
      budget: { spent: 0, total: 3200 },
      days: 7,
      travelers: 2,
      weather: { temp: 26, condition: 'sunny' }
    }
  ];

  const mockItinerary = [
    {
      day: 1,
      date: 'Mar 15',
      activities: [
        { time: '08:00', type: 'flight', title: 'Flight to Tokyo', location: 'LAX → NRT', duration: '11h 30m' },
        { time: '15:30', type: 'hotel', title: 'Check-in', location: 'Park Hyatt Tokyo', note: 'Room with city view' },
        { time: '19:00', type: 'dining', title: 'Dinner', location: 'Sukiyabashi Jiro', rating: 5 }
      ]
    },
    {
      day: 2,
      date: 'Mar 16',
      activities: [
        { time: '09:00', type: 'attraction', title: 'Senso-ji Temple', location: 'Asakusa', duration: '2h' },
        { time: '12:00', type: 'dining', title: 'Lunch', location: 'Local Ramen Shop', rating: 4.5 },
        { time: '14:00', type: 'attraction', title: 'Tokyo Skytree', location: 'Sumida', duration: '3h' },
        { time: '19:30', type: 'entertainment', title: 'Robot Restaurant', location: 'Shinjuku', duration: '2h' }
      ]
    }
  ];

  const mockPackingList = {
    'Electronics': [
      { item: 'Phone Charger', packed: true },
      { item: 'Camera', packed: true },
      { item: 'Power Bank', packed: false },
      { item: 'Universal Adapter', packed: true }
    ],
    'Clothing': [
      { item: 'Light Jacket', packed: true },
      { item: 'Comfortable Shoes', packed: false },
      { item: 'Formal Outfit', packed: false },
      { item: 'Rain Jacket', packed: true }
    ],
    'Documents': [
      { item: 'Passport', packed: true },
      { item: 'Travel Insurance', packed: true },
      { item: 'Hotel Confirmations', packed: false },
      { item: 'Flight Tickets', packed: true }
    ]
  };

  const mockRecommendations = [
    {
      type: 'restaurant',
      name: 'Narisawa',
      rating: 4.8,
      price: '$$$$',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300&h=200&fit=crop',
      category: 'Fine Dining',
      distance: '0.8 km'
    },
    {
      type: 'attraction',
      name: 'Meiji Shrine',
      rating: 4.6,
      price: 'Free',
      image: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=300&h=200&fit=crop',
      category: 'Cultural',
      distance: '1.2 km'
    },
    {
      type: 'activity',
      name: 'Cherry Blossom Viewing',
      rating: 4.9,
      price: 'Free',
      image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=300&h=200&fit=crop',
      category: 'Nature',
      distance: '2.1 km'
    }
  ];

  const mockPriceAlerts = [
    {
      type: 'flight',
      route: 'LAX → NRT',
      currentPrice: 852,
      targetPrice: 800,
      change: -23,
      airline: 'ANA'
    },
    {
      type: 'hotel',
      name: 'Park Hyatt Tokyo',
      currentPrice: 450,
      targetPrice: 400,
      change: +15,
      dates: 'Mar 15-25'
    }
  ];

  useEffect(() => {
    // Simulate price alerts
    const interval = setInterval(() => {
      const alerts = [
        '✈️ Flight price dropped by $23!',
        '🏨 Hotel deal available in Tokyo',
        '📍 New restaurant opened near your hotel',
        '⛈️ Weather update: Rain expected tomorrow'
      ];
      const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
      setNotifications(prev => [...prev, { id: Date.now(), message: randomAlert }]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const WeatherWidget = ({ weather }) => (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Tokyo Weather</h3>
          <div className="flex items-center space-x-2">
            <Sun className="w-6 h-6" />
            <span className="text-2xl font-bold">{weather.temp}°C</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm opacity-80">Today</p>
          <p className="text-sm">Sunny</p>
        </div>
      </div>
    </div>
  );

  const MapWidget = () => (
    <div className="bg-gradient-to-br from-teal-300 to-pink-300 rounded-2xl p-8 min-h-[300px] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Map className="w-16 h-16 mx-auto opacity-70" />
        <h3 className="text-xl font-bold">Interactive Map</h3>
        <p className="text-gray-700 max-w-xs">
          Mapbox integration with real-time location tracking, 
          route optimization, and offline map downloads
        </p>
        <button className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-opacity-30 transition-all flex items-center space-x-2 mx-auto">
          <Compass className="w-4 h-4" />
          <span>Open Full Map</span>
        </button>
      </div>
    </div>
  );

  const TripCard = ({ trip }) => (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => setCurrentTrip(trip)}
    >
      <div className="relative">
        <img src={trip.image} alt={trip.destination} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            trip.status === 'upcoming' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {trip.status}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold">{trip.destination}</h3>
          <p className="text-sm opacity-90">{trip.dates}</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{trip.travelers} travelers</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{trip.days} days</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Budget</span>
            <span>${trip.budget.spent} / ${trip.budget.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                trip.budget.spent > trip.budget.total * 0.8 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(trip.budget.spent / trip.budget.total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const ItineraryView = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Tokyo Itinerary</h2>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Share className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Edit className="w-5 h-5" />
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Offline Download</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {mockItinerary.map((day, index) => (
          <div key={day.day} className="relative">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {day.day}
              </div>
              <h3 className="text-xl font-semibold">Day {day.day} - {day.date}</h3>
            </div>
            <div className="ml-12 space-y-4">
              {day.activities.map((activity, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'flight' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'hotel' ? 'bg-green-100 text-green-600' :
                        activity.type === 'dining' ? 'bg-orange-100 text-orange-600' :
                        activity.type === 'attraction' ? 'bg-purple-100 text-purple-600' : 'bg-teal-100 text-teal-600'
                      }`}>
                        {activity.type === 'flight' && <Plane className="w-5 h-5" />}
                        {activity.type === 'hotel' && <Bed className="w-5 h-5" />}
                        {activity.type === 'dining' && <Utensils className="w-5 h-5" />}
                        {activity.type === 'attraction' && <Building className="w-5 h-5" />}
                        {activity.type === 'entertainment' && <Camera className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-800">{activity.time}</span>
                          <span className="text-gray-800">{activity.title}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{activity.location}</span>
                          </div>
                          {activity.duration && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{activity.duration}</span>
                            </div>
                          )}
                          {activity.rating && (
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${
                                    i < activity.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PackingListView = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Smart Packing List</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Based on Tokyo weather & activities</span>
          <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Update Suggestions</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(mockPackingList).map(([category, items]) => (
          <div key={category} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{category}</h3>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {items.filter(item => item.packed).length} / {items.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(items.filter(item => item.packed).length / items.length) * 100}%` }}
                />
              </div>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        item.packed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {item.packed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`${item.packed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {item.item}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BudgetTracker = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Budget Tracker</h2>
        <select className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm">
          <option value="USD">🇺🇸 USD</option>
          <option value="JPY">🇯🇵 JPY</option>
          <option value="EUR">🇪🇺 EUR</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="space-y-3">
            <p className="text-blue-100">Total Budget</p>
            <p className="text-3xl font-bold">$4,500</p>
            <p className="text-sm text-blue-100">10 days in Tokyo</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl p-6 text-white">
          <div className="space-y-3">
            <p className="text-pink-100">Spent So Far</p>
            <p className="text-3xl font-bold">$2,800</p>
            <p className="text-sm text-pink-100">62% of budget used</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Spending by Category</h3>
          <div className="space-y-3">
            {[
              { category: 'Flights', amount: 850, percent: 30 },
              { category: 'Hotels', amount: 1200, percent: 43 },
              { category: 'Food', amount: 450, percent: 16 },
              { category: 'Activities', amount: 300, percent: 11 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{item.category}</span>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">${item.amount}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
        <div>
          <p className="text-orange-800 font-medium">Budget Alert</p>
          <p className="text-orange-700 text-sm">You're approaching 70% of your budget. Consider adjusting spending for remaining days.</p>
        </div>
      </div>
    </div>
  );

  const RecommendationsView = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Local Recommendations</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search recommendations..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {mockRecommendations.map((rec, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex space-x-6">
              <img src={rec.image} alt={rec.name} className="w-32 h-20 rounded-lg object-cover" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{rec.name}</h3>
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {rec.category}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(rec.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600">({rec.rating})</span>
                  </div>
                  <span className="font-medium">{rec.price}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{rec.distance} from your hotel</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                    View Details
                  </button>
                  <button className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-100 transition-colors flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                  <button className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-sm hover:bg-green-100 transition-colors flex items-center space-x-1">
                    <Route className="w-3 h-3" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const DocumentsView = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Travel Documents</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { name: 'Passport', expiry: '2027-08-15', status: 'valid', type: 'passport' },
          { name: 'Travel Insurance', expiry: '2025-03-30', status: 'valid', type: 'insurance' },
          { name: 'Visa (Japan)', expiry: '2025-12-31', status: 'valid', type: 'visa' },
          { name: 'Flight Tickets', expiry: '2025-03-15', status: 'upcoming', type: 'tickets' }
        ].map((doc, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{doc.name}</h3>
                  <p className="text-sm text-gray-600">Expires: {doc.expiry}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                doc.status === 'valid' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {doc.status}
              </span>
            </div>
            <div className="flex space-x-2">
              <button className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                View
              </button>
              <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                Download
              </button>
              <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
        <div>
          <p className="text-blue-800 font-medium">Document Reminder</p>
          <p className="text-blue-700 text-sm">Your passport expires in 2 years. Consider renewing before your next big trip.</p>
        </div>
      </div>
    </div>
  );

  const PriceAlertsView = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Price Tracking</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Alert</span>
        </button>
      </div>

      <div className="space-y-6">
        {mockPriceAlerts.map((alert, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  alert.type === 'flight' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  {alert.type === 'flight' ? <Plane className="w-5 h-5" /> : <Bed className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {alert.type === 'flight' ? alert.route : alert.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {alert.type === 'flight' ? alert.airline : alert.dates}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">${alert.currentPrice}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.change < 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {alert.change > 0 ? '+' : ''}${alert.change}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Target: ${alert.targetPrice}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold">Welcome back, Alex! ✈️</h1>
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Sun className="w-4 h-4" />
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-1'} mt-1`} />
                    </div>
                  </div>
                  <Moon className="w-4 h-4" />
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <WeatherWidget weather={{ temp: 18, condition: 'sunny' }} />
              <div className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl p-6 text-white">
                <div className="space-y-3">
                  <p className="text-lg font-semibold">Next Trip</p>
                  <p className="text-2xl font-bold">Tokyo, Japan</p>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">in 18 days</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-teal-400 to-blue-400 rounded-2xl p-6 text-white">
                <div className="space-y-3">
                  <p className="text-lg font-semibold">Active Alerts</p>
                  <p className="text-2xl font-bold">3</p>
                  <div className="flex items-center space-x-1">
                    <Bell className="w-4 h-4" />
                    <span className="text-sm">Price drops available</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold">Your Trips</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {mockTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <MapWidget />
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Recent Activity</h3>
                    {notifications.slice(-3).map((notif, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Bell className="w-4 h-4 mt-0.5 text-gray-400" />
                        <p className="text-sm text-gray-600">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'itinerary':
        return <ItineraryView />;
      case 'packing':
        return <PackingListView />;
      case 'budget':
        return <BudgetTracker />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'documents':
        return <DocumentsView />;
      case 'alerts':
        return <PriceAlertsView />;
      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 shadow-lg min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">WanderPlan</h1>
                <p className="text-xs text-gray-500">Ultimate Travel Companion</p>
              </div>
            </div>

            <hr className="mb-6 border-gray-200" />

            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Compass },
                { id: 'itinerary', label: 'Itinerary', icon: Calendar },
                { id: 'packing', label: 'Packing List', icon: FileText },
                { id: 'budget', label: 'Budget Tracker', icon: Wallet },
                { id: 'recommendations', label: 'Recommendations', icon: Star },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'alerts', label: 'Price Alerts', icon: Bell }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <hr className="my-6 border-gray-200" />

            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors">
                <Users className="w-5 h-5" />
                <span>Invite Travelers</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setSearchOpened(true)}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search destinations, hotels, flights..."
                    className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {notifications.length > 0 && (
                  <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  </button>
                )}
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face" 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full" 
                />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Notifications */}
      {notifications.map((notif, index) => (
        <div
          key={notif.id}
          className="fixed top-20 right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
          style={{ top: 80 + (index * 80) }}
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Travel Alert</h4>
              <p className="text-sm text-gray-600">{notif.message}</p>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-6 left-6 right-6 bg-orange-100 border border-orange-200 rounded-lg p-4 z-50">
          <div className="flex items-start space-x-3">
            <WifiOff className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="text-orange-800 font-medium">You're offline</p>
              <p className="text-orange-700 text-sm">Some features may be limited. Cached trip data is still available.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelPlannerApp;
