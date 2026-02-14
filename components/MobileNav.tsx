
import React from 'react';
import { Icons } from './Icons';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isAdmin: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, isAdmin }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-2xl border-t border-white/5 px-4 pb-[env(safe-area-inset-bottom,16px)] z-50">
      <div className="flex items-center justify-around h-16">
        <MobileNavItem 
          active={activeTab === 'store'} 
          onClick={() => setActiveTab('store')}
          icon={<Icons.Store />}
          label="Store"
        />
        <MobileNavItem 
          active={activeTab === 'prices'} 
          onClick={() => setActiveTab('prices')}
          icon={<Icons.Market />}
          label="Market"
        />
        <MobileNavItem 
          active={activeTab === 'search'} 
          onClick={() => setActiveTab('search')}
          icon={<Icons.Search />}
          label="Search"
        />
        <MobileNavItem 
          active={activeTab === 'inventory'} 
          onClick={() => setActiveTab('inventory')}
          icon={<Icons.Inventory />}
          label="Items"
        />
        {isAdmin && (
          <MobileNavItem 
            active={activeTab === 'admin'} 
            onClick={() => setActiveTab('admin')}
            icon={<Icons.Admin />}
            label="Admin"
          />
        )}
      </div>
    </nav>
  );
};

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all relative ${
      active ? 'text-white' : 'text-gray-600'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110 -translate-y-1' : 'scale-90'}`}>
      {icon}
    </div>
    <span className={`text-[7px] font-black uppercase tracking-[0.2em] transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>
      {label}
    </span>
    {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full"></div>}
  </button>
);
