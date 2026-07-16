import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!identity || !password) {
      setError('Please enter your email/phone and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (user.twoFactorEnabled) {
        navigate('/verify-identity');
      } else {
        login();
        navigate('/dashboard');
      }
    }, 700);
  }

  return (
    <AuthLayout>
      <header className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-surface mb-xs">Welcome Back</h2>
        <p className="font-body-md text-surface/70">Step back into your digital pantry.</p>
      </header>
      <form className="space-y-lg" onSubmit={handleSubmit}>
        <Input
          label="Email or Phone Number"
          placeholder="pantry@saveplate.com"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
        />
        <div className="space-y-xs">
          <div className="flex justify-between items-center">
            <label className="font-label-md text-label-md text-surface block">Password</label>
            <Link to="/forgot-password" className="font-label-sm text-label-sm text-[#E8B44A] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              className="stamped-input py-sm font-body-md text-surface placeholder:text-surface/30 border-surface/25 bg-transparent w-full pr-xl"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-surface/50 text-[20px] hover:text-surface transition-colors"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? 'visibility_off' : 'visibility'}
            </button>
          </div>
        </div>
        {error && <p className="text-error text-label-sm">{error}</p>}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-5 h-5 rounded border-surface/30 text-primary bg-surface/10 cursor-pointer"
          />
          <label htmlFor="remember" className="ml-sm font-label-md text-label-md text-surface/70 cursor-pointer">
            Keep me logged in
          </label>
        </div>
        <Button type="submit" className="w-full" disabled={submitting} icon={submitting ? undefined : 'arrow_forward'}>
          {submitting ? 'Logging in...' : 'Log in'}
        </Button>
        <footer className="mt-xl text-center">
          <p className="font-body-md text-surface/70">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-label-md text-label-md text-[#E8B44A] hover:underline ml-xs">
              Register your pantry
            </Link>
          </p>
        </footer>
      </form>
    </AuthLayout>
  );
}