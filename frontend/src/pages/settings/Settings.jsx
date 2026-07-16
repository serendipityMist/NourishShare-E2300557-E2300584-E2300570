import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'account_circle' },
  { id: 'privacy', label: 'Privacy & Visibility', icon: 'visibility' },
  { id: 'security', label: 'Security', icon: 'shield_lock' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, updatePrivacy, disableTwoFactor } = useAuth();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ fullName: user.fullName, phone: user.phone, email: user.email });

  function saveProfile(e) {
    e.preventDefault();
    updateProfile(profileForm);
    showToast('Profile updated', 'success');
  }

  function handlePrivacyChange(key, value) {
    updatePrivacy({ [key]: value });
    showToast('Privacy settings updated', 'success');
  }

  function handleDisable2fa() {
    disableTwoFactor();
    showToast('Two-factor authentication disabled', 'info');
  }

  return (
    <AppLayout title="Settings">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-xs">Account Settings</h2>
        <p className="font-body-md text-on-surface-variant">
          Manage your profile, privacy, and security preferences anytime.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-lg">
        {/* Tab nav */}
        <div className="md:w-56 flex md:flex-col gap-xs overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-sm px-md py-sm rounded-lg whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
              <span className="font-label-md text-label-md">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-white border border-outline-variant rounded-xl p-lg">
          {tab === 'profile' && (
            <form className="space-y-lg max-w-lg" onSubmit={saveProfile}>
              <h3 className="font-headline-md text-headline-md text-primary">Profile Information</h3>
              <Input
                label="Full Name"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
              />
              <Input
                label="Phone Number"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
              />
              <Input
                label="Email Address"
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
              />
              <Button type="submit" icon="save">
                Save Changes
              </Button>
            </form>
          )}

          {tab === 'privacy' && (
            <div className="space-y-xl max-w-lg">
              <h3 className="font-headline-md text-headline-md text-primary">Privacy & Visibility</h3>
              <Select
                label="Food Listing Visibility"
                value={user.privacy.foodListingVisibility}
                onChange={(e) => handlePrivacyChange('foodListingVisibility', e.target.value)}
              >
                <option value="public">Public — anyone browsing SavePlate</option>
                <option value="neighbors">Neighbors only — within 5km</option>
                <option value="private">Private — invite only</option>
              </Select>

              <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-outline-variant">
                <div>
                  <p className="font-label-md text-on-surface">Show phone number to claimers</p>
                  <p className="text-label-sm text-on-surface-variant">Allow people who claim your donations to see your phone number.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={user.privacy.showPhoneToClaimers}
                    onChange={(e) => handlePrivacyChange('showPhoneToClaimers', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-outline-variant rounded-full peer-checked:bg-primary transition-colors" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </label>
              </div>

              <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-outline-variant">
                <div>
                  <p className="font-label-md text-on-surface">Show exact pickup address</p>
                  <p className="text-label-sm text-on-surface-variant">If off, only an approximate area is shown until a claim is confirmed.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={user.privacy.showExactAddress}
                    onChange={(e) => handlePrivacyChange('showExactAddress', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-outline-variant rounded-full peer-checked:bg-primary transition-colors" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-lg max-w-lg">
              <h3 className="font-headline-md text-headline-md text-primary">Security</h3>
              <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-outline-variant">
                <div>
                  <p className="font-label-md text-on-surface">Two-Factor Authentication</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {user.twoFactorEnabled ? 'Currently enabled for your account.' : 'Currently disabled.'}
                  </p>
                </div>
                {user.twoFactorEnabled ? (
                  <Button variant="outline" onClick={handleDisable2fa}>
                    Disable
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/secure-account')}>Enable</Button>
                )}
              </div>
              <Button variant="outline" icon="lock_reset" onClick={() => navigate('/forgot-password')}>
                Change Password
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
