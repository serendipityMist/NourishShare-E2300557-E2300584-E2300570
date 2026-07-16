import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import OtpInput from '../../components/auth/OtpInput.jsx';
import ToastStack from '../../components/ui/ToastStack.jsx';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyIdentity() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [time, setTime] = useState(299);

  useEffect(() => {
    if (time <= 0) return;
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [time]);

  const minutes = String(Math.floor(time / 60)).padStart(2, '0');
  const seconds = String(time % 60).padStart(2, '0');

  function handleSubmit(e) {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Enter the 6-digit code sent to your device.');
      return;
    }
    login();
    navigate('/dashboard');
  }

  return (
    <main className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col items-center justify-center p-md paper-texture">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-lg md:p-xl rounded-none relative overflow-hidden flex flex-col gap-lg">
        <header className="flex flex-col items-center gap-sm mb-md">
          <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center text-primary mb-sm">
            <span className="material-symbols-outlined text-[32px]">shield_person</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary text-center">Identity Verification</h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-[280px]">
            To keep your Digital Pantry secure, enter the 6-digit code sent to your registered device.
          </p>
        </header>
        <form className="flex flex-col gap-lg" onSubmit={handleSubmit}>
          <OtpInput value={code} onChange={setCode} />
          {error && <p className="text-error text-label-sm text-center">{error}</p>}
          <div className="flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">schedule</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Code expires in{' '}
              <span className={`font-bold ${time <= 0 ? 'text-error' : 'text-secondary'}`}>
                {time <= 0 ? 'Expired' : `${minutes}:${seconds}`}
              </span>
            </p>
          </div>
          <label className="flex items-center gap-md cursor-pointer group">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="w-5 h-5 border-outline-variant bg-surface text-primary"
            />
            <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
              Trust this device for 30 days
            </span>
          </label>
          <Button type="submit" className="w-full" icon="verified_user">
            Verify Identity
          </Button>
        </form>
      </div>
      <ToastStack />
    </main>
  );
}
