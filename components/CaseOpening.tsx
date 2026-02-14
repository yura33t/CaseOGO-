
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../App';
import { Item, Profile } from '../types';
import { Icons } from './Icons';

interface CaseOpeningProps {
  profile: Profile | null;
  onOpened: () => void;
}

const CASE_PRICE = 150;
const ITEM_WIDTH = 200;
const TAPE_LENGTH = 80;

export const CaseOpening: React.FC<CaseOpeningProps> = ({ profile, onOpened }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [winningItem, setWinningItem] = useState<Item | null>(null);
  const [tape, setTape] = useState<Item[]>([]);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const ItemDisplay = ({ item, size = "w-16 h-16" }: { item: Item, size?: string }) => {
    if (item.image_url) {
      return <img src={item.image_url} className={`${size} object-contain drop-shadow-2xl`} alt={item.name} />;
    }
    
    const iconSize = size.replace('w-16 h-16', 'w-12 h-12').replace('w-40 h-40', 'w-32 h-32');
    switch(item.name) {
      case 'Soda': case 'Nesergey': return <div className={iconSize}><Icons.Bottle /></div>;
      case 'Chill': return <div className={iconSize}><Icons.Cube /></div>;
      case 'Epic': return <div className={iconSize}><Icons.Flame /></div>;
      case 'Akashi': return <div className={iconSize}><Icons.Sword /></div>;
      case 'Twink Expa': return <div className={iconSize}><Icons.Star /></div>;
      case 'Amnesia': return <div className={iconSize}><Icons.Amnesia /></div>;
      default: return <div className={iconSize}><Icons.Box /></div>;
    }
  };

  const fetchItems = async () => {
    const { data } = await supabase.from('items').select('*');
    if (data) {
      setItems(data as Item[]);
    }
  };

  const getRarityWeight = (rarity: string) => {
    switch(rarity) {
      case 'common': return 80;
      case 'rare': return 15;
      case 'epic': return 4;
      case 'legendary': return 1;
      default: return 80;
    }
  };

  const getRandomItem = (availableItems: Item[]) => {
    const totalWeight = availableItems.reduce((acc, item) => acc + getRarityWeight(item.rarity), 0);
    let random = Math.random() * totalWeight;
    for (const item of availableItems) {
      const weight = getRarityWeight(item.rarity);
      if (random < weight) return item;
      random -= weight;
    }
    return availableItems[0];
  };

  const getRarityStyle = (item: Item) => {
    if (item.custom_color) {
      return { background: `linear-gradient(180deg, ${item.custom_color} 0%, #1a1a1a 100%)` };
    }
    return undefined;
  };

  const startOpening = async () => {
    if (!profile || profile.gcoins < CASE_PRICE || isOpening) {
      if (profile && profile.gcoins < CASE_PRICE) alert("Недостаточно Gcoins!");
      return;
    }

    setIsOpening(true);
    setWinningItem(null);

    const newTape = Array.from({ length: TAPE_LENGTH }).map(() => getRandomItem(items));
    const winnerIndex = TAPE_LENGTH - 5;
    const winner = newTape[winnerIndex];
    setTape(newTape);
    setTranslateX(0);
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ gcoins: profile.gcoins - CASE_PRICE })
      .eq('id', profile.id);

    if (profileError) {
      setIsOpening(false);
      return;
    }

    await supabase.from('inventory').insert({ user_id: profile.id, item_id: winner.id });

    setTimeout(() => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const targetPos = (winnerIndex * ITEM_WIDTH) - (containerWidth / 2) + (ITEM_WIDTH / 2) + (Math.random() * 80 - 40);
      setTranslateX(-targetPos);

      setTimeout(() => {
        setWinningItem(winner);
        setIsOpening(false);
        onOpened();
      }, 7500);
    }, 50);
  };

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-1 italic">ShareWorld</h2>
        <div className="flex items-center justify-center gap-4">
           <span className="h-[1px] w-8 bg-white/10"></span>
           <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[9px]">{CASE_PRICE} GCOINS</p>
           <span className="h-[1px] w-8 bg-white/10"></span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden h-72 bg-[#050505] border-y border-white/5 shadow-inner" ref={containerRef}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[2px] bg-yellow-500/50 z-20 shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
        <div className="absolute top-0 left-0 w-24 md:w-48 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-24 md:w-48 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
        
        <div 
          className="flex transition-transform duration-[7500ms] ease-[cubic-bezier(0.12,0,0.02,1)] h-full"
          style={{ transform: `translateX(${translateX}px)`, width: `${TAPE_LENGTH * ITEM_WIDTH}px` }}
        >
          {tape.map((item, i) => (
            <div 
              key={i} 
              className={`flex-shrink-0 w-[200px] h-full border-r border-black/20 p-6 flex flex-col items-center justify-center ${item.name === 'Amnesia' ? 'cs2-gradient-legendary-alt' : (!item.custom_color ? `cs2-gradient-${item.rarity}` : '')} relative group`}
              style={getRarityStyle(item)}
            >
              <div className="relative z-10 transform transition-transform group-hover:scale-105">
                <ItemDisplay item={item} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={startOpening}
        disabled={isOpening || items.length === 0}
        className="relative group disabled:opacity-50"
      >
        <div className="absolute -inset-4 bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors rounded-full opacity-0 group-hover:opacity-100"></div>
        <div className="relative bg-white text-black font-black text-lg px-20 py-5 rounded-2xl uppercase italic tracking-tighter transition-all active:scale-95 shadow-2xl">
          {isOpening ? 'Открытие...' : 'Открыть контейнер'}
        </div>
      </button>

      {/* Список предметов внутри кейса */}
      <div className="w-full bg-[#080808] border border-white/5 rounded-[3rem] p-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-8 border-b border-white/5 pb-4">Возможное содержимое</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
          {items.map(item => (
            <div key={item.id} className="group relative flex flex-col items-center">
              <div 
                className={`w-full aspect-square rounded-2xl flex items-center justify-center border border-white/5 ${item.name === 'Amnesia' ? 'cs2-gradient-legendary-alt' : (!item.custom_color ? `cs2-gradient-${item.rarity}` : '')} transition-transform group-hover:scale-105`}
                style={getRarityStyle(item)}
              >
                <ItemDisplay item={item} size="w-10 h-10" />
              </div>
              <span className="mt-3 text-[8px] font-black uppercase text-gray-500 tracking-tight text-center truncate w-full">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {winningItem && !isOpening && (
        <div className="fixed inset-0 bg-black/98 flex flex-col items-center justify-center z-[100] animate-in fade-in zoom-in duration-500 backdrop-blur-md p-6 text-center">
           <div 
            className={`relative p-12 md:p-20 rounded-[4rem] ${winningItem.name === 'Amnesia' ? 'cs2-gradient-legendary-alt' : (!winningItem.custom_color ? `cs2-gradient-${winningItem.rarity}` : '')} border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] max-w-lg w-full`}
            style={getRarityStyle(winningItem)}
           >
              <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-12 transform animate-bounce">
                    <ItemDisplay item={winningItem} size="w-40 h-40" />
                  </div>
                  <h3 className="text-5xl font-black mb-1 italic uppercase tracking-tighter">{winningItem.name}</h3>
                  <span className="text-[12px] font-black uppercase tracking-[0.5em] text-white/30 mb-8">{winningItem.rarity}</span>
                  <div className="px-10 py-4 bg-black/40 rounded-3xl border border-white/5 shadow-2xl">
                    <span className="text-yellow-500 font-black text-3xl italic">{winningItem.price} GC</span>
                  </div>
              </div>
           </div>
           <button onClick={() => setWinningItem(null)} className="mt-16 text-white/40 hover:text-white font-black text-xs uppercase tracking-[0.5em] transition-colors">Нажмите, чтобы забрать</button>
        </div>
      )}
    </div>
  );
};
