
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
      if (file.size > 800000) { 
        alert("Image too large (Max 800KB)");
        return;
      }
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
    try {
      const { error } = await supabase.from('items').insert({
        name: newItem.name,
        price: newItem.price,
        rarity: newItem.rarity,
        custom_color: newItem.custom_color,
        image_url: newItem.image
      });

      if (error) throw error;
      
      setNewItem({ name: '', price: 0, rarity: 'common', custom_color: '#4b69ff', image: null });
      fetchItems();
      onAction();
    } catch (err: any) {
      alert("Error creating item: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Permanently delete this item? All user copies will be destroyed.")) return;
    try {
      // First clear all inventories containing this item
      await supabase.from('inventory').delete().eq('item_id', id);
      // Then delete the item itself
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
      
      setItems(prev => prev.filter(i => i.id !== id));
      onAction();
    } catch (err: any) {
      alert("Delete Error: " + err.message);
    }
  };

  const grantCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim()) return;
    setLoading(true);
    try {
      const { data: userProfile } = await supabase.from('profiles').select('*').ilike('username', targetUsername.trim()).maybeSingle();
      if (!userProfile) { alert("Target player not found"); return; }
      
      const { error } = await supabase.from('profiles').update({ gcoins: userProfile.gcoins + amount }).eq('id', userProfile.id);
      if (error) throw error;
      
      alert(`Successfully issued ${amount} GC to ${userProfile.username}`);
      setTargetUsername('');
      onAction();
    } catch (err: any) {
      alert("System Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <div className="bg-red-600 text-white px-4 py-1.5 rounded-xl font-black text-[9px] italic tracking-[0.2em] w-fit mb-3">SYSTEM_ROOT</div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Control Center</h2>
        </div>
        <div className="opacity-10 scale-150 rotate-12"><Icons.Admin /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <h3 className="text-xl font-black italic uppercase tracking-tighter ml-4 flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-white"></span> Create Asset
          </h3>
          <div className="bg-[#080808] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
            <form onSubmit={createItem} className="space-y-6">
              <input 
                type="text" 
                value={newItem.name} 
                onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none font-bold text-white placeholder-gray-800"
                placeholder="Item Label..."
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
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none font-bold appearance-none text-white text-xs uppercase tracking-widest"
                >
                  <option value="common">Mil-Spec</option>
                  <option value="rare">Restricted</option>
                  <option value="epic">Classified</option>
                  <option value="legendary">Covert</option>
                </select>
              </div>
              
              <div className="relative group h-48 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center overflow-hidden bg-black transition-colors hover:border-white/20">
                {newItem.image ? (
                  <img src={newItem.image} className="w-full h-full object-contain p-4" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Icons.Box />
                    <span className="text-[7px] font-black uppercase tracking-widest">Select Image</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase italic tracking-tighter shadow-2xl hover:bg-gray-200 transition-all disabled:opacity-50">
                Register New Asset
              </button>
            </form>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-black italic uppercase tracking-tighter ml-4 flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Financial Grant
          </h3>
          <div className="bg-[#080808] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
            <form onSubmit={grantCoins} className="space-y-6">
              <div>
                <label className="text-[8px] font-black uppercase text-gray-700 mb-2 ml-2 tracking-widest block">Recipient Username</label>
                <input 
                  type="text" 
                  placeholder="tester"
                  value={targetUsername}
                  onChange={e => setTargetUsername(e.target.value)}
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none text-white placeholder-gray-900"
                  required
                />
              </div>
              <div>
                <label className="text-[8px] font-black uppercase text-gray-700 mb-2 ml-2 tracking-widest block">GC Amount</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none text-yellow-500 font-black"
                  required
                />
              </div>
              <button className="w-full bg-yellow-500 text-black font-black py-5 rounded-2xl uppercase italic tracking-tighter shadow-2xl hover:bg-yellow-400 transition-all h-[66px]">
                Issue Currency
              </button>
            </form>
          </div>
        </section>
      </div>

      <section className="space-y-8">
        <h3 className="text-xl font-black italic uppercase tracking-tighter ml-4 flex items-center gap-3">
           <span className="w-2 h-2 rounded-full bg-red-600"></span> Asset Registry
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-[#080808] border border-white/5 p-5 rounded-3xl flex flex-col group hover:border-white/10 transition-all relative">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-inner"
                  style={{ background: item.custom_color ? `linear-gradient(135deg, ${item.custom_color}15 0%, #000 100%)` : '' }}
                >
                  {item.image_url ? <img src={item.image_url} className="w-full h-full object-contain" /> : <Icons.Box />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs uppercase italic text-white truncate">{item.name}</div>
                  <div className="text-[7px] font-black text-gray-700 tracking-widest uppercase">{item.rarity}</div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                <span className="text-yellow-500 font-black text-xs italic">{item.price} GC</span>
                <button 
                  onClick={() => deleteItem(item.id)} 
                  className="text-red-600 p-2 font-black text-[8px] uppercase tracking-widest hover:bg-red-600/10 rounded-lg transition-all"
                >
                  Terminate
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-900 font-black uppercase tracking-[0.5em] text-[10px]">Registry Empty</div>
          )}
        </div>
      </section>
    </div>
  );
};
