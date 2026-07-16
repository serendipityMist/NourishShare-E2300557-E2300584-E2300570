import ToastStack from '../ui/ToastStack.jsx';
import AntigravityField from './AntigravityField.jsx';
import logo from '../../assets/logoo.png';

export default function AuthLayout({ children }) {
  return (
    <main
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-margin-mobile py-xl"
      style={{ background: 'radial-gradient(120% 120% at 50% 15%, #16241A 0%, #0A140D 45%, #050705 100%)' }}
    >
      <AntigravityField logoSrc={logo} />

      <div className="relative z-10 w-full flex flex-col items-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-surface/8 backdrop-blur-2xl border border-surface/15 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.45)] p-xl">
          {children}
        </div>
      </div>

      <ToastStack />
    </main>
  );
}