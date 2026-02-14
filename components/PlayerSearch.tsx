
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
          .neq('id', currentUser?.id || '') // Не показываем себя в поиске
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
      alert("У вас недостаточно средств!");
      return;
    }

    if (!confirm(`Вы уверены, что хотите передать ${transferAmount} GC игроку ${foundProfile.username}?`)) return;

    setIsTransferring(true);
    try {
      // 1. Уменьшаем баланс отправителя
      const { error: error1 } = await supabase
        .from('profiles')
        .update({ gcoins: currentUser.gcoins - transferAmount })
        .eq('id', currentUser.id);

      if (error1) throw error1;

      // 2. Увеличиваем баланс получателя
      const { error: error2 } = await supabase
        .from('profiles')
        .update({ gcoins: foundProfile.gcoins + transferAmount })
        .eq('id', foundProfile.id);

      if (error2) throw error2;
      
      alert(`Успешно переведено ${transferAmount} GC!`);
      setTransferAmount(0);
      
      // Обновляем локальные данные
      await fetchCurrentUser();
      const { data: updatedTarget } = await supabase.from('profiles').select('*').eq('id', foundProfile.id).single();
      if (updatedTarget) setFoundProfile(updatedTarget);
      
    } catch (err: any) {
      alert("Ошибка транзакции: " + err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col items-center">
        <header className="text-center mb-8">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Глобальный Поиск</h2>
          <p className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em] mt-2">База данных ShareWorld</p>
        </header>

        <div className="relative w-full max-w-lg">
          <div className="flex bg-[#0a0a0a] p-2 rounded-2xl border border-white/5 shadow-2xl focus-within:border-white/20 transition-all">
            <div className="flex items-center px-4 opacity-30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Введите никнейм игрока..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent px-2 py-4 rounded-xl focus:outline-none font-bold text-sm text-white"
            />
          </div>
          
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              {suggestions.map(p => (
                <button 
                  key={p.id}
                  onClick={() => selectUser(p)}
                  className="w-full p-5 text-left hover:bg-white/5 flex items-center justify-between group transition-colors border-b border-white/5 last:border-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[10px] text-gray-500">{p.username[0].toUpperCase()}</div>
                    <span className="font-bold text-sm text-gray-300 group-hover:text-white">{p.username}</span>
                  </div>
                  <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Посмотреть профиль</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {foundProfile ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
             <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center font-black text-3xl border border-white/10 text-white shadow-inner">
                   {foundProfile.username[0].toUpperCase()}
                </div>
                <div>
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{foundProfile.username}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-yellow-500 font-black text-xs uppercase tracking-widest">{foundProfile.gcoins.toLocaleString()} GC</span>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-4 bg-black/60 p-5 rounded-[2rem] border border-white/5 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-gray-600 mb-1 ml-2 tracking-widest">Сумма передачи</span>
                  <input 
                    type="number" 
                    value={transferAmount}
                    onChange={e => setTransferAmount(Math.max(0, Number(e.target.value)))}
                    className="bg-black border border-white/10 px-5 py-3 rounded-xl w-32 font-black text-yellow-500 text-center outline-none focus:border-yellow-500/50 transition-colors"
                    placeholder="0"
                  />
                </div>
                <button 
                  onClick={handleTransfer}
                  disabled={isTransferring || transferAmount <= 0}
                  className="bg-white text-black font-black px-8 py-4 rounded-xl text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all disabled:opacity-50 active:scale-95 shadow-xl h-[58px] self-end"
                >
                  {isTransferring ? 'Отправка...' : 'Передать GC'}
                </button>
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-4 px-4">
                <div className="h-[1px] flex-1 bg-white/5"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Коллекция игрока</h4>
                <div className="h-[1px] flex-1 bg-white/5"></div>
             </div>
             <Inventory profile={foundProfile} isOwnProfile={false} />
          </div>
        </div>
      ) : search.length === 0 ? (
        <div className="py-40 flex flex-col items-center opacity-10">
           <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
           <p className="mt-6 text-[10px] font-black uppercase tracking-[0.5em]">Начните вводить имя</p>
        </div>
      ) : suggestions.length === 0 && (
        <div className="py-20 text-center text-gray-700 font-black uppercase tracking-widest text-xs">
           Игрок с таким именем не найден
        </div>
      )}
    </div>
  );
};
