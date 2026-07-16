import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import ToastStack from '../../components/ui/ToastStack.jsx';
import { useNotifications } from '../../hooks/useNotifications';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!identifier) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast('Check your inbox or SMS for instructions', 'success');
      navigate('/reset-password');
    }, 1200);
  }

  return (
    <main className="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center p-md paper-texture">
      <div className="w-full max-w-[480px] space-y-xl">
        <div className="text-center">
          <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight">SavePlate</h1>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mt-xs">
            The Digital Pantry
          </p>
        </div>
        <div className="bg-surface-container-lowest p-lg md:p-xl border border-outline-variant">
          <div className="mb-lg">
            <div className="flex items-center gap-sm mb-sm text-primary">
              <span className="material-symbols-outlined">lock_reset</span>
              <h2 className="font-headline-md text-headline-md">Forgot Password?</h2>
            </div>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Enter your account details below and we&apos;ll send you a secure link to reset your kitchen access.
            </p>
          </div>
          <form className="space-y-lg" onSubmit={handleSubmit}>
            <Input
              label="Phone or Email Address"
              placeholder="e.g. kitchen@saveplate.my"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <div className="bg-surface-container border-l-4 border-primary p-md flex gap-md items-start">
              <span className="material-symbols-outlined text-primary mt-xs">info</span>
              <div className="space-y-xs">
                <p className="font-label-md text-label-md text-primary">How it works</p>
                <p className="font-body-md text-on-surface-variant text-sm">
                  We&apos;ll verify your account and send a 6-digit code to your registered contact method. Codes are
                  valid for 15 minutes.
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting} icon="arrow_forward">
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <div className="mt-xl pt-lg border-t border-outline-variant flex flex-col items-center gap-md">
            <Link to="/login" className="font-label-md text-label-md text-on-surface-variant hover:text-primary flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
      <ToastStack />
    </main>
  );
}
