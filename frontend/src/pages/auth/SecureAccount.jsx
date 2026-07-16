import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import OtpInput from '../../components/auth/OtpInput.jsx';
import ToastStack from '../../components/ui/ToastStack.jsx';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

export default function SecureAccount() {
  const navigate = useNavigate();
  const { enableTwoFactor } = useAuth();
  const { showToast } = useNotifications();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleEnable() {
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app');
      return;
    }
    enableTwoFactor();
    showToast('Two-factor authentication enabled', 'success');
    navigate('/welcome');
  }

  function handleSkip() {
    navigate('/welcome');
  }

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      <header className="flex justify-between items-center h-16 px-lg bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <span className="font-headline-md text-headline-md font-bold text-primary">SavePlate</span>
          <span className="hidden md:inline-block h-6 w-[1px] bg-outline-variant mx-sm" />
          <span className="hidden md:block font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
            Security
          </span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-md md:p-xl">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-xl bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="md:col-span-5 p-lg md:p-xl bg-surface-container-low flex flex-col justify-between">
            <div>
              <span className="inline-block bg-secondary-fixed text-on-secondary-fixed-variant px-md py-xs rounded-full font-label-md text-label-md mb-md">
                OPTIONAL SECURITY
              </span>
              <h1 className="font-headline-lg text-headline-lg text-primary mb-md leading-tight">
                Secure Your Digital Pantry
              </h1>
              <p className="text-on-surface-variant font-body-md mb-lg">
                Two-factor authentication adds an extra layer of protection. Only you will be able to access your
                inventory and donation history.
              </p>
              <div className="space-y-md">
                <div className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-secondary pt-1">verified_user</span>
                  <p className="text-on-surface font-label-md">Enhanced Privacy</p>
                </div>
                <div className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-secondary pt-1">nest_multi_room</span>
                  <p className="text-on-surface font-label-md">Trusted Malaysian Network</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 p-lg md:p-xl flex flex-col">
            <div className="mb-xl">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">Step 1: Scan QR Code</h2>
              <p className="text-on-surface-variant font-body-md mb-lg">
                Open your authenticator app (Google Authenticator, Authy, etc.) and scan the code below.
              </p>
              <div className="flex justify-center mb-xl">
                <div className="p-md bg-white rounded-lg shadow-sm border-8 border-white flex flex-col items-center gap-sm">
                  <div className="w-48 h-48 bg-surface-container-highest relative overflow-hidden flex items-center justify-center">
                    <div className="grid grid-cols-6 grid-rows-6 gap-1 w-40 h-40 opacity-80">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className={Math.random() > 0.45 ? 'bg-primary' : 'bg-surface'} />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white p-1 rounded-sm shadow-sm">
                        <span className="material-symbols-outlined text-primary text-2xl">lock</span>
                      </div>
                    </div>
                  </div>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
                    Secret Key: SP-2026-KUALA-LUMPUR
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-xl">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">Step 2: Enter 6-Digit Code</h2>
              <p className="text-on-surface-variant font-body-md mb-md">
                Enter the code generated by your app to verify the setup.
              </p>
              <OtpInput value={code} onChange={setCode} />
              {error && <p className="text-error text-label-sm mt-sm">{error}</p>}
            </div>
            <div className="flex flex-col gap-md mt-auto">
              <Button variant="primary" className="w-full" onClick={handleEnable} icon="shield_lock">
                Enable and Confirm
              </Button>
              <Button variant="outline" className="w-full border-secondary/20" onClick={handleSkip}>
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </main>
      <ToastStack />
    </div>
  );
}
