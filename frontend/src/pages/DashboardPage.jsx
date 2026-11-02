import { useEffect, useState } from 'react';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Boxes, CircleDollarSign, Package, Plus, Sparkles, TriangleAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiError } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const money = (value) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value || 0);

function StatCard({ title, value, caption, icon: Icon, tone }) {
  return (
    <div className="stat-card card-surface relative overflow-hidden p-4 sm:p-5 lg:p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0"><p className="text-xs font-semibold text-slate-500 sm:text-sm">{title}</p><p className="mt-2 text-[23px] font-bold tracking-[-.04em] text-slate-900 sm:mt-3 sm:text-[28px]">{value}</p></div>
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-11 sm:w-11 ${tone}`}><Icon size={19} /></div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-slate-500 sm:mt-4 sm:text-xs">{caption}</div>
    </div>
  );
}

function StatusBadge({ low }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${low ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${low ? 'bg-amber-500' : 'bg-emerald-500'}`} />{low ? 'Low stock' : 'In stock'}</span>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/low-stock'),
      api.get('/dashboard/recent-products'),
    ]).then(([statsResponse, lowResponse, recentResponse]) => {
      setStats(statsResponse.data.stats);
      setLowStock(lowResponse.data.lowStockProducts);
      setRecent(recentResponse.data.recentProducts);
    }).catch((error) => toast(getApiError(error), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="dashboard-canvas relative isolate -mx-4 -mt-6 min-h-[calc(100vh-64px)] overflow-hidden px-4 pb-8 pt-6 sm:-mx-6 sm:px-6 md:-mx-8 md:-mt-9 md:px-8 md:pt-9">
      <div className="dashboard-glow dashboard-glow-one" />
      <div className="dashboard-glow dashboard-glow-two" />
      <div className="relative z-10">
      <section className="dashboard-hero relative mb-5 overflow-hidden rounded-[24px] px-5 py-6 text-white shadow-[0_20px_55px_rgba(30,64,175,0.2)] sm:mb-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
        <div className="dashboard-hero-grid absolute inset-0 opacity-30" />
        <div className="dashboard-orb absolute -right-12 -top-32 h-72 w-72 rounded-full" />
        <div className="dashboard-orb dashboard-orb-secondary absolute right-[22%] -bottom-48 h-80 w-80 rounded-full" />
        <div className="relative z-10 flex min-h-[190px] flex-col justify-between gap-7 md:min-h-[205px] md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-blue-50 backdrop-blur-sm">
              <Sparkles size={13} className="text-blue-200" />
              <span>{today}</span>
              <span className="h-1 w-1 rounded-full bg-emerald-300" />
              <span className="text-emerald-100">Live overview</span>
            </div>
            <p className="mb-2 text-sm font-medium text-blue-100">Welcome to {user?.organizationName || 'your workspace'}</p>
            <h1 className="max-w-xl text-[30px] font-bold leading-[1.08] tracking-[-.045em] sm:text-[38px] lg:text-[42px]">Your inventory,<br className="sm:hidden" /> in focus.</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100/85 sm:text-[15px]">See what’s moving, catch low stock early, and keep every product on track.</p>
          </div>
          <div className="flex items-center justify-between gap-4 md:min-w-[220px] md:flex-col md:items-end">
            <div className="hidden items-center gap-3 rounded-2xl border border-white/15 bg-white/[.08] px-4 py-3 backdrop-blur-md md:flex">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-blue-50"><Activity size={19} /></div>
              <div><p className="text-xs font-medium text-blue-100">Stock health</p><p className="mt-0.5 text-sm font-bold text-white">{loading ? 'Updating…' : `${stats?.lowStockCount ?? 0} items need attention`}</p></div>
            </div>
            <button onClick={() => navigate('/products?new=1')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700 shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/30">
              <Plus size={17} /> Add product
            </button>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-[29%] hidden h-20 w-48 opacity-30 lg:block" aria-hidden="true">
          <svg viewBox="0 0 192 80" fill="none" className="h-full w-full">
            <path d="M2 62C22 58 26 37 47 43C68 49 69 60 88 47C107 34 110 18 130 29C150 40 158 18 190 6" stroke="url(#stockline)" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 62C22 58 26 37 47 43C68 49 69 60 88 47C107 34 110 18 130 29C150 40 158 18 190 6V80H2V62Z" fill="url(#stockfill)" />
            <defs><linearGradient id="stockline" x1="2" y1="80" x2="190" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="white" stopOpacity=".25" /><stop offset="1" stopColor="white" /></linearGradient><linearGradient id="stockfill" x1="96" y1="6" x2="96" y2="80" gradientUnits="userSpaceOnUse"><stop stopColor="white" stopOpacity=".18" /><stop offset="1" stopColor="white" stopOpacity="0" /></linearGradient></defs>
          </svg>
        </div>
      </section>
      {loading ? <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="card-surface h-[128px] animate-pulse bg-white sm:h-[154px]"><div className="m-4 h-4 w-20 rounded bg-slate-100 sm:m-6 sm:w-28" /><div className="mx-4 h-8 w-16 rounded bg-slate-100 sm:mx-6 sm:w-20" /></div>)}</div> : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard title="Total products" value={stats?.totalProducts ?? 0} caption={<><ArrowUpRight size={14} className="text-emerald-500" /> Products in your catalog</>} icon={Package} tone="bg-blue-50 text-brand-600" />
          <StatCard title="Units in stock" value={(stats?.totalStockQuantity ?? 0).toLocaleString()} caption={<><Boxes size={14} className="text-slate-400" /> Across all products</>} icon={Boxes} tone="bg-violet-50 text-violet-600" />
          <StatCard title="Low stock items" value={stats?.lowStockCount ?? 0} caption={<><ArrowDownRight size={14} className="text-amber-500" /> Need your attention</>} icon={TriangleAlert} tone="bg-amber-50 text-amber-600" />
          <StatCard title="Inventory value" value={money(stats?.totalInventoryValue)} caption={<><CircleDollarSign size={14} className="text-emerald-500" /> Based on cost price</>} icon={CircleDollarSign} tone="bg-emerald-50 text-emerald-600" />
        </div>
      )}
      <div className="mt-5 grid items-start gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="dashboard-panel card-surface overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-6">
            <div><h2 className="text-sm font-bold text-slate-900 sm:text-base">Low stock alerts</h2><p className="mt-1 text-xs text-slate-500">Products at or below their reorder threshold</p></div>
            <Link to="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">All products <ArrowRight size={14} /></Link>
          </div>
          {loading ? <div className="p-6 text-sm text-slate-400">Loading inventory…</div> : lowStock.length ? (
            <>
            <div className="space-y-3 p-4 md:hidden">
              {lowStock.slice(0, 6).map((product) => <div key={product.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{product.name}</p><p className="mt-1 font-mono text-[11px] text-slate-500">{product.sku}</p></div><StatusBadge low /></div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-2.5 text-xs"><span className="text-slate-500">Available <strong className="ml-1 text-amber-700">{product.quantityOnHand}</strong></span><span className="text-slate-500">Threshold <strong className="ml-1 text-slate-700">{product.effectiveThreshold}</strong></span></div>
              </div>)}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="data-table min-w-[560px]">
                <thead><tr><th>Product</th><th>SKU</th><th>Available</th><th>Threshold</th><th>Status</th></tr></thead>
                <tbody>{lowStock.slice(0, 6).map((product) => <tr key={product.id}><td className="font-semibold text-slate-800">{product.name}</td><td className="font-mono text-xs text-slate-500">{product.sku}</td><td className="font-semibold text-amber-700">{product.quantityOnHand}</td><td className="text-slate-600">{product.effectiveThreshold}</td><td><StatusBadge low /></td></tr>)}</tbody>
              </table>
            </div>
            </>
          ) : <div className="px-6 py-12 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Boxes size={20} /></div><p className="mt-3 text-sm font-semibold text-slate-800">You’re all stocked up</p><p className="mt-1 text-sm text-slate-500">No products are below their stock threshold.</p></div>}
        </section>
        <section className="dashboard-panel card-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
            <div><h2 className="text-sm font-bold text-slate-900 sm:text-base">Recently added</h2><p className="mt-1 text-xs text-slate-500">The latest in your product catalog</p></div>
            <Link to="/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          {loading ? <div className="p-6 text-sm text-slate-400">Loading products…</div> : recent.length ? <div className="divide-y divide-slate-100">
            {recent.map((product) => <div key={product.id} className="flex items-center gap-2.5 px-4 py-4 sm:gap-3 sm:px-6">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><Package size={18} /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{product.name}</p><p className="mt-0.5 truncate font-mono text-xs text-slate-400">{product.sku}</p></div>
              <div className="text-right"><p className="text-sm font-semibold text-slate-800">{product.quantityOnHand} <span className="text-xs font-normal text-slate-400">units</span></p><div className="mt-1"><StatusBadge low={product.isLowStock} /></div></div>
            </div>)}
          </div> : <div className="px-6 py-12 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-brand-600"><Package size={20} /></div><p className="mt-3 text-sm font-semibold text-slate-800">Your catalog starts here</p><p className="mt-1 text-sm text-slate-500">Add your first product to see it here.</p><button className="btn-primary mx-auto mt-4" onClick={() => navigate('/products?new=1')}><Plus size={16} /> Add product</button></div>}
        </section>
      </div>
      </div>
    </div>
  );
}
