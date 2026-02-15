
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-slate-50 shadow-2xl relative">
      <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <h1 className="text-xl font-black heading-font text-emerald-700 tracking-tight">CulinaryAI</h1>
        <button onClick={() => setActiveTab('profile')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border-2 border-white shadow-sm overflow-hidden">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
           </svg>
        </button>
      </header>

      <main className="flex-1 p-4 pb-28 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around py-4 px-2 z-50">
        <NavBtn icon="chart-square" label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavBtn icon="plus-circle" label="Log" active={activeTab === 'log'} onClick={() => setActiveTab('log')} />
        <NavBtn icon="book-open" label="Cook" active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
        <NavBtn icon="sparkles" label="Coach" active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
        <NavBtn icon="clock" label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
      </nav>
    </div>
  );
};

const NavBtn = ({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) => {
  const icons: Record<string, React.ReactNode> = {
    'chart-square': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />,
    'plus-circle': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'book-open': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
    'sparkles': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />,
    'clock': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  };

  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 group transition-all ${active ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-active:scale-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icons[icon]}
      </svg>
      <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );
};

export default Layout;
