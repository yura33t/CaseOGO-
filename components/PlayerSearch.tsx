
import React, { useState, useEffect } from 'react';
import { supabase } from '../App';
import { Item, Profile } from '../types';
import { Inventory } from './Inventory';

export const PlayerSearch: React.FC = () => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [foundProfile, setFoundProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  const [transferAmount, setTransferAmount] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) setCurrentUser(data);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.trim().length >= 1) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', `%${search}%`)
          .neq('id', currentUser?.id || '')
          .limit(5);
        if (data) setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [search, currentUser]);

  const selectUser = (profile: Profile) => {
    setFoundProfile(profile);
    setSuggestions([]);
    setSearch('');
  };

  const handleTransfer = async () => {
    if (!currentUser || !foundProfile || transferAmount <= 0) return;
    
    if (currentUser.gcoins < transferAmount) {
      alert("Insufficient GCoins!");
      return;
    }

    if (!confirm(`Confirm transfer of ${transferAmount} GC to ${foundProfile.username}?`)) return;

    setIsTransferring(true);
    try {
      // Send transfer (Atomic updates)
      const { error: senderError } = await supabase
        .from('profiles')
        .update({ gcoins: currentUser.gcoins - transferAmount })
        .eq('id', currentUser.id);

      if (senderError) throw senderError;

      const { error: receiverError } = await supabase
        .from('profiles')
        .update({ gcoins: foundProfile.gcoins + transferAmount })
        .eq('id', foundProfile.id);

      if (receiverError) throw receiverError;
      
      alert(`Transfer of ${transferAmount} GC successful!`);
      setTransferAmount(0);
      
      await fetchCurrentUser();
      const { data: updatedTarget } = await supabase.from('profiles').select('*').eq('id', foundProfile.id).maybeSingle();
      if (updatedTarget) setFoundProfile(updatedTarget);
      
    } catch (err: any) {
      alert("Transfer failed: " + err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col items-center">
        <header className="text-center mb-8">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Global Database</h2>
          <p className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em] mt-2">Search Players by Username</p>
        </header>

        <div className="relative w-full max-w-lg">
          <div className="flex bg-[#0a0a0a] p-2 rounded-2xl border border-white/5 shadow-2xl focus-within:border-white/20 transition-all">
            <div className="flex items-center px-4 opacity-20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Start typing username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent px-2 py-4 rounded-xl focus:outline-none font-bold text-sm text-white placeholder-gray-800"
            />
          </div>
          
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
              {suggestions.map(p => (
                <button 
                  key={p.id}
                  onClick={() => selectUser(p)}
                  className="w-full p-5 text-left hover:bg-white/5 flex items-center justify-between group transition-colors border-b border-white/5 last:border-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[10px] text-gray-600">{p.username[0].toUpperCase()}</div>
                    <span className="font-bold text-sm text-gray-400 group-hover:text-white transition-colors">{p.username}</span>
                  </div>
                  <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100">View Data</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {foundProfile ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
             
             <div className="flex items-center gap-6 relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center font-black text-4xl border border-white/10 text-white shadow-2xl">
                   {foundProfile.username[0].toUpperCase()}
                </div>
                <div>
                   <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">{foundProfile.username}</h3>
                   <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                      <span className="text-yellow-500 font-black text-sm uppercase tracking-widest">{foundProfile.gcoins.toLocaleString()} <span className="text-[10px] opacity-40">GC</span></span>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-4 bg-black/60 p-5 rounded-[2.5rem] border border-white/5 shadow-inner relative z-10">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-gray-700 mb-1.5 ml-3 tracking-[0.2em]">Amount to Transfer</span>
                  <input 
                    type="number" 
                    value={transferAmount}
                    onChange={e => setTransferAmount(Math.max(0, Number(e.target.value)))}
                    className="bg-black border border-white/10 px-6 py-4 rounded-2xl w-36 font-black text-yellow-500 text-center outline-none focus:border-yellow-500/30 transition-all text-lg"
                    placeholder="0"
                  />
                </div>
                <button 
                  onClick={handleTransfer}
                  disabled={isTransferring || transferAmount <= 0}
                  className="bg-white text-black font-black px-10 py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-yellow-500 transition-all disabled:opacity-30 active:scale-95 shadow-xl h-[68px] self-end"
                >
                  {isTransferring ? 'Processing...' : 'Send GCoins'}
                </button>
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-6 px-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700 whitespace-nowrap italic">Asset Collection</h4>
                <div className="h-[1px] flex-1 bg-white/5"></div>
             </div>
             <Inventory profile={foundProfile} isOwnProfile={false} />
          </div>
        </div>
      ) : search.length > 0 && suggestions.length === 0 && (
        <div className="py-20 text-center text-gray-800 font-black uppercase tracking-widest text-[10px] bg-white/[0.01] rounded-[3rem] border border-white/[0.02]">
           User Terminal Not Found
        </div>
      )}
    </div>
  );
};
