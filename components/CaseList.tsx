
import React from 'react';
import { Icons } from './Icons';

interface CaseListProps {
  onSelectCase: (id: string) => void;
}

export const CaseList: React.FC<CaseListProps> = ({ onSelectCase }) => {
  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Контейнеры</h2>
        <div className="h-0.5 w-12 bg-white"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <div 
          onClick={() => onSelectCase('shareworld')}
          className="group cursor-pointer bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all overflow-hidden rounded-[2rem] shadow-2xl"
        >
          <div className="h-64 bg-gradient-to-br from-[#111] to-black flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center">
               <div className="text-white/20 group-hover:text-yellow-500 transition-all duration-500 group-hover:scale-110 transform drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <Icons.Case />
               </div>
               <div className="mt-8 bg-white/5 border border-white/5 px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-white transition-colors">Активная серия</div>
            </div>
          </div>
          <div className="p-8 flex justify-between items-center border-t border-white/5 bg-[#050505]">
            <div>
              <h3 className="text-2xl font-black uppercase italic leading-none mb-1 tracking-tight">ShareWorld</h3>
              <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">Лимитированный выпуск</p>
            </div>
            <div className="text-right">
              <div className="text-yellow-500 font-black text-2xl tracking-tighter italic">150 <span className="text-[10px] opacity-40 not-italic">GC</span></div>
            </div>
          </div>
        </div>

        {/* Заблокированные слоты */}
        {[1, 2].map(i => (
          <div key={i} className="border border-white/5 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-12 opacity-20 bg-white/[0.01]">
            <div className="w-8 h-8 text-gray-500"><Icons.Box /></div>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 mt-4">Засекречено</div>
          </div>
        ))}
      </div>
    </div>
  );
};
