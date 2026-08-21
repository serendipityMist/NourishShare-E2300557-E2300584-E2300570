import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import OtpInput from '../../components/auth/OtpInput.jsx';
import ToastStack from '../../components/ui/ToastStack.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function VerifyResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyResetOtp } = useAuth();
  const identifier = location.state?.identifier || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Enter the 6-digit code sent to your email.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await verifyResetOtp(code);
      navigate('/reset-password', { state: { identifier } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col items-center justify-center p-md paper-texture">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-lg md:p-xl rounded-none relative overflow-hidden flex flex-col gap-lg">
        <header className="flex flex-col items-center gap-sm mb-md">
          <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center text-primary mb-sm">
            <span className="material-symbols-outlined text-[32px]">mail_lock</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary text-center">Verify Reset Code</h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-[280px]">
            Enter the 6-digit code sent to your email to continue resetting your password.
          </p>
        </header>
        <form className="flex flex-col gap-lg" onSubmit={handleSubmit}>
          <OtpInput value={code} onChange={setCode} />
          {error && <p className="text-error text-label-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting} icon="verified_user">
            {submitting ? 'Verifying...' : 'Verify Code'}
          </Button>
        </form>
        <div className="text-center">
          <Link to="/forgot-password" className="font-label-md text-label-md text-on-surface-variant hover:text-primary">
            Didn&apos;t get a code? Try again
          </Link>
        </div>
      </div>
      <ToastStack />
    </main>
  );
}