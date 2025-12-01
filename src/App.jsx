import React, { useState, useEffect } from 'react';
import { Heart, Star, MessageCircleHeart, Sparkles, Bookmark, X, Clock, Instagram, Lock, Key, LogOut } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, serverTimestamp } from "firebase/firestore";

// --- CONFIGURATION & CONTENT ---

const HER_NAME = "Arsha"; 
const YOUR_NAME = "CUTIE"; 

const DAILY_COMPLIMENTS = [
  // English
  "Arsha, when you smile, the whole world stops to stare.",
  "You look cute even when you're stressed about exams.",
  "I think Google is jealous because you have all the answers.",
  "Your smile is illegal... too attractive.",
  "Breaking news: The prettiest medical student is looking at this screen.",
  "You + Coffee = Perfect morning for me.",
  "Reminder: You're the reason I'm happy for no reason.",
  "If beauty was time, you'd be eternity.",
  "That day in Kochi was magic, but everyday with you is a miracle.",
  
  // Malayalam
  "എന്റെ അർഷക്കുട്ടിയെ പോലെ വേറെ ആരും ഇല്ല.",
  "നിന്റെ കണ്ണുകളിൽ നോക്കുമ്പോൾ സമയം പോകുന്നത് ഞാൻ അറിയാറില്ല.",
  "നീ കൂടെയുള്ളപ്പോൾ ഓരോ നിമിഷവും ഒരു ആഘോഷമാണ്.",
  "നിന്റെ ചിരി കണ്ടാൽ മതി, എന്റെ എല്ലാ ദേഷ്യവും മാറും.",
  "വയനാട്ടിലെ കോടമഞ്ഞിനേക്കാൾ സുന്ദരിയാണ് നീ.",
  "എന്റെ ഹൃദയത്തിന്റെ താളം തെറ്റിക്കാൻ നിനക്ക് മാത്രമേ കഴിയൂ.",
  "നീ ഇല്ലാതെ ഒരു ദിവസം പോലും എനിക്ക് ചിന്തിക്കാൻ വയ്യ.",
  "ദൈവം എനിക്ക് തന്ന ഏറ്റവും വലിയ സമ്മാനമാണ് നീ.",
  "നിന്നെ കാണുമ്പോൾ എന്റെ മനസ്സ് നിറയുന്നു.",
  "എന്റെ ലോകം തന്നെ ചുറ്റുന്നത് നിനക്ക് വേണ്ടിയാണ്."
];

const EXTRA_COMPLIMENTS = [
  // English
  "You are the most beautiful view, way better than Wayanad.",
  "You're so cute, mangoes are jealous.",
  "You deserve an award for tolerating me.",
  "Certified prettiest human of the century.",
  "If beauty was a crime, you'd be serving a life sentence.",
  "Stop being so perfect, it's unfair to others!",
  "Thank god for Snapchat streaks, or I might have missed you.",

  // Malayalam
  "നിന്റെ സ്വഭാവം ആണ് നിന്റെ ഏറ്റവും വലിയ ഭംഗി.",
  "എന്റെ ലോകം നീയാണ്, അർഷ.",
  "നിന്നെ കിട്ടിയതാണ് എന്റെ ജീവിതത്തിലെ ഏറ്റവും വലിയ ഭാഗ്യം.",
  "നിന്റെ സൗന്ദര്യം കണ്ട് പലപ്പോഴും ഞാൻ അത്ഭുതപ്പെടാറുണ്ട്.",
  "എന്റെ ജീവന്റെ ജീവനാണ് നീ.",
  "ഒരുപാട് സ്നേഹം എന്റെ പൊന്നു മോളെ.",
  "നിന്റെ ശബ്ദം കേൾക്കുന്നത് തന്നെ എനിക്ക് ഒരു ആശ്വാസമാണ്."
];

const PERSONAL_MESSAGES = [
  // English
  "Do you remember our first snap? My life changed that day.",
  "Hey baby, drink water pls 😘",
  "I'm proud of you, future Dr. Arsha ❤",
  "You're my peaceful place.",
  "Just a reminder: I believe in you.",
  "Thinking about that time in Kochi... can't wait to see you again.",

  // Malayalam
  "നമ്മുടെ ആദ്യത്തെ സ്നാപ്പ് ഓർമ്മയുണ്ടോ? അന്ന് മാറിയതാണ് എന്റെ ജീവിതം.",
  "വെള്ളം കുടിക്കാൻ മറക്കല്ലേ മോളെ...",
  "നീ ഡോക്ടറായി കാണാൻ ഞാൻ കാത്തിരിക്കുവാണ്.",
  "നീയാണ് എന്റെ സമാധാനം.",
  "നീ കൂടെയുണ്ടെങ്കിൽ എല്ലാം ശരിയാകും.",
  "എനിക്ക് നിന്നിൽ പൂർണ്ണ വിശ്വാസമുണ്ട്.",
  "കൊച്ചിയിലെ ആ കൂടിക്കാഴ്ച... നിന്നെ വീണ്ടും കാണാൻ കൊതിയാകുന്നു."
];

const ROASTS = [
  // English
  "Studying MBBS but still can't cure her own mood swings.",
  "You're lucky you're cute, otherwise your attitude would be a problem.",
  "Uzbekistan is cold, but your 'seen' zone is colder.",
  "I love you even when you steal the blankets.",
  "She acts like a Wayanad don, but she's actually a teddy bear.",
  "Your diagnosis: Severely addicted to being adorable.",

  // Malayalam
  "വലിയ ഡോക്ടറാണ്, പക്ഷെ സ്വന്തം ഫോൺ എവിടെ വെച്ചെന്ന് പോലും ഓർമ്മയില്ല.",
  "വിശന്നാൽ പിന്നെ അർഷ വേറെ ലെവലാണ്, അടുത്ത് പോകാൻ പേടിക്കണം.",
  "ഇത്രയും നേരം ഉറങ്ങിയിട്ടും വീണ്ടും ഉറക്കം വരുന്നുണ്ടോ?",
  "നീ ഒരു വഴക്കാളിയാണ്, പക്ഷെ എന്റെ സ്വന്തം വഴക്കാളി.",
  "ഡോക്ടർ ആവുന്നതിന് മുൻപേ കൈപ്പട ഡോക്ടർമാരെ പോലെയായി, ആർക്കും വായിക്കാൻ പറ്റില്ല.",
  "ജാട കുറച്ചൊന്നുമല്ല, എന്നാലും എനിക്കിഷ്ട്ടമാണ്."
];

const FACTS = [
  // English
  "Fact: Arsha's smile can cure depression.",
  "Fun fact: She's surviving Uzbekistan winters just to save lives.",
  "Fun fact: She looks better in real life than any Snapchat filter.",
  "Fun fact: Future Dr. Arsha loading...",

  // Malayalam
  "സത്യം: അർഷയുടെ ഒരു നോട്ടം മതി ആരെയും വീഴ്ത്താൻ.",
  "ജൂൺ 30, 2002: ഒരു മാലാഖ ജനിച്ച ദിവസം.",
  "ദേഷ്യം വന്നാൽ പിന്നെ ഒരു കുഞ്ഞു രാക്ഷസിയാണ്.",
  "ഒരു രഹസ്യം പറയാം: അർഷ എന്ത് പറഞ്ഞാലും അതാണ് ശരി."
];

const FLIRTS = [
  // English
  "Can I check your heartbeat? Mine goes crazy around you.",
  "Stop being this cute, I can't focus.",
  "Are you a charger? Because I feel dead without you.",
  "Do you have a map? I keep getting lost in your eyes.",
  "Are you from Wayanad? Because you just took my breath away.",

  // Malayalam
  "എന്റെ ഹൃദയം മിടിക്കുന്നത് തന്നെ നിനക്ക് വേണ്ടിയാണ്.",
  "നിന്നെ കാണാൻ എന്ത് ഭംഗിയാണ് പെണ്ണേ.",
  "നിന്റെ ചുണ്ടിലെ ചിരി മായാതെ കാക്കാൻ ഞാൻ ഉണ്ടാകും.",
  "നമ്മൾ തമ്മിൽ നല്ലൊരു കണക്ഷൻ ഫീൽ ചെയ്യുന്നുണ്ട്.",
  "കണ്ണെടുക്കാൻ തോന്നുന്നില്ല നിന്നെ കണ്ടാൽ."
];

const LOVE_NOTE = `
Arsha, എന്റെ പ്രിയപ്പെട്ടവളേ,

From our first snap to meeting you in Kochi... 
every moment has been a blessing.

I know studying MBBS in Uzbekistan is hard,
but I am so incredibly proud of you.

This app is just a small reminder that:
I love you, I'm proud of you, and you're the best part of my life. ❤
എന്നും നിന്റെ സ്വന്തം...
`;

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase init error", error);
}

const appId = "daily-compliment-app";

// --- LOGIN COMPONENT ---
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Client-side Email Check
    if (email.toLowerCase().trim() !== "arsha@love.com") {
        setError("Sorry! This app is exclusively made for Arsha ❤");
        setLoading(false);
        return;
    }

    try {
      // 2. Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // Provide a helpful hint if it's the right email but wrong password
      if (err.code === 'auth/wrong-password') {
        setError("Incorrect password, my queen! Hint: 123456");
      } else if (err.code === 'auth/user-not-found') {
        setError("User setup required in Firebase Console.");
      } else {
        setError("Login failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-pink-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl w-full max-w-sm border border-rose-100">
        <div className="flex justify-center mb-6">
           <div className="bg-rose-100 p-4 rounded-full animate-bounce">
             <Lock className="w-8 h-8 text-rose-500" />
           </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-rose-900 mb-2">Arsha's Private Space</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">Please enter your secret key to enter.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full p-4 rounded-xl bg-rose-50 border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-700 placeholder-rose-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password"
              className="w-full p-4 rounded-xl bg-rose-50 border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-700 placeholder-rose-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-lg shadow-rose-200 transform transition-transform active:scale-95 flex justify-center gap-2"
          >
            {loading ? <Sparkles className="animate-spin" /> : <span className="flex items-center gap-2"><Key size={18}/> Unlock My Gift</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- CLOCK COMPONENT ---
const LoveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-lg shadow-rose-100 border border-rose-100 flex items-center gap-3">
        <Clock size={18} className="text-rose-400" />
        <span className="text-2xl font-bold text-rose-500 font-mono tracking-widest">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <Heart size={18} className="text-rose-500 fill-rose-500 animate-pulse" />
      </div>
      <p className="text-[10px] text-rose-400 mt-2 font-bold tracking-[0.2em] uppercase opacity-80">
        Loving you every second
      </p>
    </div>
  );
};

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-rose-100 to-pink-50 flex flex-col items-center justify-center z-50 animate-fade-out">
      <div className="animate-pulse">
        <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-xl" />
      </div>
      <h1 className="mt-8 text-3xl font-serif text-rose-900 text-center px-6 leading-relaxed">
        Hi {HER_NAME}... <br/>
        <span className="text-xl text-rose-600">My Everything... ❤</span>
      </h1>
      <p className="mt-6 text-sm text-rose-400 font-medium tracking-wider uppercase">Your daily dose of love begins now...</p>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-rose-100/50 ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary", className = "" }) => {
  const baseStyle = "w-full py-4 rounded-2xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-sm";
  const variants = {
    primary: "bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-rose-200/50",
    secondary: "bg-white text-rose-500 border-2 border-rose-100 hover:bg-rose-50",
    outline: "border border-rose-200 text-rose-400 text-sm py-2",
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // New loading state
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState("home"); 
  const [favorites, setFavorites] = useState([]);
  
  const [extraCompliment, setExtraCompliment] = useState(null);
  const [personalMsg, setPersonalMsg] = useState(null);
  const [funFact, setFunFact] = useState(null);

  // --- AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false); // Stop loading once we know if user is logged in or not
    });
    return () => unsubscribe();
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!user) return;

    const favsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'favorites');
    const q = query(favsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFavorites(favs);
    }, (error) => {
      console.error("Error fetching favorites:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // --- FUNCTIONS ---
  const getDailyCompliment = () => {
    // Uses the day of the month to pick a consistent daily message
    const today = new Date().getDate();
    return DAILY_COMPLIMENTS[today % DAILY_COMPLIMENTS.length];
  };

  const generateExtra = () => {
    const random = Math.floor(Math.random() * EXTRA_COMPLIMENTS.length);
    setExtraCompliment(EXTRA_COMPLIMENTS[random]);
    
    if (Math.random() > 0.7) {
      const pRandom = Math.floor(Math.random() * PERSONAL_MESSAGES.length);
      setPersonalMsg(PERSONAL_MESSAGES[pRandom]);
    } else {
      setPersonalMsg(null);
    }
    setFunFact(null);
  };

  const generateCategory = (categoryArray) => {
    const random = Math.floor(Math.random() * categoryArray.length);
    setFunFact(categoryArray[random]);
    setExtraCompliment(null); // Clear main extra to show category
    setPersonalMsg(null);
  };

  const toggleFavorite = async (text) => {
    if (!user) return;
    const favsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'favorites');
    const existing = favorites.find(f => f.text === text);
    
    if (existing) {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'favorites', existing.id));
    } else {
      await addDoc(favsRef, { text: text, savedAt: serverTimestamp() });
    }
  };

  const isFav = (text) => favorites.some(f => f.text === text);
  const handleLogout = () => signOut(auth);

  // --- RENDER LOGIC ---

  // 1. Show blank while checking login status
  if (authLoading) return <div className="min-h-screen bg-pink-50 flex items-center justify-center"><Heart className="animate-ping text-rose-400" /></div>;

  // 2. Show Login Screen if not logged in
  if (!user) return <LoginScreen />;

  // 3. Show Splash Screen after login
  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  // 4. Show Main App
  const renderContent = () => {
    switch (view) {
      case 'note':
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView('home')} className="p-2 bg-rose-100 rounded-full text-rose-600 hover:bg-rose-200 transition-colors">
                  <X size={20} />
                </button>
                <h2 className="text-2xl font-serif font-bold text-rose-900">Message from Him</h2>
             </div>
             <Card className="bg-gradient-to-br from-rose-50/50 to-white border-rose-100">
                <div className="flex justify-center mb-6">
                   <div className="bg-rose-100 p-4 rounded-full shadow-inner">
                     <MessageCircleHeart className="w-10 h-10 text-rose-500" />
                   </div>
                </div>
                <p className="text-gray-800 whitespace-pre-line text-center font-serif text-lg leading-loose italic">"{LOVE_NOTE}"</p>
                <div className="mt-8 text-right">
                  <p className="text-sm text-rose-500 font-bold tracking-widest uppercase">- {YOUR_NAME}</p>
                </div>
             </Card>
          </div>
        );

      case 'favorites':
        return (
          <div className="space-y-6 animate-fade-in pb-24">
             <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView('home')} className="p-2 bg-rose-100 rounded-full text-rose-600 hover:bg-rose-200 transition-colors">
                  <X size={20} />
                </button>
                <h2 className="text-2xl font-serif font-bold text-rose-900">My Collection</h2>
             </div>
             
             {favorites.length === 0 ? (
               <div className="text-center py-16 text-gray-400 flex flex-col items-center">
                 <Heart className="w-16 h-16 mb-4 text-gray-200 fill-gray-50" />
                 <p className="text-lg font-medium">No favorites saved yet!</p>
               </div>
             ) : (
               favorites.map((fav) => (
                 <Card key={fav.id} className="mb-4 relative overflow-hidden group">
                   <p className="text-gray-800 font-medium pr-10 leading-relaxed">"{fav.text}"</p>
                   <button onClick={() => toggleFavorite(fav.text)} className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 transition-colors p-2">
                     <Heart className="fill-rose-500 w-6 h-6" />
                   </button>
                 </Card>
               ))
             )}
          </div>
        );

      case 'home':
      default:
        return (
          <div className="space-y-8 pb-28">
             {/* Header */}
             <div className="flex justify-between items-end">
              <div>
                <h2 className="text-lg font-medium text-rose-400 tracking-wide uppercase">Hello My Sunshine,</h2>
                <h3 className="text-4xl font-serif font-bold text-rose-900 mt-1">My {HER_NAME} 💖</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  className="bg-white p-3 rounded-full shadow-[0_4px_12px_rgb(0,0,0,0.05)] border border-rose-50 cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => setView('note')}
                >
                  <MessageCircleHeart className="text-rose-400 w-7 h-7 group-hover:text-rose-500 transition-colors" />
                </button>
                <button 
                  className="bg-white p-3 rounded-full shadow-[0_4px_12px_rgb(0,0,0,0.05)] border border-rose-50 cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={handleLogout}
                >
                  <LogOut className="text-rose-400 w-7 h-7 group-hover:text-rose-500 transition-colors" />
                </button>
              </div>
            </div>

            <LoveClock />

            {/* Daily Card */}
            <section className="relative z-10">
              <div className="flex items-center gap-2 mb-3 ml-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Today's Special Message</span>
              </div>
              <Card className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-400 text-white border-none transform transition-all hover:-translate-y-1 shadow-rose-300/30 shadow-xl">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 text-white/10"><Heart size={120} fill="currentColor" /></div>
                <p className="text-2xl font-serif font-medium text-center leading-relaxed relative z-10 py-4">"{getDailyCompliment()}"</p>
                <div className="mt-6 flex justify-center relative z-10">
                   <button onClick={() => toggleFavorite(getDailyCompliment())} className="bg-white/20 hover:bg-white/30 transition-colors p-3 rounded-full backdrop-blur-md">
                     <Bookmark className={isFav(getDailyCompliment()) ? "fill-white text-white" : "text-white"} size={22} />
                   </button>
                </div>
              </Card>
            </section>

            {/* Personal Popups */}
            {personalMsg && (
              <div className="animate-bounce-in bg-white/60 backdrop-blur-md border-l-4 border-rose-400 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                 <div className="absolute -right-4 -bottom-4 text-rose-100/50"><MessageCircleHeart size={80} fill="currentColor" /></div>
                 <p className="text-rose-800 font-medium text-sm flex gap-2 items-center relative z-10"><MessageCircleHeart size={18} /> From {YOUR_NAME}:</p>
                 <p className="text-gray-800 mt-2 italic text-lg font-serif leading-relaxed relative z-10">"{personalMsg}"</p>
              </div>
            )}

            {/* Extra Compliments */}
            <section className="space-y-5">
              <div className="flex justify-between items-center ml-1"><span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Need more love?</span></div>
              {(extraCompliment || funFact) && (
                <div className="animate-fade-in relative z-10">
                  <Card className="bg-white/80 backdrop-blur-sm border-rose-100 text-center">
                    <div className="absolute -left-4 -top-4 text-rose-50"><Sparkles size={60} fill="currentColor" /></div>
                    <p className="text-xl text-gray-800 font-serif font-medium leading-relaxed relative z-10 py-2">{funFact ? funFact : `"${extraCompliment}"`}</p>
                    <div className="mt-5 flex justify-center relative z-10">
                       <button onClick={() => toggleFavorite(funFact || extraCompliment)} className="text-rose-300 hover:text-rose-500 transition-colors p-2 bg-rose-50 rounded-full">
                         <Heart className={isFav(funFact || extraCompliment) ? "fill-rose-500 text-rose-500" : ""} size={24} />
                       </button>
                    </div>
                  </Card>
                </div>
              )}
              <Button onClick={generateExtra} variant="primary" className="shadow-lg shadow-rose-200/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Heart className="fill-white w-6 h-6 animate-pulse relative z-10" /><span className="relative z-10">Tap for Extra Love</span>
              </Button>
            </section>

            {/* Categories */}
            <section>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-4 ml-1">Fun Categories</span>
              <div className="grid grid-cols-2 gap-4">
                 <Button variant="secondary" onClick={() => generateCategory(ROASTS)} className="text-sm py-3">🔥 Cute Roasts</Button>
                 <Button variant="secondary" onClick={() => generateCategory(FACTS)} className="text-sm py-3">📚 Her Facts</Button>
                 <Button variant="secondary" onClick={() => generateCategory(FLIRTS)} className="text-sm col-span-2 py-3 bg-gradient-to-r from-rose-50 to-pink-50 border-none text-rose-600">💋 Flirt Mode</Button>
              </div>
            </section>

            {/* Instagram Link */}
            <div className="flex justify-center mt-8 mb-4">
              <a href="https://www.instagram.com/arsha.a_?igsh=MTk1dHNtdDA1ZzljbA==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pink-400 hover:text-pink-600 transition-colors text-xs font-bold uppercase tracking-widest bg-white/50 px-4 py-2 rounded-full border border-pink-100 backdrop-blur-sm">
                <Instagram size={16} /> Follow the Queen
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fff0f5] font-sans text-gray-800 relative selection:bg-rose-200 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ec4899' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      <div className="max-w-md mx-auto min-h-screen shadow-2xl overflow-hidden relative backdrop-blur-sm bg-white/30">
        <div className="p-6 h-full overflow-y-auto custom-scrollbar relative z-10 pb-28">
          {renderContent()}
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-rose-100/50 py-2 px-8 flex justify-between items-end z-20 h-20 rounded-t-3xl shadow-[0_-4px_20px_rgb(0,0,0,0.03)]">
          <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 pb-3 transition-colors ${view === 'home' ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}>
            <Sparkles size={26} /><span className="text-[10px] font-bold tracking-wider uppercase">Today</span>
          </button>
          
          <div className="relative -top-5">
             <button onClick={generateExtra} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-5 rounded-full shadow-lg shadow-rose-300/50 hover:scale-105 transition-transform group relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
               <Heart className="fill-white w-7 h-7 relative z-10" />
             </button>
          </div>

          <button onClick={() => setView('favorites')} className={`flex flex-col items-center gap-1 pb-3 transition-colors ${view === 'favorites' ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}>
            <Star size={26} className={view === 'favorites' ? "fill-rose-500" : ""} /><span className="text-[10px] font-bold tracking-wider uppercase">Favs</span>
          </button>
        </div>
      </div>
    </div>
  );
}