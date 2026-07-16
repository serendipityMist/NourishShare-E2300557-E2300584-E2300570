import { useRef } from 'react';

export default function OtpInput({ value, onChange, length = 6 }) {
  const inputsRef = useRef([]);

  function handleChange(index, digit) {
    const clean = digit.replace(/[^0-9]/g, '').slice(-1);
    const next = value.split('');
    next[index] = clean;
    const joined = next.join('').padEnd(length, ' ').slice(0, length);
    onChange(joined.replace(/ /g, ''));
    if (clean && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex gap-sm justify-between">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          className="w-12 h-16 text-center text-headline-md border-0 border-b-2 border-outline-variant bg-surface-container-low focus:ring-0 focus:border-primary transition-all rounded-t-lg font-headline-md"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputMode="numeric"
        />
      ))}
    </div>
  );
}
