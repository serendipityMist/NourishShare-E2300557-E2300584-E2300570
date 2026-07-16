export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value) {
  return /^[0-9+\-\s]{7,15}$/.test(value.trim());
}

export function passwordStrength(value) {
  let strength = 0;
  const hasLength = value.length >= 8;
  const hasComplex = /[0-9!@#$%^&*(),.?":{}|<>]/.test(value);
  if (value.length > 0) strength += 20;
  if (hasLength) strength += 40;
  if (hasComplex) strength += 40;
  return { strength, hasLength, hasComplex };
}

export function requiredFieldsFilled(fields) {
  return Object.values(fields).every((v) => String(v ?? '').trim().length > 0);
}
