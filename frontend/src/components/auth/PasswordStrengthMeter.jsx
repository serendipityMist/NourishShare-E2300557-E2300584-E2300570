import { passwordStrength } from '../../utils/validators';

export default function PasswordStrengthMeter({ value }) {
  const { strength, hasLength, hasComplex } = passwordStrength(value || '');

  let barColor = 'bg-outline-variant';
  let label = 'Password must be at least 8 characters';
  let labelColor = 'text-on-surface-variant';

  if (strength >= 100) {
    barColor = 'bg-primary';
    label = 'Strong password';
    labelColor = 'text-primary';
  } else if (strength >= 40) {
    barColor = 'bg-secondary-container';
    label = 'Getting better...';
    labelColor = 'text-secondary';
  } else if (strength > 0) {
    barColor = 'bg-error';
    label = 'Weak password';
    labelColor = 'text-error';
  }

  return (
    <div className="pt-sm space-y-sm">
      <div className="w-full bg-surface-container-high rounded-full overflow-hidden h-1">
        <div className={`h-full transition-all duration-300 ${barColor}`} style={{ width: `${strength}%` }} />
      </div>
      <p className={`font-label-sm text-label-sm ${labelColor}`}>{label}</p>
      <ul className="space-y-xs text-on-surface-variant font-label-sm text-label-sm">
        <li className={`flex items-center gap-xs ${hasLength ? 'text-primary' : ''}`}>
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          8+ characters
        </li>
        <li className={`flex items-center gap-xs ${hasComplex ? 'text-primary' : ''}`}>
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          Include a number or symbol
        </li>
      </ul>
    </div>
  );
}
