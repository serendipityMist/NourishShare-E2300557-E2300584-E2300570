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
    fullName: '', phone: '', email: '', password: '', confirmPassword: '',
    address: '', age: '', gender: '', occupation: '', householdSize: '',
    malaysianResident: true, twoFAEnabled: false,
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
    <AuthLayout>
      <div className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-surface mb-xs">Create Account</h2>
        <p className="text-surface/70 font-body-md">Fill in your details to start your digital pantry journey.</p>
      </div>
      <form className="space-y-lg max-w-2xl" onSubmit={handleSubmit}>

        <div className="space-y-lg">
          <Input label="Full Name" placeholder="Susmita Shrestha" value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)} error={errors.fullName} required />

          <Input label="Phone Number" type="tel" placeholder="012-345 6789" value={form.phone}
            onChange={(e) => update('phone', e.target.value)} error={errors.phone}
            hint={!errors.phone ? 'Used for secure collection alerts.' : undefined} required />

          <Input label="Email Address" type="email" placeholder="ahmad@email.com" value={form.email}
            onChange={(e) => update('email', e.target.value)} error={errors.email} required />

          <Input label="Address" placeholder="12 Jalan Damansara, Kuala Lumpur" value={form.address}
            onChange={(e) => update('address', e.target.value)} error={errors.address} required />

          <Input label="Age" type="number" placeholder="25" value={form.age}
            onChange={(e) => update('age', e.target.value)} error={errors.age} required />

          <Input label="Household Size" type="number" placeholder="4" value={form.householdSize}
            onChange={(e) => update('householdSize', e.target.value)} error={errors.householdSize} required />
        </div>


        <div className="space-y-xs">
          <label className="font-label-md text-label-md text-surface block">Gender</label>
          <select
            className="stamped-input py-sm font-body-md text-surface bg-transparent w-full border-surface/25"
            value={form.gender}
            onChange={(e) => update('gender', e.target.value)}
          >
            <option value="" className="text-black">Select gender</option>
            {GENDERS.map((g) => (
              <option key={g} value={g} className="text-black">{g}</option>
            ))}
          </select>
          {errors.gender && <p className="text-label-sm text-error">{errors.gender}</p>}
        </div>

        <Input label="Occupation" placeholder="Software Engineer" value={form.occupation}
          onChange={(e) => update('occupation', e.target.value)} error={errors.occupation} required />

        <label className="flex items-center gap-md cursor-pointer">
          <input type="checkbox" checked={form.malaysianResident}
            onChange={(e) => update('malaysianResident', e.target.checked)}
            className="w-5 h-5 rounded-sm border-surface/30 text-primary bg-surface/10 cursor-pointer" />
          <span className="font-label-md text-label-md text-surface/70">I am a Malaysian resident</span>
        </label>

        <label className="flex items-center gap-md cursor-pointer">
          <input type="checkbox" checked={form.twoFAEnabled}
            onChange={(e) => update('twoFAEnabled', e.target.checked)}
            className="w-5 h-5 rounded-sm border-surface/30 text-primary bg-surface/10 cursor-pointer" />
          <span className="font-label-md text-label-md text-surface/70">
            Enable Two-Factor Authentication (a code will be emailed to me at login)
          </span>
        </label>

        <div className="space-y-xs">
          <label className="font-label-md text-label-md text-surface block">Profile Photo</label>
          <input type="file" accept="image/*" onChange={handleAvatarChange}
            className="font-body-md text-surface/70 file:mr-md file:py-sm file:px-md file:rounded-lg file:border-0 file:bg-surface/10 file:text-surface" />
          {avatarPreview && <img src={avatarPreview} alt="Avatar preview" className="w-16 h-16 rounded-full object-cover mt-sm" />}
          {errors.avatar && <p className="text-label-sm text-error">{errors.avatar}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
          <Input label="Password" type="password" placeholder="••••••••" value={form.password}
            onChange={(e) => update('password', e.target.value)} error={errors.password} required />
          <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)} error={errors.confirmPassword} required />
        </div>
        <PasswordStrengthMeter value={form.password} />

        <div className="flex items-start gap-md">
          <input type="checkbox" id="tos" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 mt-1 rounded-sm border-surface/30 text-primary focus:ring-primary-fixed-dim cursor-pointer bg-surface/10" />
          <label htmlFor="tos" className="font-label-md text-label-md text-surface/70 cursor-pointer select-none">
            I agree to the <span className="text-[#E8B44A] underline">Terms of Service</span> and{' '}
            <span className="text-[#E8B44A] underline">Privacy Policy</span>.
          </label>
        </div>
        {errors.agreed && <p className="text-label-sm text-error -mt-md">{errors.agreed}</p>}
        {serverError && <p className="text-label-sm text-error">{serverError}</p>}

        <div className="pt-md space-y-md">
          <Button type="submit" className="w-full" disabled={submitting} icon={submitting ? undefined : 'arrow_forward'}>
            {submitting ? 'Processing...' : 'Continue'}
          </Button>
          <p className="text-center text-label-md font-label-md text-surface/70">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E8B44A] font-bold hover:underline">Sign In Here</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}