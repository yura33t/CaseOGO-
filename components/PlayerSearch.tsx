
import React, { useState, useEffect } from 'react';
import { supabase } from '../App';
import { Item, Profile } from '../types';
import { Inventory } from './Inventory';

export const PlayerSearch: React.FC = () => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [foundProfile, setFoundProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // Для перевода средств
  const [transferAmount, setTransferAmount] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setCurrentUser(data);
    }
  };

  useEffect(() => {
    if (search.length >= 1) {
      const fetchSuggestions = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', `${search}%`)
          .limit(5);
        if (data) setSuggestions(data);
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [search]);

  const selectUser = (profile: Profile) => {
    setFoundProfile(profile);
    setSuggestions([]);
    setSearch(profile.username);
  };

  const handleTransfer = async () => {
    if (!currentUser || !foundProfile || transferAmount <= 0) return;
    if (currentUser.gcoins < transferAmount) {
      alert("Недостаточно средств!");
      return;
    }

    setIsTransferring(true);
    try {
      // Снимаем у отправителя
      await supabase.from('profiles').update({ gcoins: currentUser.gcoins - transferAmount }).eq('id', currentUser.id);
      // Добавляем получателю
      await supabase.from('profiles').update({ gcoins: foundProfile.gcoins + transferAmount }).eq('id', foundProfile.id);
      
      alert(`Успешно переведено ${transferAmount} GC пользователю ${foundProfile.username}`);
      setTransferAmount(0);
      fetchCurrentUser();
      // Обновляем данные найденного профиля
      const { data } = await supabase.from('profiles').select('*').eq('id', foundProfile.id).single();
      if (data) setFoundProfile(data);
    } catch (err) {
      alert("Ошибка транзакции");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col items-center">
        <h2 className="text-4xl font-black mb-8 italic uppercase tracking-tighter">Global Registry</h2>
        <div className="relative w-full max-w-lg">
          <div className="flex bg-[#0a0a0a] p-2 rounded-2xl border border-white/5 shadow-2xl">
            <input 
              type="text" 
              placeholder="Введите имя игрока..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent px-4 py-3 rounded-xl focus:outline-none font-bold text-sm"
            />
          </div>
          
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
              {suggestions.map(p => (
                <button 
                  key={p.id}
                  onClick={() => selectUser(p)}
                  className="w-full p-4 text-left hover:bg-white/5 flex items-center justify-between group transition-colors"
                >
                  <span className="font-bold text-sm group-hover:text-white text-gray-400">{p.username}</span>
                  <span className="text-[10px] text-gray-700 font-black uppercase">Профиль игрока</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {foundProfile && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Панель взаимодействия */}
          <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xl border border-white/10">
                   {foundProfile.username[0].toUpperCase()}
                </div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter">{foundProfile.username}</h3>
                   <span className="text-yellow-500 font-black text-xs uppercase tracking-widest">{foundProfile.gcoins} GC</span>
                </div>
             </div>

             <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5">
                <input 
                  type="number" 
                  value={transferAmount}
                  onChange={e => setTransferAmount(Number(e.target.value))}
                  className="bg-black border border-white/10 px-4 py-2 rounded-xl w-32 font-black text-yellow-500 text-center outline-none"
                  placeholder="Сумма..."
                />
                <button 
                  onClick={handleTransfer}
                  disabled={isTransferring || transferAmount <= 0}
                  className="bg-white text-black font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  {isTransferring ? 'Перевод...' : 'Передать GC'}
                </button>
             </div>
          </div>

          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 px-4">Инвентарь игрока (только просмотр)</h4>
             <Inventory profile={foundProfile} isOwnProfile={false} />
          </div>
        </div>
      )}
    </div>
  );
};
