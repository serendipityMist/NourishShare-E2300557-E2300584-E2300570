import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter.jsx';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isValidPhone, requiredFieldsFilled } from '../../utils/validators';

const GENDERS = ['Male', 'Female', 'Other'];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    age: '',
    gender: '',
    occupation: '',
    householdSize: '',
    malaysianResident: true,
    twoFAEnabled: false,
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, avatar: undefined }));
  }

  function validate() {
    const next = {};
    if (!requiredFieldsFilled({ fullName: form.fullName })) next.fullName = 'Please complete all required fields';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid phone number';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match';
    if (!form.address.trim()) next.address = 'Address is required';
    if (!form.age || Number(form.age) <= 0) next.age = 'Enter a valid age';
    if (!form.gender) next.gender = 'Please select a gender';
    if (!form.occupation.trim()) next.occupation = 'Occupation is required';
    if (!form.householdSize || Number(form.householdSize) < 1) next.householdSize = 'Enter a valid household size';
    if (!avatar) next.avatar = 'Please upload a profile photo';
    if (!agreed) next.agreed = 'Please accept the Terms of Service and Privacy Policy';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', form.fullName);
      payload.append('email', form.email);
      payload.append('password', form.password);
      payload.append('address', form.address);
      payload.append('age', form.age);
      payload.append('phone', form.phone);
      payload.append('gender', form.gender);
      payload.append('occupation', form.occupation);
      payload.append('householdSize', form.householdSize);
      payload.append('malaysianResident', form.malaysianResident);
      payload.append('twoFAEnabled', form.twoFAEnabled);
      payload.append('avatar', avatar);
      await register(payload);
      // UC1 step 6-8: account is created as inactive and must be activated with OTP
      navigate('/verify-registration-otp', { state: { identity: form.email } });
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout wide>
      <div className="mb-lg">
        <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 font-label-sm text-label-sm mb-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Join SavePlate
        </span>
        <h2 className="font-headline-lg text-headline-lg text-white mb-xs">Create Account</h2>
        <p className="text-white/70 font-body-md">Fill in your details to start your digital pantry journey.</p>
      </div>

      <form className="space-y-lg w-full" onSubmit={handleSubmit} noValidate>
        {/* Account details */}
        <section className="space-y-md">
          <div className="flex items-center gap-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-300 font-label-sm text-label-sm">1</span>
            <h3 className="font-label-lg text-label-lg text-white tracking-wide">Account Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md items-start">
            <Input
              label="Full Name"
              placeholder="Susmita Shrestha"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              error={errors.fullName}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+977-XXXX-XXXX"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              error={errors.phone}
              hint={!errors.phone ? 'Used for secure collection alerts.' : undefined}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md items-start">
            <Input
              label="Email Address"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
              required
            />
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-white block">Gender</label>
              <div className="relative">
                <select
                  className="appearance-none w-full rounded-xl py-sm px-md font-body-md text-white bg-surface/5 border border-surface/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-colors"
                  value={form.gender}
                  onChange={(e) => update('gender', e.target.value)}
                >
                  <option value="" className="text-black">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g} className="text-black">{g}</option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-md top-1/2 -translate-y-1/2 w-4 h-4 text-white/50"
                  viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {errors.gender && <p className="text-label-sm text-error">{errors.gender}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md items-start">
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
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-surface/15 to-transparent" />

        {/* Personal information */}
        <section className="space-y-md">
          <div className="flex items-center gap-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-300 font-label-sm text-label-sm">2</span>
            <h3 className="font-label-lg text-label-lg text-white tracking-wide">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md items-start">
            <Input
              label="Address"
              placeholder="Gyaneshwor, Kathmandu"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              error={errors.address}
              required
            />
            <Input
              label="Occupation"
              placeholder="Enter your occupation"
              value={form.occupation}
              onChange={(e) => update('occupation', e.target.value)}
              error={errors.occupation}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md items-start">
            <Input
              label="Age"
              type="number"
              placeholder="20"
              value={form.age}
              onChange={(e) => update('age', e.target.value)}
              error={errors.age}
              required
            />
            <Input
              label="Household Size"
              type="number"
              placeholder="4"
              value={form.householdSize}
              onChange={(e) => update('householdSize', e.target.value)}
              error={errors.householdSize}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <label className="flex items-center justify-between gap-md rounded-xl border border-surface/15 bg-surface/[0.02] px-md py-xs cursor-pointer hover:border-emerald-400/40 transition-colors">
              <span className="font-label-md text-label-md text-white/80">I am a Malaysian resident</span>
              <input
                type="checkbox"
                checked={form.malaysianResident}
                onChange={(e) => update('malaysianResident', e.target.checked)}
                className="w-5 h-5 rounded-md accent-emerald-500 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between gap-md rounded-xl border border-surface/15 bg-surface/[0.02] px-md py-xs cursor-pointer hover:border-emerald-400/40 transition-colors">
              <span className="font-label-md text-label-md text-white/80">Enable Two-Factor Authentication</span>
              <input
                type="checkbox"
                checked={form.twoFAEnabled}
                onChange={(e) => update('twoFAEnabled', e.target.checked)}
                className="w-5 h-5 rounded-md accent-emerald-500 cursor-pointer"
              />
            </label>
          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-surface/15 to-transparent" />

        {/* Profile photo */}
        <section className="space-y-sm">
          <div className="flex items-center gap-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-300 font-label-sm text-label-sm">3</span>
            <h3 className="font-label-lg text-label-lg text-white tracking-wide">Profile Photo</h3>
          </div>

          <div className="flex items-center gap-lg">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400/50 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-surface/5 border border-dashed border-surface/25 flex items-center justify-center text-white/40 font-label-sm text-label-sm">
                Photo
              </div>
            )}
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="font-body-md text-white/70 file:mr-md file:py-sm file:px-md file:rounded-full file:border-0 file:bg-emerald-500/15 file:text-emerald-300 file:font-medium hover:file:bg-emerald-500/25 file:transition-colors w-full"
              />
              {errors.avatar && <p className="text-label-sm text-error mt-xs">{errors.avatar}</p>}
            </label>
          </div>
        </section>

        {/* Terms */}
        <div className="flex items-start gap-md">
          <input
            type="checkbox"
            id="tos"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 mt-1 rounded-md accent-emerald-500 focus:ring-2 focus:ring-emerald-400/30 cursor-pointer"
          />
          <label htmlFor="tos" className="font-label-md text-label-md text-white/70 cursor-pointer select-none">
            I agree to the <span className="text-emerald-300 underline decoration-emerald-400/50 hover:text-emerald-200">Terms of Service</span> and{' '}
            <span className="text-emerald-300 underline decoration-emerald-400/50 hover:text-emerald-200">Privacy Policy</span>.
          </label>
        </div>
        {errors.agreed && <p className="text-label-sm text-error -mt-md">{errors.agreed}</p>}
        {serverError && (
          <p className="text-label-sm text-error bg-error/10 border border-error/30 rounded-lg px-md py-sm">{serverError}</p>
        )}

        <div className="pt-xs space-y-sm">
          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_6px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_26px_rgba(16,185,129,0.45)] transition-all hover:-translate-y-0.5"
            disabled={submitting}
            icon={submitting ? undefined : 'arrow_forward'}
          >
            {submitting ? 'Processing...' : 'Continue'}
          </Button>
          <p className="text-center text-label-md font-label-md text-white/70">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-300 font-bold hover:text-emerald-200 hover:underline">Sign In Here</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}