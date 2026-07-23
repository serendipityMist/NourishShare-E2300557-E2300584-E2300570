import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identity || !password) {
      setError('Please enter your email/phone and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const { requiresOtp } = await login({ identity, password });
      if (requiresOtp) {
        navigate('/verify-identity', { state: { identity } });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-lg">
        <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 font-label-sm text-label-sm mb-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Welcome Back
        </span>
        <h2 className="font-headline-lg text-headline-lg text-surface mb-xs">Welcome Back</h2>
        <p className="text-surface/70 font-body-md">Step back into your digital pantry.</p>
      </div>

      <form className="space-y-lg" onSubmit={handleSubmit}>
        <Input
          label="Email or Phone Number"
          placeholder="example@gmail.com"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
        />

        <div className="space-y-xs">
          <div className="flex justify-between items-center">
            <label htmlFor="login-password" className="font-label-md text-label-md text-surface block">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="font-label-sm text-label-sm text-emerald-300 hover:text-emerald-200 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="login-password"
              className="appearance-none w-full rounded-xl py-sm px-md pr-xl font-body-md text-surface placeholder:text-surface/50 bg-surface/5 border border-surface/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-colors"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-surface/60 text-[20px] hover:text-emerald-300 transition-colors"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? 'visibility_off' : 'visibility'}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-label-sm text-error bg-error/10 border border-error/30 rounded-lg px-md py-sm">{error}</p>
        )}

        <label className="flex items-center justify-between gap-md rounded-xl border border-surface/15 bg-surface/[0.02] px-md py-xs cursor-pointer hover:border-emerald-400/40 transition-colors">
          <span className="font-label-md text-label-md text-surface/80">Keep me logged in</span>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-5 h-5 rounded-md accent-emerald-500 cursor-pointer"
          />
        </label>

        <Button
          type="submit"
          className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_6px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_26px_rgba(16,185,129,0.45)] transition-all hover:-translate-y-0.5"
          disabled={submitting}
          icon={submitting ? undefined : 'arrow_forward'}
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </Button>

        <p className="text-center text-label-md font-label-md text-surface/70">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-emerald-300 font-bold hover:text-emerald-200 hover:underline">
            Register your pantry
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}