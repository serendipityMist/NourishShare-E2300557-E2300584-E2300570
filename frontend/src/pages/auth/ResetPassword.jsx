import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter.jsx';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSuccess(true);
  }

  return (
    <main className="paper-texture min-h-screen flex items-center justify-center p-gutter font-body-md text-on-surface">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant p-lg md:p-xl shadow-sm rounded-lg relative overflow-hidden">
        <div className="mb-xl text-center">
          <h1 className="font-headline-md text-headline-md text-primary mb-xs tracking-tight">SavePlate</h1>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">The Digital Pantry</p>
        </div>

        {!success ? (
          <div>
            <div className="mb-lg">
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">
                Create new password
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Choose a strong password to protect your pantry inventory and donations.
              </p>
            </div>
            <form className="space-y-md" onSubmit={handleSubmit}>
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrengthMeter value={password} />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {error && <p className="text-error text-label-sm">{error}</p>}
              <div className="pt-lg">
                <Button type="submit" className="w-full" icon="arrow_forward">
                  Reset password
                </Button>
              </div>
            </form>
            <div className="mt-lg text-center">
              <Link to="/login" className="font-label-md text-label-md text-primary hover:underline flex items-center justify-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-lg flex justify-center">
              <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px]">task_alt</span>
              </div>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Password updated</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
              Your password has been successfully reset. You can now use your new credentials to access your Digital
              Pantry.
            </p>
            <div className="bg-secondary-fixed p-lg rounded-xl mb-xl border border-secondary-fixed-dim inline-block">
              <p className="font-label-md text-label-md text-secondary tracking-tight">
                Security Tip: Use a password manager to keep your community accounts safe!
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Login to SavePlate
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
