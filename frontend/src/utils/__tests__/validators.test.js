import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone, passwordStrength, requiredFieldsFilled } from '../validators.js';

describe('isValidEmail', () => {
  it('accepts a well-formed email', () => {
    expect(isValidEmail('jane@example.com')).toBe(true);
  });

  it('accepts an email with surrounding whitespace', () => {
    expect(isValidEmail('  jane@example.com  ')).toBe(true);
  });

  it('rejects an email missing the @ symbol', () => {
    expect(isValidEmail('janeexample.com')).toBe(false);
  });

  it('rejects an email missing a domain', () => {
    expect(isValidEmail('jane@')).toBe(false);
  });

  it('rejects an email with a space in the local part', () => {
    expect(isValidEmail('ja ne@example.com')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts a plain 10-digit number', () => {
    expect(isValidPhone('0123456789')).toBe(true);
  });

  it('accepts a number with +, spaces, and dashes', () => {
    expect(isValidPhone('+60 12-345 6789')).toBe(true);
  });

  it('rejects a number shorter than 7 digits', () => {
    expect(isValidPhone('12345')).toBe(false);
  });

  it('rejects a number longer than 15 characters', () => {
    expect(isValidPhone('1234567890123456')).toBe(false);
  });

  it('rejects letters in the phone number', () => {
    expect(isValidPhone('012abc4567')).toBe(false);
  });
});

describe('passwordStrength', () => {
  it('returns 0 strength for an empty password', () => {
    expect(passwordStrength('')).toEqual({ strength: 0, hasLength: false, hasComplex: false });
  });

  it('gives partial credit for a short password with no complexity', () => {
    const result = passwordStrength('abc');
    expect(result.strength).toBe(20);
    expect(result.hasLength).toBe(false);
    expect(result.hasComplex).toBe(false);
  });

  it('gives full credit for a long, complex password', () => {
    const result = passwordStrength('Password1!');
    expect(result.strength).toBe(100);
    expect(result.hasLength).toBe(true);
    expect(result.hasComplex).toBe(true);
  });

  it('credits length without complexity', () => {
    const result = passwordStrength('abcdefgh');
    expect(result.strength).toBe(60);
    expect(result.hasLength).toBe(true);
    expect(result.hasComplex).toBe(false);
  });
});

describe('requiredFieldsFilled', () => {
  it('returns true when every field has a non-blank value', () => {
    expect(requiredFieldsFilled({ name: 'Jane', age: 25 })).toBe(true);
  });

  it('returns false when a field is an empty string', () => {
    expect(requiredFieldsFilled({ name: 'Jane', address: '' })).toBe(false);
  });

  it('returns false when a field is only whitespace', () => {
    expect(requiredFieldsFilled({ name: '   ' })).toBe(false);
  });

  it('returns false when a field is null or undefined', () => {
    expect(requiredFieldsFilled({ name: 'Jane', address: null })).toBe(false);
    expect(requiredFieldsFilled({ name: 'Jane', address: undefined })).toBe(false);
  });

  it('returns true for an empty fields object (vacuous truth)', () => {
    expect(requiredFieldsFilled({})).toBe(true);
  });
});
