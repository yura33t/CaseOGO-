
import React, { useState, useEffect } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { CaseOpening } from './components/CaseOpening';
import { CaseList } from './components/CaseList';
import { Inventory } from './components/Inventory';
import { PriceList } from './components/PriceList';
import { AdminPanel } from './components/AdminPanel';
import { PlayerSearch } from './components/PlayerSearch';
import { MobileNav } from './components/MobileNav';
import { Profile as ProfileType } from './types';

const SUPABASE_URL = 'https://cyeukowxnnxtvbpmikiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5ZXVrb3d4bm54dHZicG1pa2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTM1ODYsImV4cCI6MjA4NjY2OTU4Nn0.9HSQKMsrPm8Vps9vH6tl6SAMbeeWrG2-h-diHgfksHs';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [activeTab, setActiveTab] = useState<'store' | 'inventory' | 'prices' | 'search' | 'admin'>('store');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user && isMounted) {
          setUser(session.user);
          await fetchOrCreateProfile(session.user);
        }
      } catch (err) {
        console.error("Critical Session Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && isMounted) {
        setUser(session.user);
        await fetchOrCreateProfile(session.user);
      } else if (isMounted) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrCreateProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
      } else {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            username: currentUser.user_metadata?.username || 'player_' + currentUser.id.substring(0, 5),
            gcoins: 150
          })
          .select()
          .maybeSingle();
        
        if (createError) throw createError;
        if (newProfile) setProfile(newProfile);
      }
    } catch (err) {
      console.error("Profile handling error:", err);
    }
  };

  const refreshProfile = () => {
    if (user) fetchOrCreateProfile(user);
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setSelectedCase(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-[3px] border-white/5 border-t-white rounded-full animate-spin"></div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white animate-pulse">CaseOGO System</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-700 mt-2">Connecting to Secure Server...</span>
        </div>
      </div>
    );
  }
  
  if (!user) return <Auth onAuthSuccess={() => {}} />;

  const isAdmin = profile?.username === 'tester';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black pb-safe overflow-x-hidden">
      <Header 
        profile={profile} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onLogout={() => supabase.auth.signOut()}
      />
      
      <main className="flex-1 container mx-auto px-4 pt-6 pb-32 md:pb-12">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          {activeTab === 'store' && (
            selectedCase === 'shareworld' ? (
              <div className="space-y-6">
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="text-gray-600 hover:text-white flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-colors py-3 group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Cases
                </button>
                <CaseOpening profile={profile} onOpened={refreshProfile} />
              </div>
            ) : (
              <CaseList onSelectCase={(id) => setSelectedCase(id)} />
            )
          )}
          {activeTab === 'inventory' && profile && (
            <Inventory 
              profile={profile} 
              isOwnProfile={true} 
              onLogout={() => supabase.auth.signOut()} 
              onUpdateProfile={refreshProfile}
            />
          )}
          {activeTab === 'prices' && <PriceList />}
          {activeTab === 'search' && <PlayerSearch />}
          {activeTab === 'admin' && isAdmin ? (
            <AdminPanel onAction={refreshProfile} />
          ) : activeTab === 'admin' ? (
             <div className="p-20 text-center text-gray-800 font-black uppercase tracking-widest text-xs">Access Denied</div>
          ) : null}
        </div>
      </main>

      <MobileNav 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        isAdmin={isAdmin} 
      />
    </div>
  );
};

export default App;
