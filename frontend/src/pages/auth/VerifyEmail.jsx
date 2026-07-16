import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ToastStack from '../../components/ui/ToastStack.jsx';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const { showToast } = useNotifications();
  const email = location.state?.email || 'your registered email';

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function handleResend() {
    if (cooldown > 0) return;
    setCooldown(60);
    showToast('New link dispatched successfully', 'success');
  }

  function handleSimulateVerified() {
    verifyEmail();
    showToast('Email verified!', 'success');
    navigate('/secure-account');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-gutter paper-texture">
      <div className="relative w-full max-w-[500px] bg-surface-container-lowest border border-outline-variant p-xl shadow-sm rounded-lg overflow-hidden flex flex-col items-center text-center">
        <div className="mb-lg">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            SavePlate
          </Link>
        </div>
        <div className="mb-lg w-32 h-32 relative">
          <div className="absolute inset-0 bg-primary-fixed-dim rounded-full opacity-20 scale-110" />
          <div className="relative w-full h-full bg-surface-container-high rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[48px]">mail</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary p-md rounded-full shadow-lg">
            <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
          </div>
        </div>
        <div className="space-y-md mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-primary">Verify your pantry</h1>
          <p className="font-body-md text-on-surface-variant max-w-[400px]">
            A verification link has been sent to your inbox at:
          </p>
          <div className="bg-surface-container-low px-md py-sm rounded-lg border border-outline-variant inline-block">
            <span className="font-label-md text-label-md text-on-surface">{email}</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant italic">
            Don&apos;t forget to check your spam folder.
          </p>
        </div>
        <div className="w-full space-y-md">
          <Button variant="primary" className="w-full" onClick={handleResend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Wait to resend (${cooldown}s)` : 'Resend verification email'}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleSimulateVerified} icon="check_circle">
            I&apos;ve verified — continue
          </Button>
          <div className="pt-md border-t border-outline-variant mt-sm">
            <Link to="/login" className="text-on-surface-variant font-label-md text-label-md flex items-center justify-center gap-xs hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to login
            </Link>
          </div>
        </div>
      </div>
      <ToastStack />
    </main>
  );
}
