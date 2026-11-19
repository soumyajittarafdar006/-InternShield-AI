import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Overview' },
  { id: 'analyze', label: 'Analyse Offer' },
  { id: 'dashboard', label: 'History' },
  { id: 'ml-performance', label: 'Benchmarks' },
];

export default function Navbar({ activeTab, setActiveTab, backendStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const state = !backendStatus ? 'checking' : backendStatus.status === 'healthy' ? 'online' : 'offline';
  const status = {
    checking: {
      label: 'Checking server',
      dot: 'bg-stone-400',
      text: 'text-stone-500',
      title: 'Contacting the analysis server',
    },
    online: {
      label: 'Model online',
      dot: 'bg-teal-600',
      text: 'text-teal-800',
      title: 'The Flask server and trained model are reachable',
    },
    offline: {
      label: 'Browser rules',
      dot: 'bg-amber-600',
      text: 'text-amber-800',
      title: 'The analysis server is unreachable. Offers are checked with the built-in rule engine in your browser.',
    },
  }[state];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#FAF9F6]/95 backdrop-blur-sm">
      <nav className="page" aria-label="Primary">
        <div className="flex h-14 items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <button type="button" onClick={() => go('home')} className="text-left" aria-label="InternShield home">
              <span className="display text-base font-bold tracking-tight text-stone-900">
                Intern<span className="text-[#0F4C5C]">Shield</span>
              </span>
            </button>

            <div className="hidden h-14 items-stretch gap-5 md:flex">
              {NAV_ITEMS.map(({ id, label }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => go(id)}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex items-center border-b-2 text-sm font-medium transition-colors ${
                      active
                        ? 'border-[#0F4C5C] text-stone-900'
                        : 'border-transparent text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <span
              className={`hidden items-center gap-2 font-mono text-xs lg:inline-flex ${status.text}`}
              title={status.title}
            >
              <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
              {status.label}
            </span>
            <button
              type="button"
              onClick={() => go('analyze')}
              className="inline-flex items-center gap-2 rounded-md bg-[#0F4C5C] px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#0B3A47]"
            >
              <Search className="h-3.5 w-3.5" />
              Check offer
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-md p-1.5 text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-stone-200 bg-white md:hidden">
          <div className="page space-y-1 py-3">
            {NAV_ITEMS.map(({ id, label }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => go(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium ${
                    active ? 'bg-stone-100 text-[#0F4C5C]' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
            <div className="flex items-center justify-between border-t border-stone-100 pt-3">
              <span className={`inline-flex items-center gap-2 font-mono text-xs ${status.text}`}>
                <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
                {status.label}
              </span>
              <button
                type="button"
                onClick={() => go('analyze')}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#0F4C5C] px-3.5 py-1.5 text-sm font-medium text-white"
              >
                <Search className="h-3.5 w-3.5" />
                Check offer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}