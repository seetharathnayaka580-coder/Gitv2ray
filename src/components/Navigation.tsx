import React from 'react';

export type TabType = 'overview' | 'connection' | 'addresses' | 'proxy' | 'logs' | 'more';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'connection', label: 'Connection' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'proxy', label: 'Proxy' },
    { id: 'logs', label: 'Logs' },
    { id: 'more', label: 'More' }
  ];

  return (
    <div className="w-full border-b border-slate-800/80 bg-[#060a14] px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-3 px-3 sm:px-4 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
