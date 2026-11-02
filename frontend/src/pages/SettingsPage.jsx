import { useEffect, useState } from 'react';
import { Building2, Save, SlidersHorizontal } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api, { getApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const [form, setForm] = useState({ name: '', defaultLowStockThreshold: 10 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { updateOrganizationName } = useAuth();
  const toast = useToast();

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => setForm({ name: data.settings.name, defaultLowStockThreshold: data.settings.defaultLowStockThreshold }))
      .catch((error) => toast(getApiError(error), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/settings', {
        name: form.name.trim(),
        defaultLowStockThreshold: Number(form.defaultLowStockThreshold),
      });
      setForm({ name: data.settings.name, defaultLowStockThreshold: data.settings.defaultLowStockThreshold });
      updateOrganizationName(data.settings.name);
      toast('Workspace settings saved.');
    } catch (error) {
      toast(getApiError(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="PREFERENCES" title="Settings" description="Configure your organization and inventory defaults." />
      <form onSubmit={submit} className="max-w-[780px] space-y-5">
        <section className="card-surface overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-brand-600"><Building2 size={18} /></span>
            <div><h2 className="font-bold text-slate-900">Organization</h2><p className="text-xs text-slate-500">Manage your workspace identity.</p></div>
          </div>
          <div className="p-5 sm:p-6">
            <label className="block max-w-lg"><span className="mb-1.5 block text-sm font-medium text-slate-700">Organization name</span><input className="input-field" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} maxLength="100" required disabled={loading} /></label>
          </div>
        </section>
        <section className="card-surface overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-600"><SlidersHorizontal size={18} /></span>
            <div><h2 className="font-bold text-slate-900">Inventory defaults</h2><p className="text-xs text-slate-500">Set how StockFlow identifies low stock.</p></div>
          </div>
          <div className="p-5 sm:p-6">
            <label className="block max-w-lg"><span className="mb-1.5 block text-sm font-medium text-slate-700">Default low stock threshold</span><input className="input-field" type="number" min="0" step="1" value={form.defaultLowStockThreshold} onChange={(event) => setForm((current) => ({ ...current, defaultLowStockThreshold: event.target.value }))} required disabled={loading} /><span className="mt-1.5 block text-xs leading-5 text-slate-400">Products without a custom threshold will use this number. Products are flagged when available quantity is less than or equal to the threshold.</span></label>
          </div>
        </section>
        <div className="flex justify-end"><button type="submit" className="btn-primary" disabled={loading || saving}>{saving ? 'Saving…' : <><Save size={16} /> Save changes</>}</button></div>
      </form>
    </>
  );
}
