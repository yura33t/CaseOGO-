
import React from 'react';
import { Profile } from '../types';

interface HeaderProps {
  profile: Profile | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, activeTab, setActiveTab, onLogout }) => {
  const isAdmin = profile?.username === 'tester';

  return (
    <header className="bg-black/90 border-b border-white/5 sticky top-0 z-50 backdrop-blur-2xl">
      <div className="container mx-auto px-4">
        <div className="h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 
              className="text-xl md:text-2xl font-black italic tracking-tighter cursor-pointer select-none group" 
              onClick={() => setActiveTab('store')}
            >
              CASE<span className="text-white group-hover:text-gray-400 transition-colors">OGO</span>
            </h1>
            
            <nav className="hidden md:flex items-center h-20">
              <NavTab active={activeTab === 'store'} onClick={() => setActiveTab('store')}>Store</NavTab>
              <NavTab active={activeTab === 'prices'} onClick={() => setActiveTab('prices')}>Market</NavTab>
              <NavTab active={activeTab === 'search'} onClick={() => setActiveTab('search')}>Players</NavTab>
              {isAdmin && (
                <NavTab active={activeTab === 'admin'} onClick={() => setActiveTab('admin')}>
                   <span className="text-red-500">Admin</span>
                </NavTab>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            {profile && (
              <div className="flex flex-col items-end md:border-r border-white/10 md:pr-8">
                <span className="text-[8px] md:text-[9px] text-gray-600 font-black uppercase tracking-[0.3em]">Capital</span>
                <span className="text-yellow-500 font-black text-sm md:text-xl leading-none mt-1">
                  {profile.gcoins.toLocaleString()} <span className="text-[9px] opacity-40">GC</span>
                </span>
              </div>
            )}
            
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab('inventory')}
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-black text-xs uppercase tracking-tight group-hover:text-gray-300 transition-colors">{profile?.username}</span>
                <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest mt-0.5 group-hover:text-white transition-colors">View Profile</span>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all shadow-xl">
                <span className="text-xs md:text-sm font-black text-gray-400 group-hover:text-white transform transition-transform group-hover:scale-110">
                  {profile?.username?.[0].toUpperCase() || '?'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const NavTab: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button 
    onClick={onClick}
    className={`h-full px-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
      active ? 'text-white bg-white/[0.03]' : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    {children}
    {active && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white"></div>}
  </button>
);
