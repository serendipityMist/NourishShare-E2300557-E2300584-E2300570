import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter.jsx';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isValidPhone, requiredFieldsFilled } from '../../utils/validators';

export default function Register() {
  const navigate = useNavigate();
  const { register, isEmailTaken } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!requiredFieldsFilled({ fullName: form.fullName })) next.fullName = 'Please complete all required fields';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid phone number';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address';
    else if (isEmailTaken(form.email)) next.email = 'This email is already registered. Try logging in instead.';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match';
    if (!agreed) next.agreed = 'Please accept the Terms of Service and Privacy Policy';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      register(form);
      setSubmitting(false);
      navigate('/verify-email', { state: { email: form.email } });
    }, 900);
  }

  return (
    <AuthLayout>
      <div className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-surface mb-xs">Create Account</h2>
        <p className="text-surface/70 font-body-md">Fill in your details to start your digital pantry journey.</p>
      </div>
      <form className="space-y-lg" onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          placeholder="Ahmad Zulkifli"
          value={form.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          error={errors.fullName}
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="012-345 6789"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          error={errors.phone}
          hint={!errors.phone ? 'Used for secure collection alerts.' : undefined}
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="ahmad@email.com"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            error={errors.password}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            required
          />
        </div>
        <PasswordStrengthMeter value={form.password} />

        <div className="bg-surface/8 p-md rounded-lg border border-surface/20 flex gap-md items-start">
          <span className="material-symbols-outlined text-[#E8B44A]" style={{ fontVariationSettings: "'FILL' 1" }}>
            mail_lock
          </span>
          <p className="text-label-sm font-label-sm text-surface/70">
            <strong className="text-surface">Verification Required:</strong> We&apos;ll send a secure link to your email to confirm your account
            and ensure community safety.
          </p>
        </div>

        <div className="flex items-start gap-md">
          <input
            type="checkbox"
            id="tos"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 mt-1 rounded-sm border-surface/30 text-primary focus:ring-primary-fixed-dim cursor-pointer bg-surface/10"
          />
          <label htmlFor="tos" className="font-label-md text-label-md text-surface/70 cursor-pointer select-none">
            I agree to the <span className="text-[#E8B44A] underline">Terms of Service</span> and{' '}
            <span className="text-[#E8B44A] underline">Privacy Policy</span>.
          </label>
        </div>
        {errors.agreed && <p className="text-label-sm text-error -mt-md">{errors.agreed}</p>}

        <div className="pt-md space-y-md">
          <Button type="submit" className="w-full" disabled={submitting} icon={submitting ? undefined : 'arrow_forward'}>
            {submitting ? 'Processing...' : 'Continue'}
          </Button>
          <p className="text-center text-label-md font-label-md text-surface/70">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E8B44A] font-bold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}