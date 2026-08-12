import { useRef, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";

const TABS = [
  {
    id: "profile",
    label: "Profile",
    icon: "account_circle",
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: "visibility",
  },
  {
    id: "security",
    label: "Security",
    icon: "shield_lock",
  },
];

export default function Settings() {

  const {
    user,
    updateProfile,
    updateAvatar,
    changePassword,
    toggleTwoFactor,
    updatePrivacySettings,
  } = useAuth();

  const { showToast } = useNotifications();

  const [tab, setTab] = useState("profile");

  // ======================
  // Profile
  // ======================

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    occupation: user?.occupation || "",
    householdSize: user?.householdSize || "",
    age: user?.age || "",
  });

  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  // ======================
  // Password
  // ======================

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [privacyForm, setPrivacyForm] = useState({
    foodListingVisibility: user?.foodListingVisibility || "Community",
    twoFAEnabled: user?.twoFAEnabled || false,
  });

  // ======================
  // Save Profile
  // ======================

  async function saveProfile(e) {
    e.preventDefault();

    try {
      await updateProfile(profileForm);

      showToast("Profile updated successfully");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to update profile",
        "error"
      );
    }
  }

  // ======================
  // Upload Avatar — clicking the button opens the picker directly,
  // and selecting a file uploads it immediately (no separate "Choose File" step)
  // ======================

  function openAvatarPicker() {
    avatarInputRef.current?.click();
  }

  async function handleAvatarFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      await updateAvatar(file);
      showToast("Avatar updated successfully");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Avatar upload failed",
        "error"
      );
    } finally {
      setAvatarUploading(false);
      // reset so choosing the same file again still fires onChange
      e.target.value = "";
    }
  }

  // ======================
  // Change Password
  // ======================

  async function handlePassword(e) {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showToast("Passwords do not match", "error");
    }

    try {
      await changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword
      );

      showToast("Password changed successfully");

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to change password",
        "error"
      );
    }
  }

  // ======================
  // Toggle 2FA
  // ======================

  async function handleToggle2FA() {
    try {
      await toggleTwoFactor();

      showToast("Two-factor authentication updated");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to update settings",
        "error"
      );
    }
  }

  async function savePrivacySettings(e) {
    e.preventDefault();

    try {
      await updatePrivacySettings(privacyForm);
      showToast("Privacy settings updated successfully");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to update privacy settings",
        "error"
      );
    }
  }
    return (
    <AppLayout title="Settings">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary">
          Account Settings
        </h2>

        <p className="font-body-md text-on-surface-variant">
          Manage your SavePlate account.
        </p>
      </div>

      <div className="flex gap-lg">

        {/* Left Menu */}

        <div className="w-56 flex flex-col gap-sm">

          {TABS.map((item) => (

            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-sm rounded-lg px-md py-sm transition

              ${
                tab === item.id
                  ? "bg-primary text-white"
                  : "bg-surface-container-low"
              }`}
            >

              <span className="material-symbols-outlined">
                {item.icon}
              </span>

              {item.label}

            </button>

          ))}

        </div>

        {/* Right */}

        <div className="flex-1 bg-white rounded-xl border border-outline-variant p-xl">

          {/* ==========================
              PROFILE
          =========================== */}

          {tab === "profile" && (

            <>

              <h3 className="font-headline-md text-primary mb-lg">
                Profile Information
              </h3>

              {/* Avatar */}

              <div className="mb-xl flex items-center gap-lg">

                <img
                  src={user?.avatar}
                  alt="Avatar"
                  className="w-28 h-28 aspect-square rounded-full object-cover border"
                />

                <div className="flex flex-col gap-sm">

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="sr-only"
                  />

                  <Button
                    onClick={openAvatarPicker}
                    icon="upload"
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? "Uploading..." : "Upload Avatar"}
                  </Button>

                </div>

              </div>

              {/* Profile */}

              <form
                onSubmit={saveProfile}
                className="space-y-md max-w-xl"
              >

                <Input
                  label="Name"
                  value={profileForm.name}
                  onChange={(e)=>
                    setProfileForm({
                      ...profileForm,
                      name:e.target.value
                    })
                  }
                  variant="dark"
                />

                <Input
                  label="Email"
                  value={profileForm.email}
                  onChange={(e)=>
                    setProfileForm({
                      ...profileForm,
                      email:e.target.value
                    })
                  }
                  variant="dark"
                />

                <Input
                  label="Phone"
                  value={profileForm.phone}
                  onChange={(e)=>
                    setProfileForm({
                      ...profileForm,
                      phone:e.target.value
                    })
                  }
                  variant="dark"
                />

                <Input
                  label="Address"
                  value={profileForm.address}
                  onChange={(e)=>
                    setProfileForm({
                      ...profileForm,
                      address:e.target.value
                    })
                  }
                  variant="dark"
                />

                <Input
                  label="Occupation"
                  value={profileForm.occupation}
                  onChange={(e)=>
                    setProfileForm({
                      ...profileForm,
                      occupation:e.target.value
                    })
                  }
                  variant="dark"
                />

                <Input
                  type="number"
                  label="Age"
                  value={profileForm.age}
                  onChange={(e)=>
                    setProfileForm({
                      ...profileForm,
                      age:e.target.value
                    })
                  }
                  variant="dark"
                />

                <Input
                  type="number"
                  label="Household Size"
                  value={profileForm.householdSize}
                  onChange={(e)=>
                    setProfileForm({
                      ...profileForm,
                      householdSize:e.target.value
                    })
                  }
                  variant="dark"
                />

                <Button
                  type="submit"
                  icon="save"
                >
                  Save Changes
                </Button>

              </form>

            </>

          )}

          {/* ==========================
              PRIVACY
          =========================== */}

          {tab === "privacy" && (
            <>
              <h3 className="font-headline-md text-primary mb-lg">
                Privacy Settings
              </h3>

              <form
                onSubmit={savePrivacySettings}
                className="space-y-lg max-w-xl"
              >
                <div className="space-y-sm">
                  <label className="font-label-md text-on-surface block">
                    Food Listing Visibility
                  </label>
                  <p className="text-sm text-on-surface-variant mb-sm">
                    Control who can see food items you share or list for donation.
                  </p>
                  <select
                    className="w-full border border-outline-variant rounded-lg px-md py-sm bg-white"
                    value={privacyForm.foodListingVisibility}
                    onChange={(e) =>
                      setPrivacyForm({
                        ...privacyForm,
                        foodListingVisibility: e.target.value,
                      })
                    }
                  >
                    <option value="Public">Public — visible to everyone</option>
                    <option value="Community">Community — visible to logged-in users</option>
                    <option value="Private">Private — only visible to you</option>
                  </select>
                </div>

                <label className="flex items-center gap-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyForm.twoFAEnabled}
                    onChange={(e) =>
                      setPrivacyForm({
                        ...privacyForm,
                        twoFAEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded-sm"
                  />
                  <span className="font-label-md text-on-surface-variant">
                    Enable Two-Factor Authentication for login
                  </span>
                </label>

                <Button type="submit" icon="save">
                  Save Privacy Settings
                </Button>
              </form>
            </>
          )}

          {/* ==========================
              SECURITY
          =========================== */}

          {tab==="security" && (

            <>

              <h3 className="font-headline-md text-primary mb-lg">
                Security
              </h3>

              {/* Change Password */}

              <form
                onSubmit={handlePassword}
                className="space-y-md max-w-xl"
              >

                <Input
                  type="password"
                  label="Old Password"
                  value={passwordForm.oldPassword}
                  onChange={(e)=>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword:e.target.value
                    })
                  }
                  variant="dark"
                />

                <Input
                  type="password"
                  label="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e)=>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword:e.target.value
                    })
                  }
                  variant="dark"
                />

                <Input
                  type="password"
                  label="Confirm Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e)=>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword:e.target.value
                    })
                  }
                  variant="dark"
                />

                <Button
                  type="submit"
                  icon="lock_reset"
                >
                  Change Password
                </Button>

              </form>

              {/* Divider */}

              <div className="border-t my-xl"></div>

              {/* Two Factor */}

              <div className="flex justify-between items-center">

                <div>

                  <h4 className="font-semibold">
                    Two-Factor Authentication
                  </h4>

                  <p className="text-sm text-gray-500">

                    Status :

                    <span
                      className={`ml-2 font-semibold ${
                        user?.twoFAEnabled
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >

                      {user?.twoFAEnabled
                        ? "Enabled"
                        : "Disabled"}

                    </span>

                  </p>

                </div>

                <Button
                  variant="outline"
                  onClick={handleToggle2FA}
                >
                  {user?.twoFAEnabled
                    ? "Disable 2FA"
                    : "Enable 2FA"}
                </Button>

              </div>

            </>

          )}

        </div>

      </div>

    </AppLayout>
  );
}