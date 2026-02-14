
import React, { useState, useEffect } from 'react';
import { supabase } from '../App';
import { Item } from '../types';
import { Icons } from './Icons';

export const PriceList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('items').select('*').order('price', { ascending: false });
    if (data) setItems(data as Item[]);
    setLoading(false);
  };

  const getRarityStyle = (item: Item) => {
    if (item.custom_color) return { background: `linear-gradient(180deg, ${item.custom_color} 0%, #1a1a1a 100%)` };
    return {};
  };

  const ItemIcon = ({ item }: { item: Item }) => {
    const content = (() => {
      if (item.image_url) return <img src={item.image_url} className="w-8 h-8 object-contain" />;
      switch(item.name) {
        case 'Soda': case 'Nesergey': return <Icons.Bottle />;
        case 'Chill': return <Icons.Cube />;
        case 'Epic': return <Icons.Flame />;
        case 'Akashi': return <Icons.Sword />;
        case 'Twink Expa': return <Icons.Star />;
        case 'Amnesia': return <Icons.Amnesia />;
        default: return <Icons.Box />;
      }
    })();
    return (
      <div 
        className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-lg text-white ${item.name === 'Amnesia' ? 'cs2-gradient-legendary-alt' : (!item.custom_color ? `cs2-gradient-${item.rarity}` : '')}`}
        style={getRarityStyle(item)}
      >
        {content}
      </div>
    );
  };

  if (loading) return <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-1">
      <header className="mb-10">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">Рыночный Индекс</h2>
        <div className="h-0.5 w-12 bg-white mt-2"></div>
      </header>

      <div className="bg-[#050505] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="p-8 text-[10px] font-black uppercase text-gray-500 tracking-widest">Актив</th>
                <th className="p-8 text-[10px] font-black uppercase text-gray-500 tracking-widest hidden sm:table-cell">Классификация</th>
                <th className="p-8 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                  <td className="p-8 flex items-center gap-6">
                    <ItemIcon item={item} />
                    <span className="font-black text-base uppercase tracking-tight italic group-hover:text-white transition-colors">{item.name}</span>
                  </td>
                  <td className="p-8 hidden sm:table-cell">
                    <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border border-white/10 bg-black tracking-[0.2em] opacity-60`}>
                      {item.rarity.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-yellow-500 font-black text-2xl tracking-tighter italic">{item.price.toLocaleString()}</span>
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Gcoins</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
