import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const emptyProduct = {
  name: '', sku: '', description: '', quantityOnHand: 0,
  costPrice: '', sellingPrice: '', lowStockThreshold: '',
};

function Field({ label, name, value, onChange, type = 'text', required, hint, min, step }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}{required && <span className="text-rose-500"> *</span>}</span>
      <input className="input-field" name={name} value={value} onChange={onChange} type={type} required={required} min={min} step={step} />
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export default function ProductModal({ product, onClose, onSave, saving }) {
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    if (product) setForm({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      quantityOnHand: product.quantityOnHand ?? 0,
      costPrice: product.costPrice ?? '',
      sellingPrice: product.sellingPrice ?? '',
      lowStockThreshold: product.lowStockThreshold ?? '',
    });
    else setForm(emptyProduct);
  }, [product]);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      quantityOnHand: Number(form.quantityOnHand),
      costPrice: form.costPrice === '' ? null : Number(form.costPrice),
      sellingPrice: form.sellingPrice === '' ? null : Number(form.sellingPrice),
      lowStockThreshold: form.lowStockThreshold === '' ? null : Number(form.lowStockThreshold),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="product-modal-title" className="my-auto w-full max-w-[600px] rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="product-modal-title" className="text-lg font-bold text-slate-900">{product ? 'Edit product' : 'Add a product'}</h2>
            <p className="mt-1 text-sm text-slate-500">Keep your catalog and stock levels up to date.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close dialog"><X size={19} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name" name="name" value={form.name} onChange={change} required />
            <Field label="SKU" name="sku" value={form.sku} onChange={change} required />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Description</span>
            <textarea className="input-field min-h-[76px] resize-y" name="description" value={form.description} onChange={change} rows="2" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Quantity on hand" name="quantityOnHand" value={form.quantityOnHand} onChange={change} type="number" min="0" step="1" required />
            <Field label="Low stock threshold" name="lowStockThreshold" value={form.lowStockThreshold} onChange={change} type="number" min="0" step="1" hint="Leave blank to use your organization default." />
            <Field label="Cost price" name="costPrice" value={form.costPrice} onChange={change} type="number" min="0" step="0.01" />
            <Field label="Selling price" name="sellingPrice" value={form.sellingPrice} onChange={change} type="number" min="0" step="0.01" />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
