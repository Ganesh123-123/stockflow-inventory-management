import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Boxes, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiError } from '../services/api';

export default function AuthPage({ signup = false }) {
  const [form, setForm] = useState({ organizationName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, login, signup: register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (signup && form.password !== form.confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }
    if (form.password.length < 6) {
      toast('Password must be at least 6 characters.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (signup) await register({ organizationName: form.organizationName.trim(), email: form.email.trim(), password: form.password });
      else await login({ email: form.email.trim(), password: form.password });
      navigate('/', { replace: true });
    } catch (error) {
      toast(getApiError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-canvas flex min-h-screen bg-white">
      <section className="hidden w-[48%] flex-col justify-between overflow-hidden bg-[#101c37] p-12 text-white lg:flex xl:p-16">
        <Link to="/login" className="flex w-fit items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500"><Boxes size={23} /></span>
          <span className="text-xl font-bold tracking-tight">StockFlow</span>
        </Link>
        <div className="relative z-10 max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Your operations, in sync
          </div>
          <h1 className="text-5xl font-bold leading-[1.13] tracking-tight xl:text-[56px]">Know your stock.<br /><span className="text-blue-300">Own your next move.</span></h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-300">A calmer, clearer way to manage inventory, catch low stock early, and keep your business moving.</p>
          <div className="mt-9 flex items-center gap-3 text-sm text-slate-300"><ShieldCheck size={18} className="text-emerald-400" /> Private workspace for your organization</div>
        </div>
        <p className="text-xs text-slate-500">StockFlow Inventory · Built for teams that keep things moving</p>
        <div className="pointer-events-none absolute bottom-[-200px] left-[-120px] h-[500px] w-[500px] rounded-full border border-white/[.06]" />
        <div className="pointer-events-none absolute bottom-[-150px] left-[-70px] h-[400px] w-[400px] rounded-full border border-white/[.06]" />
      </section>
      <section className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[420px] rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(30,64,175,0.08)] backdrop-blur-xl sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <Link to="/login" className="mb-10 flex w-fit items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><Boxes size={21} /></span>
            <span className="text-lg font-bold text-slate-900">StockFlow</span>
          </Link>
          <p className="text-sm font-semibold text-brand-600">{signup ? 'GET STARTED FOR FREE' : 'WELCOME BACK'}</p>
          <h2 className="mt-2 text-[30px] font-bold tracking-tight text-slate-900">{signup ? 'Create your workspace' : 'Sign in to StockFlow'}</h2>
          <p className="mt-2 text-sm text-slate-500">{signup ? 'Set up your organization and take control of your inventory.' : 'Enter your details to access your inventory workspace.'}</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            {signup && <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Organization name</span><input className="input-field" name="organizationName" value={form.organizationName} onChange={change} placeholder="Acme Supply Co." required maxLength="100" /></label>}
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Email address</span><input className="input-field" name="email" type="email" autoComplete="email" value={form.email} onChange={change} placeholder="you@company.com" required /></label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
              <span className="relative block">
                <input className="input-field pr-11" name="password" type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} value={form.password} onChange={change} placeholder="Enter your password" minLength="6" required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-slate-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </span>
            </label>
            {signup && <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</span><input className="input-field" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={change} placeholder="Re-enter your password" required /></label>}
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>{loading ? 'Please wait…' : signup ? 'Create account' : 'Sign in'} {!loading && <ArrowRight size={17} />}</button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">
            {signup ? 'Already have an account? ' : 'New to StockFlow? '}
            <Link to={signup ? '/login' : '/signup'} className="font-semibold text-brand-600 hover:text-brand-700">{signup ? 'Sign in' : 'Create an account'}</Link>
          </p>
          <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck size={14} /> Your inventory data stays private and secure.</p>
        </div>
      </section>
    </main>
  );
}
