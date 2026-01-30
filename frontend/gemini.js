import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Github, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Share2, 
  Terminal,
  BrainCircuit,
  Linkedin,
  Twitter,
  Moon,
  Users,
  Briefcase,
  Zap,
  Coffee,
  Mic,
  ShieldAlert
} from 'lucide-react';

// --- Mock Data & Logic ---

const generateSignal = () => {
  const sources = [
    { type: 'github', label: 'GitHub', icon: Github, actions: ['Push to master', 'PR Review', 'High commit velocity'] },
    { type: 'gmail', label: 'Gmail', icon: Mail, actions: ['Inbox Zero reached', 'Composing drafted', 'Reading mode'] },
    { type: 'vscode', label: 'VS Code', icon: Terminal, actions: ['Active debugging', 'High WPM typing', 'Idle for 10m'] },
    { type: 'discord', label: 'Discord', icon: MessageSquare, actions: ['In Voice Channel', 'DND Status', 'Typing...'] },
    { type: 'phone', label: 'iPhone', icon: Smartphone, actions: ['Unlocked', 'On Call', 'Do Not Disturb active'] },
    { type: 'linkedin', label: 'LinkedIn', icon: Linkedin, actions: ['Commented on post', 'Browsing feed', 'Messaging'] },
    { type: 'twitter', label: 'X / Twitter', icon: Twitter, actions: ['Posted Tweet', 'Scrolling timeline'] },
    { type: 'zoom', label: 'Zoom', icon: Mic, actions: ['Mic Active', 'Camera On', 'App Focused'] },
  ];

  const source = sources[Math.floor(Math.random() * sources.length)];
  const action = source.actions[Math.floor(Math.random() * source.actions.length)];
  
  // Heuristic logic
  let impact = 'neutral';
  if (['Push to master', 'Active debugging', 'On Call', 'In Voice Channel', 'DND Status', 'Mic Active'].includes(action)) impact = 'busy';
  if (['Inbox Zero reached', 'Unlocked', 'Browsing feed', 'Scrolling timeline', 'Commented on post'].includes(action)) impact = 'free';

  return {
    id: Date.now(),
    source: source.label,
    icon: source.icon,
    action: action,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    impact: impact
  };
};

// --- Sub-Components (Defined outside App to prevent re-render crashes) ---

const StatusIndicator = ({ status, size = 'md', pulse = true, showLabel = true }) => {
  const config = {
    free: { color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50', label: 'Free Right Now' },
    busy: { color: 'bg-indigo-500', shadow: 'shadow-indigo-500/50', label: 'Deep Work / Busy' },
    offline: { color: 'bg-slate-600', shadow: 'shadow-slate-500/50', label: 'Offline / Sleeping' },
  };
  
  const current = config[status] || config.free;
  const sizeClasses = size === 'lg' ? 'w-6 h-6' : 'w-3 h-3';

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={`${sizeClasses} rounded-full ${current.color} ${pulse && status !== 'offline' ? 'animate-pulse' : ''} shadow-lg`}></div>
        {pulse && status !== 'offline' && <div className={`absolute top-0 left-0 ${sizeClasses} rounded-full ${current.color} animate-ping opacity-75`}></div>}
        {status === 'offline' && <Moon size={size === 'lg' ? 14 : 8} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-950" />}
      </div>
      {showLabel && (
        <span className={`font-semibold tracking-tight ${size === 'lg' ? 'text-2xl text-slate-100' : 'text-sm text-slate-400'}`}>
          {current.label}
        </span>
      )}
    </div>
  );
};

const Gatekeeper = ({ status }) => {
  const [step, setStep] = useState(0);
  const [visitorType, setVisitorType] = useState(null); // 'family', 'work', 'friend'
  const [urgency, setUrgency] = useState(null); // 'low', 'high'

  const reset = () => { setStep(0); setVisitorType(null); setUrgency(null); };

  // The Logic Engine
  const getResult = () => {
    if (status === 'free') {
      return { type: 'allow', msg: "I'm free! Give me a call or shoot a text.", action: "Call +1 (555) 019-2834" };
    }

    if (status === 'offline') {
       if (urgency === 'high' && visitorType === 'family') return { type: 'warn', msg: "I'm likely sleeping, but since it's family and urgent, here is the bypass.", action: "Call Emergency Line" };
       return { type: 'block', msg: "I'm offline right now. I'll get back to you tomorrow.", action: "Send Email" };
    }

    // Status is BUSY
    if (urgency === 'high') {
      if (visitorType === 'work') return { type: 'warn', msg: "I'm in flow, but since it's urgent work...", action: "Ping me on Slack (I'll see the notification)" };
      if (visitorType === 'family') return { type: 'allow', msg: "Interrupt me. Family comes first.", action: "Call Mobile" };
      return { type: 'block', msg: "I'm heads down right now. If it's truly an emergency, text me twice.", action: "Send Text" };
    } else {
      // Low urgency busy
      if (visitorType === 'work') return { type: 'block', msg: "I'm focusing. Let's sync later.", action: "Schedule for later" };
      if (visitorType === 'friend') return { type: 'block', msg: "Can't talk now! Catch up later?", action: "Send DM" };
      return { type: 'block', msg: "I'm busy at the moment.", action: "Send Email" };
    }
  };

  const result = getResult();

  return (
    <div className="w-full max-w-md bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-xl p-6 mt-8 animate-in fade-in slide-in-from-bottom-4">
      {step === 0 && (
        <div className="space-y-4">
          <h3 className="text-slate-300 font-medium mb-4">I am...</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setVisitorType('work'); setStep(1); }} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 hover:border-indigo-500 transition-all flex flex-col items-center gap-2 group">
              <Briefcase className="text-slate-400 group-hover:text-indigo-400" />
              <span className="text-sm font-medium text-slate-300">Co-worker</span>
            </button>
            <button onClick={() => { setVisitorType('family'); setStep(1); }} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 hover:border-emerald-500 transition-all flex flex-col items-center gap-2 group">
              <Users className="text-slate-400 group-hover:text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Family/Partner</span>
            </button>
             <button onClick={() => { setVisitorType('friend'); setStep(1); }} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 hover:border-pink-500 transition-all flex flex-col items-center gap-2 group">
              <Coffee className="text-slate-400 group-hover:text-pink-400" />
              <span className="text-sm font-medium text-slate-300">Friend</span>
            </button>
            <button onClick={() => { setVisitorType('other'); setStep(1); }} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 transition-all flex flex-col items-center gap-2">
              <span className="text-xl">👋</span>
              <span className="text-sm font-medium text-slate-300">Other</span>
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-slate-300 font-medium mb-4">Is it urgent?</h3>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => { setUrgency('high'); setStep(2); }} className="p-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/30 hover:border-rose-500 transition-all flex items-center justify-between group">
              <span className="flex items-center gap-3 text-rose-400 font-medium">
                <ShieldAlert size={20} /> Yes, it's time sensitive
              </span>
              <span className="text-rose-500">→</span>
            </button>
            <button onClick={() => { setUrgency('low'); setStep(2); }} className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 transition-all flex items-center justify-between">
              <span className="flex items-center gap-3 text-slate-300">
                <Coffee size={20} /> No, just catching up
              </span>
              <span className="text-slate-500">→</span>
            </button>
          </div>
          <button onClick={() => setStep(0)} className="text-xs text-slate-500 mt-4 hover:text-slate-300">← Back</button>
        </div>
      )}

      {step === 2 && (
        <div className="text-center py-4">
           <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
             result.type === 'allow' ? 'bg-emerald-500/20 text-emerald-500' :
             result.type === 'warn' ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-700 text-slate-400'
           }`}>
             {result.type === 'allow' ? <CheckCircle size={32} /> : result.type === 'warn' ? <ShieldAlert size={32} /> : <XCircle size={32} />}
           </div>
           <p className="text-slate-200 text-lg font-medium mb-2">"{result.msg}"</p>
           <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mt-4">
              <p className="text-indigo-400 font-mono font-bold text-lg">{result.action}</p>
           </div>
           <button onClick={reset} className="text-xs text-slate-500 mt-6 hover:text-slate-300">Start over</button>
        </div>
      )}
    </div>
  );
};

const PublicView = ({ status, confidence, setView }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
    {/* Background Ambience */}
    <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${
      status === 'free' ? 'bg-emerald-900' : status === 'busy' ? 'bg-indigo-950' : 'bg-slate-950'
    }`}></div>

    <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
      <div className="mb-8 flex justify-center">
        <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-500 shadow-2xl">
          JD
        </div>
      </div>
      
      <StatusIndicator status={status} size="lg" />
      
      <div className="mt-4 px-4 py-1 rounded-full bg-black/40 border border-white/5 text-xs text-slate-500 font-mono backdrop-blur-md">
         Confidence: {confidence}% 
      </div>

      <Gatekeeper status={status} />
    </div>

    <button onClick={() => setView('dashboard')} className="absolute bottom-6 right-6 text-slate-700 hover:text-slate-500 text-sm">
      Owner Login
    </button>
  </div>
);

const Dashboard = ({ status, confidence, signals, integrations, setIntegrations, setView }) => {
  const signalSources = [
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'vscode', label: 'VS Code', icon: Terminal },
    { id: 'social', label: 'Social (X/Linked)', icon: Share2 },
    { id: 'zoom', label: 'Zoom/Meet', icon: Mic },
    { id: 'phone', label: 'Phone', icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="text-indigo-400" />
            <span className="font-bold text-lg tracking-tight">Free Right Now</span>
          </div>
          <button 
            onClick={() => setView('public')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Share2 size={14} />
            Public View
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Status Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BrainCircuit size={120} />
            </div>
            
            <h2 className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-4">Live Status Engine</h2>
            <div className="flex items-center gap-4 mb-6">
              <StatusIndicator status={status} size="lg" />
            </div>
            
            <div className="flex gap-8 mb-8">
              <div>
                <span className="block text-3xl font-light text-white">{confidence}%</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wide">Confidence</span>
              </div>
              <div>
                <span className="block text-3xl font-light text-white">{status === 'offline' ? '> 4h' : 'Now'}</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wide">Last Activity</span>
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-sm text-slate-300 flex items-start gap-2">
                <BrainCircuit size={16} className="mt-0.5 text-indigo-400 shrink-0" />
                <span>
                  <strong>Private Reasoning:</strong> {status === 'offline' 
                    ? "No digital signals detected across devices for extended duration. Assuming sleep or intentional disconnect." 
                    : signals[0] 
                      ? `Detected ${signals[0].action} on ${signals[0].source}. This is typically a ${signals[0].impact} signal.`
                      : "Analyzing signals..."}
                </span>
              </p>
            </div>
          </div>

          {/* Live Signal Stream */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                <Activity size={16} className="text-emerald-500" />
                Raw Signal Feed (Private)
              </h3>
              <span className="text-xs text-slate-500 font-mono">Encrypted</span>
            </div>
            <div className="divide-y divide-slate-800/50 max-h-[300px] overflow-y-auto">
              {signals.map((sig) => {
                const Icon = sig.icon;
                return (
                  <div key={sig.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        {/* Fix: Render Icon as a component, not a property access */}
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{sig.action}</p>
                        <p className="text-xs text-slate-500">{sig.source}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        sig.impact === 'busy' ? 'bg-indigo-500/10 text-indigo-400' : 
                        sig.impact === 'free' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {sig.impact}
                      </span>
                      <p className="text-xs text-slate-600 mt-1 font-mono">{sig.timestamp}</p>
                    </div>
                  </div>
                );
              })}
              {signals.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">No signals detected (System is idle)</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Settings size={16} /> Signal Stack
            </h3>
            <div className="space-y-2">
              {signalSources.map(app => {
                const Icon = app.icon;
                return (
                  <div key={app.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={integrations[app.id] ? 'text-indigo-400' : 'text-slate-600'} />
                      <span className={`text-sm ${integrations[app.id] ? 'text-slate-200' : 'text-slate-500 line-through'}`}>{app.label}</span>
                    </div>
                    <button 
                      onClick={() => setIntegrations(p => ({...p, [app.id]: !p[app.id]}))}
                      className={`w-10 h-5 rounded-full relative transition-colors ${integrations[app.id] ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${integrations[app.id] ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <ShieldAlert size={16} /> Contact Rules
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-indigo-400">BUSY + FAMILY + URGENT</span>
                </div>
                <p className="text-sm text-slate-300">Action: <span className="text-white">Allow Call</span></p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500">BUSY + WORK + URGENT</span>
                </div>
                <p className="text-sm text-slate-300">Action: <span className="text-white">Slack Ping</span></p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500">OFFLINE + WORK</span>
                </div>
                <p className="text-sm text-slate-300">Action: <span className="text-white">Block / Email</span></p>
              </div>
              <button className="w-full mt-2 py-2 text-xs border border-dashed border-slate-700 text-slate-500 rounded hover:text-indigo-400">
                + Edit Rules
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'public'
  const [status, setStatus] = useState('free'); // 'free' | 'busy' | 'offline'
  const [confidence, setConfidence] = useState(85);
  const [signals, setSignals] = useState([]);
  const [lastSignalTime, setLastSignalTime] = useState(Date.now());
  const [integrations, setIntegrations] = useState({
    github: true,
    gmail: true,
    discord: true,
    phone: true,
    vscode: true,
    social: true,
    zoom: true
  });
  
  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% chance to generate a signal, or silence (to simulate sleep/offline)
      if (Math.random() > 0.3) {
        const newSignal = generateSignal();
        
        // Filter based on enabled integrations
        const isSocial = ['LinkedIn', 'X / Twitter'].includes(newSignal.source);
        if ((isSocial && !integrations.social) || (!isSocial && !integrations[newSignal.source.toLowerCase()] && !integrations.vscode && !integrations.zoom)) {
            return; 
        }

        setSignals(prev => [newSignal, ...prev].slice(0, 10));
        setLastSignalTime(Date.now());
        
        // Update Status Logic
        if (newSignal.impact === 'busy') {
          setStatus('busy');
          setConfidence(prev => Math.min(prev + 5, 98));
        } else if (newSignal.impact === 'free') {
          setStatus('free');
          setConfidence(prev => Math.max(prev - 2, 60));
        }
      } else {
        // Check for inactivity (simulated scaling: 5 seconds = 1 hour)
        const timeDiff = Date.now() - lastSignalTime;
        if (timeDiff > 8000 && status !== 'offline') { // If "silent" for ~8 seconds
           setStatus('offline');
           setConfidence(99);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [integrations, lastSignalTime, status]);

  return view === 'dashboard' ? (
    <Dashboard 
      status={status} 
      confidence={confidence} 
      signals={signals} 
      integrations={integrations} 
      setIntegrations={setIntegrations} 
      setView={setView} 
    />
  ) : (
    <PublicView 
      status={status} 
      confidence={confidence} 
      setView={setView} 
    />
  );
}