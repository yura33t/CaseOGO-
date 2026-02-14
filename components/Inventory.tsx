
import React, { useState, useEffect } from 'react';
import { supabase } from '../App';
import { InventoryItem, Profile, Item } from '../types';
import { Icons } from './Icons';

interface InventoryProps {
  profile: Profile;
  isOwnProfile?: boolean;
  onLogout?: () => void;
  onUpdateProfile?: () => void;
}

export const Inventory: React.FC<InventoryProps> = ({ profile, isOwnProfile, onLogout, onUpdateProfile }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellingId, setSellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, [profile.id]);

  const fetchInventory = async () => {
    const { data } = await supabase
      .from('inventory')
      .select(`id, obtained_at, item:item_id (*)`)
      .eq('user_id', profile.id)
      .order('obtained_at', { ascending: false });
    
    if (data) setItems(data as any[]);
    setLoading(false);
  };

  const sellItem = async (inventoryId: string, price: number) => {
    if (!isOwnProfile) return;
    setSellingId(inventoryId);
    try {
      await supabase.from('inventory').delete().eq('id', inventoryId);
      await supabase.from('profiles').update({ gcoins: profile.gcoins + price }).eq('id', profile.id);
      setItems(prev => prev.filter(i => i.id !== inventoryId));
      if (onUpdateProfile) onUpdateProfile();
    } catch (err) {
      alert("Ошибка при продаже.");
    } finally {
      setSellingId(null);
    }
  };

  const ItemDisplay = ({ item }: { item: Item }) => {
    const size = "w-10 h-10 md:w-12 md:h-12";
    if (item.image_url) {
      return <img src={item.image_url} className={`${size} object-contain`} alt={item.name} />;
    }
    switch(item.name) {
      case 'Soda': case 'Nesergey': return <div className={size}><Icons.Bottle /></div>;
      case 'Chill': return <div className={size}><Icons.Cube /></div>;
      case 'Epic': return <div className={size}><Icons.Flame /></div>;
      case 'Akashi': return <div className={size}><Icons.Sword /></div>;
      case 'Twink Expa': return <div className={size}><Icons.Star /></div>;
      case 'Amnesia': return <div className={size}><Icons.Amnesia /></div>;
      default: return <div className={size}><Icons.Box /></div>;
    }
  };

  const getRarityStyle = (item: Item) => {
    if (item.custom_color) return { background: `linear-gradient(180deg, ${item.custom_color} 0%, #1a1a1a 100%)` };
    return {};
  };

  if (loading) return <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {isOwnProfile && (
        <div className="bg-[#080808] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="h-40 bg-gradient-to-r from-gray-900 via-[#111] to-gray-900 border-b border-white/5 relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>
          <div className="px-6 md:px-12 pb-10 -mt-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left">
              <div className="w-40 h-40 rounded-[2.5rem] bg-black border-[8px] border-[#080808] flex items-center justify-center text-5xl font-black text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                 <span className="relative z-10">{profile.username[0].toUpperCase()}</span>
              </div>
              <div className="pb-2">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">{profile.username}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mt-2 italic">Активированный пользователь</p>
              </div>
            </div>
            <button onClick={onLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
              Выйти из системы
            </button>
          </div>
          <div className="grid grid-cols-2 border-t border-white/5 bg-white/[0.01]">
            <div className="p-8 text-center border-r border-white/5">
              <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest block mb-1">Баланс</span>
              <span className="text-2xl font-black text-yellow-500 italic">{profile.gcoins.toLocaleString()} GC</span>
            </div>
            <div className="p-8 text-center">
              <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest block mb-1">Предметы</span>
              <span className="text-2xl font-black italic">{items.length}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {items.map((inv) => (
          <div 
            key={inv.id} 
            className={`p-6 rounded-[2rem] border border-white/5 ${inv.item.name === 'Amnesia' ? 'cs2-gradient-legendary-alt' : (!inv.item.custom_color ? `cs2-gradient-${inv.item.rarity}` : '')} hover:border-white/20 transition-all group relative overflow-hidden flex flex-col items-center shadow-xl duration-300`}
            style={getRarityStyle(inv.item)}
          >
             <div className="aspect-square w-full bg-white/5 rounded-2xl flex items-center justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-700">
               <ItemDisplay item={inv.item} />
             </div>
             <div className="relative z-10 mt-6 w-full text-center">
               <div className="text-[10px] font-black uppercase truncate mb-1 text-white/90 italic">{inv.item.name}</div>
               <div className="text-[8px] font-black text-white/30 tracking-widest uppercase">{inv.item.rarity}</div>
             </div>
             {isOwnProfile && (
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-[2px]">
                  <button onClick={() => sellItem(inv.id, inv.item.price)} className="bg-white text-black font-black text-[9px] px-5 py-2 rounded-full uppercase tracking-widest hover:bg-yellow-500 transition-colors">
                    Продать: {inv.item.price}
                  </button>
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};
