import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Activity, 
  Calendar, 
  FileText, 
  User, 
  Settings, 
  Wifi, 
  Bell, 
  Zap, 
  Brain, 
  Plus, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  ChevronRight, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Database,
  Cpu,
  PlayCircle,
  Trash2 
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// --- YOUR FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyD3x8dcjWXjhzNFcO9nJ6jqeYIIfydlJ34",
  authDomain: "medisure-web.firebaseapp.com",
  projectId: "medisure-web",
  storageBucket: "medisure-web.firebasestorage.app",
  messagingSenderId: "1052730310952",
  appId: "1:1052730310952:web:4ef454089a0db3ab27d01d",
  measurementId: "G-K7Q8CPVBQH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- CONSTANTS ---
const DEVICE_ID = 'esp32_001'; 

// --- CUSTOM HOOKS ---

function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    signInAnonymously(auth).catch((error) => {
      console.error("Auth Error:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return user;
}

function useFirestoreDoc(collectionName, docId, defaultData = null) {
  const [data, setData] = useState(defaultData);
  const user = useAuth();

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, collectionName, docId);
    
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setData(snap.data());
      } else if (defaultData) {
        setData(defaultData);
      }
    }, (err) => console.error(`Error reading ${collectionName}/${docId}:`, err));

    return () => unsubscribe();
  }, [user, collectionName, docId]);

  const update = async (newData) => {
    if (!user) return;
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, newData, { merge: true });
  };

  return [data, update];
}

function useFirestoreCollection(path) {
  const [data, setData] = useState([]);
  const user = useAuth();

  useEffect(() => {
    if (!user) return;
    const parts = path.split('/');
    const colRef = collection(db, ...parts);
    const q = query(colRef); 

    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
          if (a.time && b.time) return a.time.localeCompare(b.time);
          const tA = a.timestamp?.seconds || 0;
          const tB = b.timestamp?.seconds || 0;
          return tB - tA; 
      });
      setData(docs);
    }, (err) => console.error(`Error reading collection ${path}:`, err));

    return () => unsubscribe();
  }, [user, path]);

  const add = async (newData) => {
    if (!user) return;
    const parts = path.split('/');
    const colRef = collection(db, ...parts);
    await addDoc(colRef, { 
        ...newData, 
        timestamp: serverTimestamp() 
    });
  };

  const remove = async (docId) => {
    if (!user) return;
    const parts = path.split('/');
    const colRef = collection(db, ...parts);
    const docRef = doc(colRef, docId);
    await deleteDoc(docRef);
  };

  return [data, add, remove];
}

// --- SUB-COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-6 py-4 transition-colors ${
      active 
        ? 'text-blue-600 border-l-4 border-blue-600 bg-blue-50' 
        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, colorClass, subText }) => (
  <div className={`rounded-xl p-5 border ${colorClass} flex items-center justify-between`}>
    <div>
      <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
      {subText && <div className="text-xs mt-1 opacity-60">{subText}</div>}
    </div>
    <div className={`p-3 rounded-full bg-white bg-opacity-40`}>
      <Icon size={24} />
    </div>
  </div>
);

// --- VIEWS ---

const HomeView = ({ navigate }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="text-center py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        Smart Medication Intake <br />
        <span className="text-blue-600">Monitoring & Alerts</span>
      </h1>
      <p className="text-gray-500 max-w-2xl mx-auto mb-8">
        Automated medicine dispensing with real-time intake tracking, AI-driven insights, and instant caregiver notifications.
      </p>
      <button 
        onClick={() => navigate('dashboard')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg flex items-center mx-auto space-x-2"
      >
        <span>Go to Dashboard</span>
        <ChevronRight size={18} />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="hover:shadow-md transition-shadow">
        <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
          <Zap size={24} />
        </div>
        <h3 className="font-bold text-lg mb-2">Auto Dispense</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Precise medicine release at scheduled times using ESP32 hardware control.
        </p>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
          <Bell size={24} />
        </div>
        <h3 className="font-bold text-lg mb-2">Smart Alerts</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Visual, audio, and mobile notifications if a dose is delayed or missed.
        </p>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
          <Activity size={24} />
        </div>
        <h3 className="font-bold text-lg mb-2">Data Analytics</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Identify patterns in medication adherence with our data integration.
        </p>
      </Card>
    </div>
  </div>
);

const DashboardView = ({ logs, status }) => {
  const onTime = logs.filter(l => l.status === 'TAKEN').length;
  const missed = logs.filter(l => l.status === 'MISSED').length;
  const delayed = logs.filter(l => l.status === 'DELAYED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Health Dashboard</h2>
        <p className="text-gray-500 text-sm">System initialization complete. Monitoring active.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="On Time" 
          value={onTime} 
          icon={CheckCircle} 
          colorClass="bg-green-50 border-green-100 text-green-700" 
        />
        <StatCard 
          label="Delayed" 
          value={delayed} 
          icon={Clock} 
          colorClass="bg-yellow-50 border-yellow-100 text-yellow-700" 
        />
        <StatCard 
          label="Missed" 
          value={missed} 
          icon={AlertTriangle} 
          colorClass="bg-red-50 border-red-100 text-red-700" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-64 flex flex-col justify-center items-center text-center">
          <div className="flex items-center space-x-2 text-gray-900 font-bold mb-4 self-start">
            <TrendingUp size={20} className="text-blue-600" />
            <span>Intake Trends</span>
          </div>
          {logs.length === 0 ? (
             <div className="text-gray-300 flex flex-col items-center">
               <FileText size={48} className="mb-2 opacity-50"/>
               <p className="text-sm">No activity data yet</p>
               <p className="text-xs max-w-xs mt-1">Data will appear here once the machine begins dispensing scheduled medications.</p>
             </div>
          ) : (
             <div className="w-full h-full flex items-end justify-between space-x-2 px-4 pb-2">
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                    <div key={i} className="w-full bg-blue-100 rounded-t-lg relative group">
                        <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg group-hover:bg-blue-500 transition-all"></div>
                    </div>
                ))}
             </div>
          )}
        </Card>

        <div className="bg-blue-600 rounded-2xl p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Brain size={120} />
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-full mb-4">
            <Zap size={32} />
          </div>
          <h3 className="font-bold text-lg mb-2">Ready to Analyze</h3>
          <p className="text-blue-100 text-sm max-w-xs">
            The AI will provide behavioral patterns and caregiver tips once the first logs are generated.
          </p>
        </div>
      </div>

      <Card>
        <h3 className="font-bold text-gray-900 mb-4">Recent Intake Records</h3>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm italic">
            Waiting for machine dispense logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-medium">
                        <th className="pb-3 pl-2">Date</th>
                        <th className="pb-3">Medicine</th>
                        <th className="pb-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.slice(0, 5).map((log, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                            <td className="py-3 pl-2 text-gray-600">
                                {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                            </td>
                            <td className="py-3 font-medium text-gray-800">{log.medicineName || 'Unknown'}</td>
                            <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    log.status === 'TAKEN' ? 'bg-green-100 text-green-700' : 
                                    log.status === 'MISSED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {log.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

const ScheduleView = ({ schedules, addSchedule, removeSchedule, deviceStatus, sendCommand }) => {
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newMedName || !newMedTime) return;
    await addSchedule({
      name: newMedName,
      time: newMedTime,
      active: true
    });
    setNewMedName('');
    setNewMedTime('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medication Schedule</h2>
          <p className="text-gray-500 text-sm">Manage prescription times and dispense commands</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span>Add Medicine</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
            {isAdding && (
                <Card className="border-blue-200 bg-blue-50">
                    <h4 className="font-bold text-blue-900 mb-3">Add New Prescription</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input 
                            type="text" 
                            placeholder="Medicine Name (e.g. Aspirin)" 
                            className="p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newMedName}
                            onChange={(e) => setNewMedName(e.target.value)}
                        />
                        <input 
                            type="time" 
                            className="p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newMedTime}
                            onChange={(e) => setNewMedTime(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">Save Schedule</button>
                        <button onClick={() => setIsAdding(false)} className="text-gray-500 px-4 py-2 text-sm">Cancel</button>
                    </div>
                </Card>
            )}

          {schedules.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-400">
              <div className="bg-gray-50 p-4 rounded-full mb-3">
                <Database size={32} />
              </div>
              <p>No medications scheduled yet.</p>
            </div>
          ) : (
            schedules.map((sched, idx) => (
              <Card key={idx} className="flex items-center justify-between group hover:border-blue-200 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{sched.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                        <Clock size={12} className="mr-1"/> {sched.time} Daily
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">ACTIVE</span>
                    <button 
                      onClick={() => removeSchedule(sched.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                      title="Delete Schedule"
                    >
                      <Trash2 size={18} />
                    </button>
                </div>
              </Card>
            ))
          )}
        </div>

        <div>
          <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold mb-4 flex items-center">
                <Zap size={18} className="mr-2 text-blue-400"/>
                Manual Override
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={() => sendCommand('OPEN')}
                className="bg-blue-600 hover:bg-blue-500 py-4 rounded-xl flex flex-col items-center transition-colors"
              >
                <Unlock size={24} className="mb-2" />
                <span className="text-sm font-medium">Open</span>
              </button>
              <button 
                onClick={() => sendCommand('CLOSE')}
                className="bg-gray-800 hover:bg-gray-700 py-4 rounded-xl flex flex-col items-center transition-colors"
              >
                <Lock size={24} className="mb-2" />
                <span className="text-sm font-medium">Close</span>
              </button>
            </div>

            <button 
                onClick={() => sendCommand('EMERGENCY_DISPENSE')}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 py-6 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group transition-all"
            >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <AlertTriangle size={32} className="mb-2 text-white animate-pulse" />
                <span className="font-bold">Emergency Dispense</span>
                <span className="text-xs opacity-75 mt-1">IMMEDIATE RELEASE</span>
            </button>

            <div className="mt-6 flex justify-between items-center text-xs text-gray-500">
                <span>Hardware Link</span>
                <span className={`px-2 py-1 rounded uppercase font-bold ${deviceStatus?.online ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {deviceStatus?.online ? 'CONNECTED' : 'OFFLINE'}
                </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportsView = ({ logs }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Historical Reports</h2>
        <p className="text-gray-500 text-sm">Comprehensive logs of medication compliance</p>
      </div>
      <div className="flex space-x-2">
        <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center">
            <Download size={16} className="mr-2"/> Export PDF
        </button>
        <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Export CSV</button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-3 min-h-[400px]">
        <h3 className="font-bold text-gray-900 mb-4">Activity Log</h3>
        {logs.length === 0 ? (
             <div className="h-64 flex items-center justify-center text-gray-400 text-sm italic bg-gray-50 rounded-xl">
                 No history found. Once the ESP32 logs intake, they will appear here.
             </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-medium text-xs uppercase tracking-wider">
                        <th className="pb-4 pl-4">Date</th>
                        <th className="pb-4">Medicine</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Time Delta</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {logs.map((log, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 pl-4 text-gray-600 font-mono text-xs">
                                {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                            </td>
                            <td className="py-4 font-medium text-gray-800">{log.medicineName || 'Scheduled Dose'}</td>
                            <td className="py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    log.status === 'TAKEN' ? 'bg-green-50 text-green-700 border-green-100' : 
                                    log.status === 'MISSED' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                }`}>
                                    {log.status}
                                </span>
                            </td>
                            <td className="py-4 text-gray-500 font-mono text-xs">
                                {log.timeDelta || '+0s'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Mini Stats for Reports */}
      <Card>
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Patient Stats</h4>
            <div className="mb-6">
                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Overall Adherence</div>
                <div className="text-4xl font-bold text-gray-900">
                    {logs.length > 0 ? Math.round((logs.filter(l => l.status === 'TAKEN').length / logs.length) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-400 mt-1">Based on logs</div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-3">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${logs.length > 0 ? Math.round((logs.filter(l => l.status === 'TAKEN').length / logs.length) * 100) : 0}%`}}></div>
                </div>
            </div>
        </Card>
    </div>
  </div>
);

const ProfileView = ({ profile, updateProfile }) => {
  const [formData, setFormData] = useState({ name: 'New Patient', age: '', condition: '', caregiverName: 'Primary Caregiver', contact: '', notifications: true });
  
  useEffect(() => {
    // Merge database profile with defaults to ensure 'notifications' field exists
    if (profile) {
      setFormData(prev => ({ ...prev, ...profile }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleNotifications = () => {
    // UPDATED: Now saves to database immediately on toggle
    const updatedProfile = {...formData, notifications: !formData.notifications};
    setFormData(updatedProfile);
    updateProfile(updatedProfile);
  };

  const handleSave = () => {
    updateProfile(formData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold">
                {formData.name.charAt(0)}
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                <p className="text-gray-500 text-sm">Managing health records & caregiver info</p>
            </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <div className="flex items-center space-x-2 mb-6">
                    <User className="text-blue-600" size={20}/>
                    <h3 className="font-bold text-gray-900">Patient Info</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Name</label>
                        <input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Age</label>
                        <input 
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Primary Condition</label>
                        <textarea 
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center space-x-2 mb-6">
                    <User className="text-blue-600" size={20}/>
                    <h3 className="font-bold text-gray-900">Caregiver Info</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Name</label>
                        <input 
                            name="caregiverName"
                            value={formData.caregiverName}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Emergency Contact</label>
                        <input 
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <span className="text-sm font-medium text-gray-900">Push Notifications</span>
                        <div 
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.notifications ? 'bg-green-500' : 'bg-gray-300'}`}
                            onClick={toggleNotifications}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.notifications ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </div>
                </div>
            </Card>
       </div>

       <div className="bg-blue-600 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg shadow-blue-200">
            <div>
                <h3 className="font-bold">Health Data Sync</h3>
                <p className="text-blue-100 text-sm">All changes are encrypted and shared with your medical team.</p>
            </div>
            <button onClick={handleSave} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">
                Save Records
            </button>
       </div>
    </div>
  );
};

const SettingsView = ({ settings, updateSettings, deviceStatus, isSimulating, setIsSimulating, addSimulationLog }) => {
    // Default settings if null
    const safeSettings = settings || { alarmSound: true, alertDelay: 10, drawerTimeout: 5 };

    const handleToggle = () => updateSettings({ ...safeSettings, alarmSound: !safeSettings.alarmSound });
    const handleSlider = (name, val) => updateSettings({ ...safeSettings, [name]: parseInt(val) });

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Machine Settings</h2>
                <p className="text-gray-500 text-sm">Configure ESP32 device behavior and alert triggers</p>
            </div>

            <Card className="p-8">
                <div className="flex items-center space-x-2 text-blue-900 font-bold mb-6">
                    <Zap size={20}/>
                    <h3>Hardware Configuration</h3>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 flex justify-between items-center mb-8">
                    <div>
                        <div className="font-bold text-gray-900">Device Alarm Sound</div>
                        <div className="text-sm text-gray-500">Play a loud beep on the machine when it's pill time</div>
                    </div>
                    <div 
                        className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${safeSettings.alarmSound ? 'bg-blue-600' : 'bg-gray-300'}`}
                        onClick={handleToggle}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${safeSettings.alarmSound ? 'translate-x-6' : ''}`}></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-gray-700 text-sm">Alert Delay</span>
                            <span className="font-bold text-blue-600 text-sm">{safeSettings.alertDelay} min</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" max="60" 
                            value={safeSettings.alertDelay}
                            onChange={(e) => handleSlider('alertDelay', e.target.value)}
                            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <p className="text-xs text-gray-400 mt-2">Time before sending notification to caregiver if pill isn't taken.</p>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-gray-700 text-sm">Drawer Timeout</span>
                            <span className="font-bold text-blue-600 text-sm">{safeSettings.drawerTimeout} min</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" max="20" 
                            value={safeSettings.drawerTimeout}
                            onChange={(e) => handleSlider('drawerTimeout', e.target.value)}
                            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <p className="text-xs text-gray-400 mt-2">Duration the drawer remains unlocked after dispensing.</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deviceStatus?.online ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                            <Wifi size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">Connection Status</div>
                            <div className="text-sm text-gray-500">{deviceStatus?.online ? 'Device Online' : 'Device Offline'}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-gray-400 uppercase">Firmware</div>
                        <div className="text-gray-700 font-mono text-sm">v0.0.1-ready</div>
                    </div>
                </div>
            </Card>

            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-start space-x-3">
                <div className="bg-yellow-200 p-2 rounded-lg text-yellow-700">
                    <AlertTriangle size={18} />
                </div>
                <div>
                    <h4 className="font-bold text-yellow-900 text-sm">Technical Information</h4>
                    <p className="text-xs text-yellow-800 mt-1 leading-relaxed">
                        Changing these settings will sync with your ESP32 device via Firebase Realtime Database. Ensure your machine is powered on and connected to Wi-Fi for changes to take effect immediately.
                    </p>
                </div>
            </div>

            {/* --- SIMULATOR SECTION --- */}
            <div className="bg-gray-900 text-white rounded-xl p-6 shadow-xl border border-gray-700">
                <div className="flex items-center space-x-2 text-purple-400 font-bold mb-4">
                    <Cpu size={20}/>
                    <h3>Developer Tools / Simulator</h3>
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-bold text-white">Enable Hardware Simulator</div>
                            <div className="text-sm text-gray-400 max-w-md">
                                Simulate the ESP32 hardware in the browser. This allows testing "Emergency Dispense" logs and "Online" status without a physical device.
                            </div>
                        </div>
                        <div 
                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${isSimulating ? 'bg-purple-600' : 'bg-gray-600'}`}
                            onClick={() => setIsSimulating(!isSimulating)}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isSimulating ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </div>

                    {isSimulating && (
                         <div className="pt-4 border-t border-gray-700 animate-fade-in">
                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Force Status Events</h4>
                             <div className="flex space-x-3">
                                 <button onClick={() => addSimulationLog('TAKEN')} className="flex items-center space-x-2 bg-green-900 text-green-300 px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">
                                     <CheckCircle size={16}/> <span>Simulate Taken</span>
                                 </button>
                                 <button onClick={() => addSimulationLog('DELAYED')} className="flex items-center space-x-2 bg-yellow-900 text-yellow-300 px-4 py-2 rounded-lg hover:bg-yellow-800 transition-colors">
                                     <Clock size={16}/> <span>Simulate Delayed</span>
                                 </button>
                                 <button onClick={() => addSimulationLog('MISSED')} className="flex items-center space-x-2 bg-red-900 text-red-300 px-4 py-2 rounded-lg hover:bg-red-800 transition-colors">
                                     <XCircle size={16}/> <span>Simulate Missed</span>
                                 </button>
                             </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const user = useAuth(); // Waits for anonymous login
  
  // Local State for Simulation
  const [isSimulating, setIsSimulating] = useState(false);

  // --- FIRESTORE REALTIME HOOKS ---
  // Note: We use 'devices/esp32_001' as the root document to be clean.
  
  // 1. Settings (Doc) -> devices/esp32_001/config/settings
  const [settings, updateSettings] = useFirestoreDoc('devices', `${DEVICE_ID}_settings`, {
    alarmSound: true,
    alertDelay: 10,
    drawerTimeout: 5
  });

  // 2. Profile (Doc) -> devices/esp32_001/data/profile
  const [profile, updateProfile] = useFirestoreDoc('devices', `${DEVICE_ID}_profile`, {
    name: 'New Patient',
    age: '',
    condition: '',
    caregiverName: 'Primary Caregiver',
    contact: '',
    notifications: true
  });

  // 3. Status (Doc) -> devices/esp32_001/data/status
  const [deviceStatus] = useFirestoreDoc('devices', `${DEVICE_ID}_status`, { online: false, lastSeen: null });

  // 4. Schedules (Collection) -> devices/esp32_001/schedules
  // Note: We create a collection based on the device ID
  const [schedules, addSchedule, removeSchedule] = useFirestoreCollection(`devices/${DEVICE_ID}/schedules`);

  // 5. Logs (Collection) -> devices/esp32_001/logs
  const [logs] = useFirestoreCollection(`devices/${DEVICE_ID}/logs`);

  // 6. Commands (Doc) -> devices/esp32_001/commands/latest
  // We use a specific document to write commands. Need to read it too for simulation.
  const [commandData, updateCommands] = useFirestoreDoc('devices', `${DEVICE_ID}_commands`, { command: 'NONE' });

  const sendCommand = async (cmd) => {
    console.log("Sending Command:", cmd);
    await updateCommands({ 
        command: cmd,
        timestamp: serverTimestamp()
    });
  };

  // --- HELPER FOR SIMULATION ---
  const addSimulationLog = async (status) => {
    try {
        await addDoc(collection(db, 'devices', DEVICE_ID, 'logs'), {
            medicineName: status === 'MISSED' ? 'Missed Dose' : 'Simulated Pill',
            status: status, // 'TAKEN', 'MISSED', 'DELAYED'
            timeDelta: status === 'DELAYED' ? '+30m' : '0s',
            timestamp: serverTimestamp()
        });
        console.log(`Simulated ${status} log added`);
    } catch (e) {
        console.error("Error adding simulation log:", e);
    }
  };

  // --- SYNC SCHEDULES TO SETTINGS (For ESP32) ---
  useEffect(() => {
    // 1. Create a sorted comma-separated string of times (e.g., "08:00,14:00")
    const timeString = schedules
      .filter(s => s.active) // Only active schedules
      .map(s => s.time)
      .sort()
      .join(',');

    // 2. Update the settings document if different
    // This allows the ESP32 to read one single string instead of querying a collection
    if (settings && settings.scheduleString !== timeString) {
      console.log("Syncing schedules to ESP32 settings:", timeString);
      updateSettings({ scheduleString: timeString });
    }
  }, [schedules, settings]);

  // --- SIMULATION LOGIC ---
  useEffect(() => {
    if (!isSimulating) return;

    // 1. Maintain Online Status (Heartbeat every 5s)
    const statusRef = doc(db, 'devices', `${DEVICE_ID}_status`);
    // Initial set
    setDoc(statusRef, { online: true, lastSeen: serverTimestamp() }, { merge: true });
    
    const interval = setInterval(() => {
        setDoc(statusRef, { online: true, lastSeen: serverTimestamp() }, { merge: true });
    }, 5000);

    return () => {
        clearInterval(interval);
        // Optional: Set offline when turning off sim?
        setDoc(statusRef, { online: false }, { merge: true });
    }
  }, [isSimulating]);

  useEffect(() => {
    if (!isSimulating || !commandData) return;

    const cmd = commandData.command;
    if (cmd && cmd !== 'NONE') {
        console.log("[SIMULATOR] Received Command:", cmd);
        
        // Simulate Processing Delay (2 seconds)
        const timeout = setTimeout(async () => {
            // Log the action if it's a dispense command
            if (cmd === 'EMERGENCY_DISPENSE' || cmd === 'OPEN') {
                console.log("[SIMULATOR] Dispensing...");
                await addDoc(collection(db, 'devices', DEVICE_ID, 'logs'), {
                    medicineName: cmd === 'OPEN' ? 'Manual Open' : 'Emergency Dispense',
                    status: 'TAKEN',
                    timeDelta: '0s',
                    timestamp: serverTimestamp()
                });
            }

            // Acknowledge/Reset Command
            console.log("[SIMULATOR] Ack Command");
            updateCommands({ command: 'NONE' });

        }, 2000);

        return () => clearTimeout(timeout);
    }

  }, [isSimulating, commandData]); // Run whenever command data changes from Firestore

  const renderContent = () => {
    switch(activeTab) {
      case 'home': return <HomeView navigate={setActiveTab} />;
      case 'dashboard': return <DashboardView logs={logs} status={deviceStatus} />;
      case 'schedule': return <ScheduleView schedules={schedules} addSchedule={addSchedule} removeSchedule={removeSchedule} deviceStatus={deviceStatus} sendCommand={sendCommand} />;
      case 'reports': return <ReportsView logs={logs} />;
      case 'profile': return <ProfileView profile={profile} updateProfile={updateProfile} />;
      case 'settings': return <SettingsView settings={settings} updateSettings={updateSettings} deviceStatus={deviceStatus} isSimulating={isSimulating} setIsSimulating={setIsSimulating} addSimulationLog={addSimulationLog} />;
      default: return <HomeView navigate={setActiveTab} />;
    }
  };

  if (!user) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4"></div>
                <div className="text-gray-400 font-medium">Connecting to Medisure Cloud...</div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col justify-between fixed h-full z-10 transition-all duration-300">
        <div>
          <div className="h-20 flex items-center px-6 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg mr-3">
              <Activity size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight hidden lg:block">Medisure</span>
          </div>

          <nav className="space-y-1">
            <SidebarItem icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <SidebarItem icon={Activity} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={Calendar} label="Pill Schedule" active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
            <SidebarItem icon={FileText} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            <SidebarItem icon={User} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>
        </div>

        <div className="p-6">
           {/* Connection Indicator */}
           <div className={`hidden lg:flex items-center space-x-3 px-4 py-3 rounded-xl ${deviceStatus?.online ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
               <div className={`w-2 h-2 rounded-full ${deviceStatus?.online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
               <div className="text-xs font-bold uppercase tracking-wider">
                   {deviceStatus?.online ? 'ESP32 Online' : 'ESP32 Offline'}
               </div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-20 lg:ml-64 bg-white">
        {/* Header */}
        <header className="h-20 border-b border-gray-50 flex items-center justify-end px-8 sticky top-0 bg-white/90 backdrop-blur-md z-10">
            <div className="flex items-center space-x-4">
                <div 
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-gray-200"
                >
                   <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                       {profile?.name || 'New Patient'}
                   </span>
                </div>
                <div 
                    onClick={() => setActiveTab('profile')}
                    className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all flex items-center justify-center text-blue-600 font-bold"
                >
                    {profile?.name ? profile.name.charAt(0) : 'U'}
                </div>
            </div>
        </header>

        {/* Page Content */}
        <main className="p-8 lg:p-12 max-w-7xl mx-auto">
          {renderContent()}
        </main>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg shadow-red-200 transition-transform transform hover:scale-110 flex items-center justify-center"
            onClick={() => {
                setActiveTab(activeTab === 'schedule' ? 'home' : 'schedule');
            }}
        >
            <div className="absolute animate-ping inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></div>
            
            {activeTab === 'schedule' ? (
                <XCircle size={24} />
            ) : (
                <>
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIyIDE2LjkydjN1YTYgNiAwIDAgMS0yLjg4IDMuMzFsLTUuNTggMy4yMmE2IDYgMCAwIDEtNi4wOCAwbC01LjU4LTMuMjJBNiA2IDAgMCAxIDIgMTkuOTJ2LTN1Ii8+PHBhdGggZD0iTTIgNy4wOHYtM3VhNiA2IDAgMCAxIDIuODgtMy4zMWw1LjU4LTMuMjJhNiA2IDAgMCAxIDYuMDggMGw1LjU4IDMuMjJBNiA2IDAgMCAxIDIyIDQuMDh2M3UiLz48L3N2Zz4=" className="w-6 h-6" alt="Emergency" />
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </>
            )}
        </button>
      </div>

    </div>
  );
}