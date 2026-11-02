import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Boxes, LayoutDashboard, LogOut, Menu, Settings, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sidebar = (
    <>
      <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm shadow-blue-200">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[17px] font-bold tracking-tight text-slate-900">StockFlow</p>
          <p className="text-[11px] font-medium text-slate-400">INVENTORY, IN CONTROL</p>
        </div>
        <button className="ml-auto rounded-lg p-2 text-slate-500 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={19} /></button>
      </div>
      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.13em] text-slate-400">Workspace</p>
        <nav className="space-y-1">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-brand-700">
            {(user?.organizationName || 'S').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.organizationName || 'Your workspace'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button onClick={signOut} className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600">
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="app-shell min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-slate-200/80 bg-white lg:flex">{sidebar}</aside>
      {menuOpen && <button className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu backdrop" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,320px)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>{sidebar}</aside>
      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md md:h-[68px] md:px-8">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden" aria-label="Open workspace menu"><Menu size={20} /></button>
            <span className="text-[15px] font-bold tracking-tight text-slate-900 lg:hidden">StockFlow</span>
            <p className="hidden text-sm font-medium text-slate-500 lg:block">Good inventory. Better decisions.</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-600 sm:block">{user?.email}</span>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-bold text-brand-700 ring-2 ring-white">{(user?.email || 'S').charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main className="app-content mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] px-4 pb-28 pt-6 sm:px-6 md:px-8 md:pb-10 md:pt-9"><Outlet /></main>
      </div>
      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200/80 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-lg lg:hidden">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`}>
            <Icon size={19} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
