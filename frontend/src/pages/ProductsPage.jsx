import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Boxes, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ProductModal from '../components/ProductModal';
import api, { getApiError } from '../services/api';
import { useToast } from '../context/ToastContext';

const currency = (value) => value == null ? '—' : new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);

function StockBadge({ low }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${low ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${low ? 'bg-amber-500' : 'bg-emerald-500'}`} />{low ? 'Low stock' : 'In stock'}</span>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const loadProducts = useCallback(async (query) => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: query ? { search: query } : {} });
      setProducts(data.products);
    } catch (error) {
      toast(getApiError(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadProducts(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [loadProducts, search]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing(null);
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const saveProduct = async (form) => {
    setSaving(true);
    try {
      if (editing) await api.put(`/products/${editing.id}`, form);
      else await api.post('/products', form);
      toast(editing ? 'Product updated successfully.' : 'Product added successfully.');
      setModalOpen(false);
      setEditing(null);
      await loadProducts(search.trim());
    } catch (error) {
      toast(getApiError(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      toast('Product deleted.');
      await loadProducts(search.trim());
    } catch (error) {
      toast(getApiError(error), 'error');
    }
  };

  return (
    <>
      <PageHeader eyebrow="CATALOG" title="Products" description="Manage your products, prices, and available stock." action={<button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary"><Plus size={17} /> Add product</button>} />
      <section className="card-surface overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><h2 className="font-bold text-slate-900">All products <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{products.length}</span></h2><p className="mt-1 text-xs text-slate-500">Search and maintain your inventory catalog.</p></div>
          <label className="relative block sm:w-[280px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input className="input-field pl-9" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or SKU…" aria-label="Search products" /></label>
        </div>
        {loading ? <div className="p-10 text-center text-sm text-slate-500">Loading products…</div> : products.length ? (
          <>
          <div className="space-y-3 p-4 md:hidden">
            {products.map((product) => <article key={product.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-slate-900">{product.name}</h3><p className="mt-1 truncate font-mono text-xs text-slate-500">{product.sku}</p></div>
                <StockBadge low={product.isLowStock} />
              </div>
              {product.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{product.description}</p>}
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3">
                <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Available</p><p className={`mt-1 text-sm font-bold ${product.isLowStock ? 'text-amber-700' : 'text-slate-800'}`}>{product.quantityOnHand} units</p></div>
                <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Selling price</p><p className="mt-1 text-sm font-bold text-slate-800">{currency(product.sellingPrice)}</p></div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => { setEditing(product); setModalOpen(true); }} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50" aria-label={`Edit ${product.name}`}><Pencil size={14} /> Edit</button>
                <button onClick={() => deleteProduct(product)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-rose-100 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50" aria-label={`Delete ${product.name}`}><Trash2 size={14} /> Delete</button>
              </div>
            </article>)}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="data-table min-w-[760px]">
              <thead><tr><th>Product</th><th>SKU</th><th>Quantity</th><th>Stock status</th><th>Selling price</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{products.map((product) => <tr key={product.id}>
                <td><div className="font-semibold text-slate-800">{product.name}</div>{product.description && <div className="mt-0.5 max-w-[240px] truncate text-xs text-slate-400">{product.description}</div>}</td>
                <td className="font-mono text-xs text-slate-500">{product.sku}</td>
                <td className={`font-semibold ${product.isLowStock ? 'text-amber-700' : 'text-slate-700'}`}>{product.quantityOnHand}</td>
                <td><StockBadge low={product.isLowStock} /></td>
                <td className="font-medium text-slate-700">{currency(product.sellingPrice)}</td>
                <td><div className="flex justify-end gap-1"><button onClick={() => { setEditing(product); setModalOpen(true); }} className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-brand-600" aria-label={`Edit ${product.name}`}><Pencil size={16} /></button><button onClick={() => deleteProduct(product)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button></div></td>
              </tr>)}</tbody>
            </table>
          </div>
          </>
        ) : <div className="px-6 py-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-brand-600"><Boxes size={22} /></div>
          <h3 className="mt-4 font-bold text-slate-900">{search ? 'No matching products' : 'No products yet'}</h3>
          <p className="mt-1 text-sm text-slate-500">{search ? 'Try another product name or SKU.' : 'Add your first product to start tracking stock.'}</p>
          {!search && <button className="btn-primary mx-auto mt-5" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Add your first product</button>}
        </div>}
      </section>
      {modalOpen && <ProductModal product={editing} onClose={() => setModalOpen(false)} onSave={saveProduct} saving={saving} />}
    </>
  );
}
