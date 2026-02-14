
import React, { useState, useEffect } from 'react';
import { supabase } from '../App';
import { Item } from '../types';
import { Icons } from './Icons';

interface AdminPanelProps {
  onAction: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onAction }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    rarity: 'common',
    custom_color: '#4b69ff',
    image: null as string | null
  });

  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState(1000);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const createItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.price <= 0) return;

    setLoading(true);
    const { error } = await supabase.from('items').insert({
      name: newItem.name,
      price: newItem.price,
      rarity: newItem.rarity,
      custom_color: newItem.custom_color,
      image_url: newItem.image
    });

    if (error) {
      alert("Ошибка при создании: " + error.message);
    } else {
      setNewItem({ name: '', price: 0, rarity: 'common', custom_color: '#4b69ff', image: null });
      fetchItems();
      onAction();
    }
    setLoading(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Удалить предмет из системы навсегда?")) return;
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) alert("Ошибка удаления: " + error.message);
    else fetchItems();
  };

  const grantCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: userProfile } = await supabase.from('profiles').select('*').ilike('username', targetUsername.trim()).maybeSingle();
      if (!userProfile) { alert("Игрок не найден"); return; }
      await supabase.from('profiles').update({ gcoins: userProfile.gcoins + amount }).eq('id', userProfile.id);
      alert(`Выдано ${amount} GC игроку ${userProfile.username}`);
      setTargetUsername('');
      onAction();
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <div className="bg-red-600 text-white px-4 py-1.5 rounded-xl font-black text-[10px] italic tracking-[0.2em] w-fit mb-3">ROOT_TERMINAL</div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Панель Управления</h2>
        </div>
        <div className="opacity-10 scale-150"><Icons.Admin /></div>
      </div>

      <section className="space-y-6">
        <h3 className="text-2xl font-black italic uppercase tracking-tighter ml-4">Новый Актив</h3>
        <div className="bg-[#080808] border border-white/5 p-10 rounded-[3rem] shadow-xl">
          <form onSubmit={createItem} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <input 
                type="text" 
                value={newItem.name} 
                onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none font-bold"
                placeholder="Название..."
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  value={newItem.price} 
                  onChange={e => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none text-yellow-500 font-black"
                  required
                />
                <select 
                  value={newItem.rarity}
                  onChange={e => setNewItem(prev => ({ ...prev, rarity: e.target.value }))}
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none font-bold appearance-none"
                >
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  value={newItem.custom_color} 
                  onChange={e => setNewItem(prev => ({ ...prev, custom_color: e.target.value }))}
                  className="h-14 w-20 bg-black border border-white/10 rounded-2xl p-1"
                />
                <input 
                  type="text" 
                  value={newItem.custom_color} 
                  onChange={e => setNewItem(prev => ({ ...prev, custom_color: e.target.value }))}
                  className="flex-1 bg-black border border-white/10 p-5 rounded-2xl outline-none"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="relative group h-[216px] border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden bg-black">
                {newItem.image ? (
                  <img src={newItem.image} className="w-full h-full object-contain p-4" />
                ) : (
                  <span className="text-[8px] font-black uppercase opacity-20">PNG/JPG 1:1</span>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-white text-black font-black py-6 rounded-[1.5rem] uppercase italic tracking-tighter shadow-2xl">
                Зарегистрировать Предмет
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-black italic uppercase tracking-tighter ml-4">Список Активов</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-[#080808] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
                  {item.image_url ? <img src={item.image_url} className="w-full h-full object-contain" /> : <Icons.Box />}
                </div>
                <div>
                  <div className="font-black text-sm uppercase italic">{item.name}</div>
                  <div className="text-[8px] font-black text-gray-600">{item.price} GC</div>
                </div>
              </div>
              <button onClick={() => deleteItem(item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 p-2 font-black text-[10px] uppercase">Удалить</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
