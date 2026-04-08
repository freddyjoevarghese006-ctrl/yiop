import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Mic2, 
  Video, 
  Search, 
  Image as ImageIcon, 
  Sparkles, 
  User, 
  LogOut, 
  Play,
  ChevronRight,
  Settings,
  Home
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db } from './lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from './lib/utils';

// --- Contexts ---
const AuthContext = createContext<{
  user: any;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}>({ user: null, loading: true, signIn: async () => {}, logout: async () => {} });

const useAuth = () => useContext(AuthContext);

// --- Components ---

const Button = ({ className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'harmonic-gradient text-on-primary-fixed font-semibold hover:opacity-90',
    secondary: 'bg-surface-container-high border border-outline-variant hover:bg-surface-bright',
    ghost: 'hover:bg-surface-container-low text-secondary',
  };
  return (
    <button 
      className={cn('px-6 py-3 rounded-full transition-all active:scale-95 disabled:opacity-50', variants[variant as keyof typeof variants], className)} 
      {...props} 
    />
  );
};

const Card = ({ children, className, ...props }: any) => (
  <div className={cn('bg-surface-container-low rounded-3xl p-6 border border-outline-variant/5 hover:border-outline-variant/20 transition-all', className)} {...props}>
    {children}
  </div>
);

// --- Screens ---

const LandingScreen = () => {
  const { signIn } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">The Harmonic Monolith</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 leading-[0.9]">
          RESONATE <br />
          <span className="text-primary">BEYOND</span> LIMITS
        </h1>
        <p className="text-on-surface/60 text-lg mb-10 max-w-md mx-auto font-light">
          An immersive, high-end music learning experience powered by Gemini Intelligence.
        </p>
        <Button onClick={signIn} className="text-lg px-10 py-4">
          Enter the Monolith
        </Button>
      </motion.div>
      
      <div className="absolute bottom-10 left-0 w-full overflow-hidden opacity-20 pointer-events-none">
        <div className="flex gap-20 animate-marquee whitespace-nowrap text-[12rem] font-display font-bold text-outline-variant">
          HARMONY RESONANCE MELODY RHYTHM COMPOSITION HARMONY RESONANCE
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold mb-2">Welcome Back</h2>
          <p className="text-on-surface/50">Your musical journey continues here.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="px-4"><Settings size={20} /></Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-4 block">Featured Lesson</span>
            <h3 className="text-3xl font-bold mb-4">Advanced Polyphonic <br />Structures</h3>
            <Button className="mt-4">Resume Learning</Button>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
          <Music className="absolute -bottom-10 -right-10 w-64 h-64 text-on-surface/5 opacity-10 group-hover:scale-110 transition-transform" />
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Daily Goal</h3>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-primary" />
            </div>
            <p className="text-sm text-on-surface/50 mt-2">45 / 60 mins practiced</p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-3xl font-bold">12</div>
            <div className="text-xs font-bold text-secondary uppercase">Day Streak</div>
          </div>
        </Card>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Intelligence Suite</h3>
          <span className="text-xs font-bold text-on-surface/30 uppercase tracking-widest">Powered by Gemini</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Mic2, label: 'Live Voice', color: 'text-tertiary' },
            { icon: Video, label: 'Veo Video', color: 'text-primary' },
            { icon: ImageIcon, label: 'Image Gen', color: 'text-secondary' },
            { icon: Search, label: 'Search Data', color: 'text-on-surface' },
          ].map((tool, i) => (
            <Card key={i} className="flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high cursor-pointer group">
              <tool.icon className={cn('w-8 h-8 transition-transform group-hover:scale-110', tool.color)} />
              <span className="text-sm font-medium">{tool.label}</span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);
        
        if (!docSnap.exists()) {
          await setDoc(userDoc, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
          });
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
      <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30">
        <AnimatePresence mode="wait">
          {!user ? (
            <LandingScreen key="landing" />
          ) : (
            <div key="app" className="flex min-h-screen">
              {/* Sidebar */}
              <nav className="w-20 md:w-64 border-r border-outline-variant/10 flex flex-col p-4 glass fixed h-full z-50">
                <div className="flex items-center gap-3 mb-10 px-2">
                  <div className="w-10 h-10 rounded-xl harmonic-gradient flex items-center justify-center">
                    <Music className="text-on-primary-fixed" size={20} />
                  </div>
                  <span className="hidden md:block font-display font-bold text-xl">MONOLITH</span>
                </div>
                
                <div className="flex-1 space-y-2">
                  {[
                    { id: 'home', icon: Home, label: 'Dashboard' },
                    { id: 'lessons', icon: Music, label: 'Lessons' },
                    { id: 'ai', icon: Sparkles, label: 'AI Suite' },
                    { id: 'profile', icon: User, label: 'Profile' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        'w-full flex items-center gap-4 p-3 rounded-2xl transition-all',
                        activeTab === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-low text-on-surface/60'
                      )}
                    >
                      <item.icon size={24} />
                      <span className="hidden md:block font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-outline-variant/10">
                  <button onClick={logout} className="w-full flex items-center gap-4 p-3 rounded-2xl text-on-surface/40 hover:text-on-surface hover:bg-surface-container-low transition-all">
                    <LogOut size={24} />
                    <span className="hidden md:block font-medium">Logout</span>
                  </button>
                </div>
              </nav>

              {/* Main Content */}
              <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {activeTab === 'home' && <Dashboard />}
                  {activeTab !== 'home' && (
                    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                      <h2 className="text-3xl font-bold mb-4">{activeTab.toUpperCase()}</h2>
                      <p className="text-on-surface/50">This section is currently being tuned.</p>
                    </div>
                  )}
                </motion.div>
              </main>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}
