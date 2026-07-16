import { useRef, useState, useCallback } from 'react';

// Simple geometric shapes — SVG paths, no icon-font dependency, always render.
const SHAPES = {
  leaf: 'M12,2 C5,8 5,16 12,22 C19,16 19,8 12,2 Z M12,4 L12,20',
  drop: 'M12 2c-4 6-7 10-7 14a7 7 0 0 0 14 0c0-4-3-8-7-14z',
  renew: 'M4 12a8 8 0 0 1 13.6-5.7M4 12l-2-3m2 3l3-1M20 12a8 8 0 0 1-13.6 5.7M20 12l2 3m-2-3l-3 1',
  basket: 'M4 9h16l-1.5 10a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2L4 9z M7 9l2-5h6l2 5 M9 13v4 M15 13v4',
  jar: 'M8 4h8v3H8z M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8z',
  sprout: 'M12 22V10 M12 10c0-4 3-6 7-6 0 4-3 7-7 7 M12 12c0-3-3-5-6-5 0 3 2 6 6 6',
};

// Full-canvas spread. Nothing is scrimmed now since there's no text underneath.
const CORE = { top: 30, left: 50, size: 96 };
const SATELLITES = [
  { shape: 'leaf', size: 40, top: 8, left: 12, depth: 0.6, opacity: 0.4, delay: '0s', duration: '6s' },
  { shape: 'drop', size: 30, top: 16, left: 30, depth: 1.1, opacity: 0.45, delay: '0.4s', duration: '6.6s' },
  { shape: 'renew', size: 42, top: 10, left: 70, depth: 0.9, opacity: 0.45, delay: '0.6s', duration: '5.4s' },
  { shape: 'basket', size: 38, top: 6, left: 88, depth: 0.8, opacity: 0.4, delay: '0.9s', duration: '6.2s' },
  { shape: 'jar', size: 36, top: 24, left: 6, depth: 0.7, opacity: 0.35, delay: '1.1s', duration: '6.8s' },
  { shape: 'sprout', size: 34, top: 22, left: 92, depth: 1.0, opacity: 0.4, delay: '0.3s', duration: '5.8s' },
  { shape: 'drop', size: 26, top: 42, left: 16, depth: 1.2, opacity: 0.4, delay: '1.3s', duration: '6.1s' },
  { shape: 'leaf', size: 32, top: 46, left: 84, depth: 0.8, opacity: 0.4, delay: '0.2s', duration: '6.5s' },
  { shape: 'renew', size: 30, top: 58, left: 8, depth: 1.0, opacity: 0.35, delay: '0.75s', duration: '5.6s' },
  { shape: 'basket', size: 34, top: 62, left: 94, depth: 0.9, opacity: 0.4, delay: '0.5s', duration: '6.3s' },
  { shape: 'jar', size: 40, top: 74, left: 20, depth: 0.7, opacity: 0.4, delay: '1s', duration: '6.9s' },
  { shape: 'sprout', size: 30, top: 78, left: 76, depth: 1.1, opacity: 0.4, delay: '0.15s', duration: '5.5s' },
  { shape: 'leaf', size: 36, top: 88, left: 10, depth: 0.8, opacity: 0.35, delay: '0.85s', duration: '6.4s' },
  { shape: 'drop', size: 28, top: 90, left: 50, depth: 1.0, opacity: 0.35, delay: '0.45s', duration: '6s' },
  { shape: 'renew', size: 32, top: 86, left: 90, depth: 0.9, opacity: 0.4, delay: '1.15s', duration: '5.9s' },
];

function Shape({ shape, size, className, style }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d={SHAPES[shape]} />
    </svg>
  );
}

export default function AntigravityField({ logoSrc }) {
  const fieldRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5, active: false });

  const handleMove = useCallback((e) => {
    const rect = fieldRef.current.getBoundingClientRect();
    setPointer({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      active: true,
    });
  }, []);

  const handleLeave = useCallback(() => setPointer((p) => ({ ...p, active: false })), []);

  return (
    <div
      ref={fieldRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-auto"
    >
      {/* ambient corner glows */}
      <div className="absolute w-[70%] h-[70%] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(159,196,144,0.14) 0%, rgba(159,196,144,0) 70%)', top: '-15%', left: '-15%' }} />
      <div className="absolute w-[55%] h-[55%] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,180,74,0.08) 0%, rgba(232,180,74,0) 70%)', bottom: '-15%', right: '-15%' }} />

      {/* orbit guides around the core */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.14] pointer-events-none" preserveAspectRatio="none">
        <ellipse cx={`${CORE.left}%`} cy={`${CORE.top}%`} rx="22%" ry="18%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" className="text-surface" />
        <ellipse cx={`${CORE.left}%`} cy={`${CORE.top}%`} rx="34%" ry="28%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" className="text-surface" />
      </svg>

      {/* cursor gravity-well */}
      <div
        className="absolute w-[380px] h-[380px] rounded-full blur-3xl pointer-events-none transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(232,180,74,0.3) 0%, rgba(232,180,74,0) 70%)',
          top: `${pointer.y * 100}%`, left: `${pointer.x * 100}%`,
          transform: 'translate(-50%, -50%)', opacity: pointer.active ? 1 : 0,
        }}
      />
      <div
        className="absolute w-16 h-16 rounded-full border border-[#E8B44A]/50 pointer-events-none transition-all duration-300 ease-out"
        style={{
          top: `${pointer.y * 100}%`, left: `${pointer.x * 100}%`,
          transform: `translate(-50%, -50%) scale(${pointer.active ? 1 : 0.4})`,
          opacity: pointer.active ? 0.7 : 0,
        }}
      />

      {/* core — your logo */}
      <div
        className="absolute pointer-events-none transition-transform duration-500 ease-out"
        style={{
          top: `${CORE.top}%`, left: `${CORE.left}%`,
          transform: `translate(-50%, -50%) translate(${(pointer.x - 0.5) * 16}px, ${(pointer.y - 0.5) * 16}px)`,
        }}
      >
        <div
          className="antigravity-float flex items-center justify-center rounded-full bg-surface/10 ring-1 ring-[#B8E986]/50 shadow-[0_0_50px_rgba(184,233,134,0.25)] p-md"
          style={{ width: CORE.size, height: CORE.size, animationDuration: '8s' }}
        >
          {logoSrc ? <img src={logoSrc} alt="" className="w-full h-full object-contain" /> : <Shape shape="leaf" size={CORE.size * 0.5} className="text-[#B8E986]" />}
        </div>
      </div>

      {/* satellites */}
      {SATELLITES.map((item, i) => {
        const dx = pointer.x * 100 - item.left;
        const dy = pointer.y * 100 - item.top;
        const dist = Math.max(Math.hypot(dx, dy), 1);
        const proximity = pointer.active ? Math.max(0, 1 - dist / 30) : 0;
        const pull = pointer.active ? Math.min(36 / dist, 1) * item.depth * 28 : 0;
        const tx = pointer.active ? (dx / dist) * pull : 0;
        const ty = pointer.active ? (dy / dist) * pull : 0;
        const scale = 1 + proximity * 0.25;

        return (
          <div
            key={`${item.shape}-${i}`}
            className="absolute pointer-events-none transition-transform duration-500 ease-out"
            style={{
              top: `${item.top}%`, left: `${item.left}%`, opacity: item.opacity,
              transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale})`,
            }}
          >
            <div
              className="antigravity-float flex items-center justify-center rounded-2xl bg-surface/8 ring-1 backdrop-blur-md"
              style={{
                width: item.size, height: item.size, animationDelay: item.delay, animationDuration: item.duration,
                boxShadow: proximity > 0 ? `0 0 ${18 * proximity}px rgba(232,180,74,${0.5 * proximity})` : '0 8px 20px rgba(0,0,0,0.22)',
                borderColor: `rgba(232,180,74,${0.15 + proximity * 0.35})`,
              }}
            >
              <Shape shape={item.shape} size={item.size * 0.5} className="text-surface/85" />
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes antigravity-bob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .antigravity-float { animation-name: antigravity-bob; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @media (prefers-reduced-motion: reduce) { .antigravity-float { animation: none; } }
      `}</style>
    </div>
  );
}