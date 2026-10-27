import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Home,
  Info,
  MapPinned,
  Plus,
  User,
  WalletCards,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  BundleDiscountsSection,
  NotificationsSection,
  PaymentsSection,
  PrivacySection,
  SecuritySection,
  ShippingSection
} from "./settingsSections";

const SETTINGS_NAV = [
  { key: "profile", label: "Profile information" },
  { key: "account", label: "Account settings" },
  { key: "shipping", label: "Shipping" },
  { key: "payments", label: "Payments" },
  { key: "bundle-discounts", label: "Bundle discounts" },
  { key: "notifications", label: "Notifications" },
  { key: "privacy", label: "Privacy settings" },
  { key: "security", label: "Security" }
];

const CITIES_BY_COUNTRY = {
  Philippines: [
    "Manila", "Quezon City", "Makati", "Taguig", "Pasig", "Mandaluyong", "Caloocan", "Parañaque", "Las Piñas", "Muntinlupa", "Marikina",
    "Cebu", "Davao", "Baguio", "Iloilo", "Bacolod", "Cagayan de Oro", "Zamboanga", "General Santos", "Angeles", "Antipolo", "Dasmariñas", "Naga", "Tacloban", "Dumaguete"
  ],
  France: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice"],
  "United States": ["New York", "Los Angeles", "Miami", "San Francisco"]
};

function Toast({ type = "success", title, message, onClose }) {
  const isError = type === "error";

  return (
    <div className={`tindahan-toast ${isError ? "error" : ""}`}>
      <div className="tindahan-toast-icon">
        {isError ? <X size={21} /> : <CheckCircle2 size={22} />}
      </div>

      <div className="tindahan-toast-content">
        <strong>{title}</strong>
        <span>{message}</span>
      </div>

      <button
        type="button"
        className="tindahan-toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function Toggle({ active = false, onClick }) {
  return (
    <button
      type="button"
      className={`settings-toggle ${active ? "active" : ""}`}
      onClick={onClick}
      aria-label={active ? "Enabled" : "Disabled"}
    >
      <span />
    </button>
  );
}

function SettingsCard({ children }) {
  return <div className="settings-card">{children}</div>;
}

function SettingsRow({
  title,
  helper,
  value,
  action,
  icon,
  muted = false,
  danger = false
}) {
  return (
    <div
      className={`settings-row ${muted ? "muted" : ""} ${
        danger ? "danger" : ""
      }`}
    >
      {icon && <div className="settings-row-icon">{icon}</div>}

      <div className="settings-row-main">
        <strong>{title}</strong>
        {helper && <p>{helper}</p>}
      </div>

      {value && <div className="settings-row-value">{value}</div>}
      {action && <div className="settings-row-action">{action}</div>}
    </div>
  );
}

function SelectLike({ children }) {
  return (
    <button type="button" className="settings-select-like">
      <span>{children}</span>
      <ChevronDown size={18} />
    </button>
  );
}

function getLocalProfile() {
  try {
    const saved = localStorage.getItem("tindahan_profile");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function getLocalAccount() {
  try {
    const saved = localStorage.getItem("tindahan_account_settings");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveLocalProfile(profileData) {
  localStorage.setItem("tindahan_profile", JSON.stringify(profileData));
  window.dispatchEvent(new Event("tindahan-profile-updated"));
}

function saveLocalAccount(accountData) {
  localStorage.setItem("tindahan_account_settings", JSON.stringify(accountData));
  window.dispatchEvent(new Event("tindahan-account-updated"));
}

async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.warn("Session check error:", error.message);
      return null;
    }

    return data?.session || null;
  } catch (error) {
    console.warn("Session check failed:", error);
    return null;
  }
}

async function getProfileByUserId(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Profile fetch error:", error.message);
      return null;
    }

    return data || null;
  } catch (error) {
    console.warn("Profile fetch failed:", error);
    return null;
  }
}

async function upsertProfileSafely(userId, payload) {
  if (!userId) {
    return { success: false, error: "Missing user id" };
  }

  try {
    const existingProfile = await getProfileByUserId(userId);

    if (existingProfile) {
      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", userId);

      if (error) {
        console.warn("Supabase profile update skipped:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    }

    const { error } = await supabase.from("profiles").insert({
      id: userId,
      ...payload
    });

    if (error) {
      console.warn("Supabase profile insert skipped:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.warn("Profile upsert failed:", error);
    return {
      success: false,
      error: error?.message || "Profile could not be saved."
    };
  }
}

function ProfileSection({ user }) {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("Philippines");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("English");
  const [showCity, setShowCity] = useState(true);

  const [toast, setToast] = useState(null);

  function showToast(type, title, message) {
    setToast({ type, title, message });

    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }

  useEffect(() => {
    async function loadProfile() {
      setLoadingProfile(true);

      const localProfile = getLocalProfile();
      const supabaseProfile = user?.id ? await getProfileByUserId(user.id) : null;

      const sourceProfile = {
        ...(localProfile || {}),
        ...(supabaseProfile || {})
      };

      setProfilePhoto(
        sourceProfile.avatar_url ||
          sourceProfile.profilePhoto ||
          user?.user_metadata?.avatar_url ||
          ""
      );

      setUsername(
        sourceProfile.username ||
          user?.user_metadata?.username ||
          user?.email?.split("@")[0] ||
          "username"
      );

      setBio(sourceProfile.bio || "");
      setCountry(sourceProfile.country || "Philippines");
      setCity(sourceProfile.city || "");
      setLanguage(sourceProfile.language || "English");
      setShowCity(sourceProfile.show_city ?? sourceProfile.showCity ?? true);

      setLoadingProfile(false);
    }

    loadProfile();
  }, [user]);

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("error", "Invalid file", "Please choose an image file.");
      return;
    }

    setProfilePhotoFile(file);
    setProfilePhoto(URL.createObjectURL(file));
  }

  function handleCountryChange(event) {
    setCountry(event.target.value);
    setCity("");
  }

  async function uploadAvatarIfPossible() {
    if (!profilePhotoFile || !user?.id) {
      return profilePhoto;
    }

    try {
      const fileExt = profilePhotoFile.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, profilePhotoFile, {
          cacheControl: "3600",
          upsert: true
        });

      if (uploadError) {
        console.warn("Avatar upload skipped:", uploadError.message);
        return profilePhoto;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      return data?.publicUrl || profilePhoto;
    } catch (error) {
      console.warn("Avatar upload failed:", error);
      return profilePhoto;
    }
  }

  async function handleUpdate() {
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      showToast("error", "Missing username", "Please choose a username.");
      return;
    }

    setSaving(true);

    try {
      const finalAvatarUrl = await uploadAvatarIfPossible();

      const locationLabel =
        showCity && city ? `${city}, ${country}` : country || "Philippines";

      const localProfileData = {
        id: user?.id || null,
        username: cleanUsername,
        bio: bio.trim(),
        profilePhoto: finalAvatarUrl || "",
        avatar_url: finalAvatarUrl || "",
        country,
        city,
        language,
        showCity,
        show_city: showCity,
        location: locationLabel,
        updated_at: new Date().toISOString()
      };

      saveLocalProfile(localProfileData);

      let supabaseSaved = false;

      if (user?.id) {
        const payload = {
          username: cleanUsername,
          bio: bio.trim(),
          avatar_url: finalAvatarUrl || null,
          country,
          city: city || null,
          language,
          show_city: showCity,
          location: locationLabel,
          updated_at: new Date().toISOString()
        };

        const result = await upsertProfileSafely(user.id, payload);
        supabaseSaved = result.success;
      }

      setProfilePhoto(finalAvatarUrl || "");
      setProfilePhotoFile(null);

      showToast(
        "success",
        "Profile updated",
        supabaseSaved
          ? "Your changes are now visible on your public profile."
          : "Your changes were saved locally. Supabase did not accept one or more fields."
      );

      window.setTimeout(() => {
        navigate(`/profile/${cleanUsername}`);
      }, 900);
    } catch (error) {
      console.error("Profile save error:", error);

      showToast(
        "error",
        "Update failed",
        error?.message || "Your profile could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingProfile) {
    return (
      <div className="settings-content-inner">
        <SettingsCard>
          <div className="settings-row">
            <div className="settings-row-main">
              <strong>Loading profile...</strong>
            </div>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="settings-content-inner">
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <SettingsCard>
        <div className="settings-profile-photo-row">
          <strong>Your profile photo</strong>

          <div className="settings-profile-photo-actions">
            <button
              type="button"
              className="settings-profile-photo"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Choose a profile photo"
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" />
              ) : (
                <User size={28} />
              )}
            </button>

            <button
              type="button"
              className="settings-outline-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose a photo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="settings-hidden-input"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        <SettingsRow
          title="Username"
          value={
            <input
              className="settings-inline-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Choose your username"
            />
          }
        />

        <SettingsRow
          title="About you"
          value={
            <textarea
              className="settings-inline-input settings-inline-textarea"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Introduce yourself to other members"
              rows={3}
            />
          }
        />
      </SettingsCard>

      <div className="settings-section-label">My location</div>

      <SettingsCard>
        <SettingsRow
          title="Country"
          value={
            <select
              className="settings-inline-input settings-inline-select"
              value={country}
              onChange={handleCountryChange}
            >
              <option value="Philippines">Philippines</option>
              <option value="France">France</option>
              <option value="United States">United States</option>
            </select>
          }
        />

        <SettingsRow
          title="City"
          value={
            <select
              className="settings-inline-input settings-inline-select"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              <option value="">Select your city</option>

              {(CITIES_BY_COUNTRY[country] || []).map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          }
        />

        <SettingsRow
          title="Show city on profile"
          action={
            <Toggle
              active={showCity}
              onClick={() => setShowCity((current) => !current)}
            />
          }
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          title="Language"
          value={
            <select
              className="settings-inline-input settings-inline-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="English">English</option>
              <option value="Filipino">Filipino</option>
              <option value="French">French</option>
            </select>
          }
        />
      </SettingsCard>

      <div className="settings-save-row">
        <button
          type="button"
          className="settings-save-button"
          onClick={handleUpdate}
          disabled={saving}
        >
          {saving ? "Saving..." : "Update"}
        </button>
      </div>
    </div>
  );
}

function AccountSection({ user }) {
  const { updateProfile, loadProfile } = useAuth();

  const [loadingAccount, setLoadingAccount] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);

  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [initialPhoneNumber, setInitialPhoneNumber] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState(null);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [holidayMode, setHolidayMode] = useState(false);
  const [password, setPassword] = useState("");

  const [toast, setToast] = useState(null);

  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationSuccessOpen, setVerificationSuccessOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  function showToast(type, title, message) {
    setToast({ type, title, message });

    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }

  function normalisePhone(value) {
    return String(value || "").replace(/\s/g, "").trim();
  }

  function generateVerificationCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  useEffect(() => {
    async function loadAccountSettings() {
      setLoadingAccount(true);

      try {
        const localAccount = getLocalAccount();
        const supabaseProfile = user?.id ? await getProfileByUserId(user.id) : null;

        const source = {
          ...(localAccount || {}),
          ...(supabaseProfile || {})
        };

        const loadedPhoneNumber =
          source.phone_number ||
          source.phoneNumber ||
          user?.phone ||
          user?.user_metadata?.phone_number ||
          "";

        setEmail(source.email || user?.email || "");
        setPhoneNumber(loadedPhoneNumber);
        setInitialPhoneNumber(loadedPhoneNumber);

        setPhoneVerified(Boolean(source.phone_verified || source.phoneVerified));
        setPhoneVerifiedAt(source.phone_verified_at || source.phoneVerifiedAt || null);

        setFullName(
          source.full_name ||
            source.fullName ||
            user?.user_metadata?.full_name ||
            ""
        );

        setGender(source.gender || user?.user_metadata?.gender || "");

        setBirthDate(
          source.birth_date ||
            source.birthDate ||
            user?.user_metadata?.birth_date ||
            ""
        );

        setHolidayMode(source.holiday_mode ?? source.holidayMode ?? false);
      } catch (error) {
        console.error("Account settings loading error:", error);
      } finally {
        setLoadingAccount(false);
      }
    }

    loadAccountSettings();
  }, [user]);

  const phoneHasChanged =
    normalisePhone(phoneNumber) !== normalisePhone(initialPhoneNumber);

  const canShowVerified = phoneNumber.trim() && phoneVerified && !phoneHasChanged;

  function handlePhoneChange(event) {
    setPhoneNumber(event.target.value);

    if (
      normalisePhone(event.target.value) !== normalisePhone(initialPhoneNumber)
    ) {
      setPhoneVerified(false);
      setPhoneVerifiedAt(null);
    }
  }

  function handleStartPhoneVerification() {
    const cleanPhoneNumber = phoneNumber.trim();

    if (!cleanPhoneNumber) {
      showToast(
        "error",
        "Missing phone number",
        "Please enter your phone number before verification."
      );
      return;
    }

    if (cleanPhoneNumber.replace(/\D/g, "").length < 8) {
      showToast(
        "error",
        "Invalid phone number",
        "Please enter a valid phone number."
      );
      return;
    }

    const nextCode = generateVerificationCode();

    setVerificationCode(nextCode);
    setEnteredCode("");
    setVerificationError("");
    setVerificationOpen(true);
  }

  async function handleConfirmPhoneCode() {
    if (!enteredCode.trim()) {
      setVerificationError("Please enter the verification code.");
      return;
    }

    if (enteredCode.trim() !== verificationCode) {
      setVerificationError("The code is incorrect. Please try again.");
      return;
    }

    setVerifyingPhone(true);
    setVerificationError("");

    try {
      const verifiedAt = new Date().toISOString();
      const cleanPhoneNumber = phoneNumber.trim();

      const accountData = {
        ...getLocalAccount(),
        phoneNumber: cleanPhoneNumber,
        phone_number: cleanPhoneNumber,
        phoneVerified: true,
        phone_verified: true,
        phoneVerifiedAt: verifiedAt,
        phone_verified_at: verifiedAt,
        updated_at: new Date().toISOString()
      };

      saveLocalAccount(accountData);

      if (user?.id) {
        const { error } = await updateProfile({
          phone_number: cleanPhoneNumber,
          phone_verified: true,
          phone_verified_at: verifiedAt
        });

        if (error) {
          console.warn("Phone verification Supabase save skipped:", error.message);
        }

        await loadProfile(user.id);
      }

      setPhoneVerified(true);
      setPhoneVerifiedAt(verifiedAt);
      setInitialPhoneNumber(cleanPhoneNumber);

      setVerificationOpen(false);
      setVerificationSuccessOpen(true);
    } catch (error) {
      console.error("Phone verification error:", error);
      setVerificationError(
        error?.message || "Unable to verify this phone number."
      );
    } finally {
      setVerifyingPhone(false);
    }
  }

  async function handleSaveAccount() {
    setSavingAccount(true);

    try {
      const cleanEmail = email.trim();
      const cleanPhoneNumber = phoneNumber.trim();
      const cleanFullName = fullName.trim();
      const cleanPassword = password.trim();

      if (!cleanEmail) {
        showToast("error", "Missing email", "Please enter your email address.");
        setSavingAccount(false);
        return;
      }

      if (cleanPassword.length > 0 && cleanPassword.length < 6) {
        showToast(
          "error",
          "Password too short",
          "Your password must contain at least 6 characters."
        );
        setSavingAccount(false);
        return;
      }

      const finalPhoneVerified =
        normalisePhone(cleanPhoneNumber) === normalisePhone(initialPhoneNumber)
          ? phoneVerified
          : false;

      const accountData = {
        email: cleanEmail,
        phoneNumber: cleanPhoneNumber,
        phone_number: cleanPhoneNumber,
        phoneVerified: finalPhoneVerified,
        phone_verified: finalPhoneVerified,
        phoneVerifiedAt: finalPhoneVerified ? phoneVerifiedAt : null,
        phone_verified_at: finalPhoneVerified ? phoneVerifiedAt : null,
        fullName: cleanFullName,
        full_name: cleanFullName,
        gender,
        birthDate,
        birth_date: birthDate,
        holidayMode,
        holiday_mode: holidayMode,
        updated_at: new Date().toISOString()
      };

      saveLocalAccount(accountData);

      let supabaseSaved = false;
      let passwordUpdated = false;

      if (user?.id) {
        const profilePayload = {
          email: cleanEmail,
          phone_number: cleanPhoneNumber,
          phone_verified: finalPhoneVerified,
          phone_verified_at: finalPhoneVerified ? phoneVerifiedAt : null,
          full_name: cleanFullName,
          gender,
          birth_date: birthDate || null,
          holiday_mode: holidayMode,
          updated_at: new Date().toISOString()
        };

        const profileResult = await upsertProfileSafely(user.id, profilePayload);
        supabaseSaved = profileResult.success;

        await loadProfile(user.id);
      }

      const session = await getCurrentSession();

      if (session && cleanPassword.length > 0) {
        const { error } = await supabase.auth.updateUser({
          password: cleanPassword
        });

        if (error) {
          console.warn("Password update failed:", error.message);
          showToast(
            "error",
            "Password not updated",
            error.message || "Your password could not be updated."
          );
          setSavingAccount(false);
          return;
        }

        passwordUpdated = true;
      }

      setPassword("");

      if (!finalPhoneVerified) {
        setPhoneVerified(false);
        setPhoneVerifiedAt(null);
      }

      showToast(
        "success",
        "Account updated",
        passwordUpdated
          ? "Your account settings and password have been updated."
          : supabaseSaved
          ? "Your account settings have been saved."
          : "Your changes were saved locally. Supabase did not accept one or more fields."
      );
    } catch (error) {
      console.error("Account save error:", error);

      showToast(
        "error",
        "Update failed",
        error?.message ||
          "Something went wrong while saving your account settings."
      );
    } finally {
      setSavingAccount(false);
    }
  }

  if (loadingAccount) {
    return (
      <div className="settings-content-inner">
        <SettingsCard>
          <div className="settings-row">
            <div className="settings-row-main">
              <strong>Loading account settings...</strong>
            </div>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="settings-content-inner">
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <SettingsCard>
        <SettingsRow
          title="Email"
          helper={
            <span className="settings-verified">
              Verified <Check size={13} />
            </span>
          }
          value={
            <input
              type="email"
              className="settings-inline-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
            />
          }
        />

        <SettingsRow
          title="Phone number"
          helper={
            <span>
              Your phone number is only used to help you sign in. It will not be
              made public or used for marketing purposes.
              {canShowVerified && (
                <span className="settings-phone-verified">
                  Verified <Check size={13} />
                </span>
              )}
            </span>
          }
          value={
            <div className="settings-phone-field">
              <input
                type="tel"
                className="settings-inline-input"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="+63 9XX XXX XXXX"
              />

              <button
                type="button"
                className={
                  canShowVerified
                    ? "settings-phone-verify-button verified"
                    : "settings-phone-verify-button"
                }
                onClick={handleStartPhoneVerification}
              >
                {canShowVerified ? "Verified" : "Verify"}
              </button>
            </div>
          }
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          title="Full name"
          value={
            <input
              className="settings-inline-input"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
            />
          }
        />

        <SettingsRow
          title="You are"
          value={
            <select
              className="settings-inline-input settings-inline-select"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="">Select</option>
              <option value="Man">Man</option>
              <option value="Woman">Woman</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          }
        />

        <SettingsRow
          title="Date of birth"
          value={
            <div className="settings-date-field">
              <input
                type="date"
                className="settings-inline-input"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
              />
              <CalendarDays size={18} />
            </div>
          }
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          title="Holiday mode"
          action={
            <Toggle
              active={holidayMode}
              onClick={() => setHolidayMode((current) => !current)}
            />
          }
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          title="Facebook"
          action={
            <button type="button" className="settings-outline-button">
              Add
            </button>
          }
        />

        <SettingsRow
          title="Google"
          action={
            <button type="button" className="settings-disabled-button">
              Added
            </button>
          }
        />
      </SettingsCard>

      <p className="settings-small-note">
        Verify your profile by adding Facebook and Google accounts. These
        verifications help build trust with buyers and sellers.
      </p>

      <SettingsCard>
        <SettingsRow
          title="Password"
          helper="Leave this field empty if you do not want to change your password."
          value={
            <input
              type="password"
              className="settings-inline-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="New password"
              autoComplete="new-password"
            />
          }
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          title="Delete my account"
          action={<ChevronRight size={22} />}
          danger
        />
      </SettingsCard>

      <div className="settings-save-row">
        <button
          type="button"
          className="settings-save-button"
          onClick={handleSaveAccount}
          disabled={savingAccount}
        >
          {savingAccount ? "Saving..." : "Save"}
        </button>
      </div>

      {verificationOpen && (
        <div className="phone-verification-overlay">
          <section className="phone-verification-modal">
            <button
              type="button"
              className="phone-verification-close"
              onClick={() => setVerificationOpen(false)}
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className="phone-verification-icon">
              <CheckCircle2 size={30} />
            </div>

            <h2>Phone verification</h2>

            <p>A code has been sent to this number for verification.</p>

            <strong className="phone-verification-number">
              {phoneNumber}
            </strong>

            <div className="phone-demo-code">
              Demo code: <strong>{verificationCode}</strong>
            </div>

            <label className="phone-code-field">
              Enter the code
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={enteredCode}
                onChange={(event) => {
                  setEnteredCode(event.target.value.replace(/\D/g, ""));
                  setVerificationError("");
                }}
                placeholder="6-digit code"
                autoFocus
              />
            </label>

            {verificationError && (
              <div className="phone-verification-error">
                {verificationError}
              </div>
            )}

            <button
              type="button"
              className="phone-verification-primary"
              onClick={handleConfirmPhoneCode}
              disabled={verifyingPhone}
            >
              {verifyingPhone ? "Checking..." : "Next"}
            </button>
          </section>
        </div>
      )}

      {verificationSuccessOpen && (
        <div className="phone-verification-overlay">
          <section className="phone-verification-modal success">
            <div className="phone-verification-icon">
              <CheckCircle2 size={34} />
            </div>

            <h2>Thank you!</h2>

            <p>Your phone number is now verified.</p>

            <button
              type="button"
              className="phone-verification-primary"
              onClick={() => setVerificationSuccessOpen(false)}
            >
              Done
            </button>
          </section>
        </div>
      )}
    </div>
  );
}








export default function Settings() {
  const { section = "profile" } = useParams();
  const { user } = useAuth();

  const activeItem = useMemo(
    () => SETTINGS_NAV.find((item) => item.key === section),
    [section]
  );

  if (!activeItem) {
    return <Navigate to="/settings/profile" replace />;
  }

  return (
    <main className="settings-page settings-page-fixed">
      <div className="settings-layout">
        <aside className="settings-sidebar">
          <h1>Settings</h1>

          <nav className="settings-nav">
            {SETTINGS_NAV.map((item) => (
              <Link
                key={item.key}
                to={`/settings/${item.key}`}
                className={`settings-nav-link ${
                  item.key === section ? "active" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="settings-content">
          {section === "profile" && <ProfileSection user={user} />}
          {section === "account" && <AccountSection user={user} />}
          {section === "shipping" && <ShippingSection />}
          {section === "payments" && <PaymentsSection />}
          {section === "bundle-discounts" && <BundleDiscountsSection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "privacy" && <PrivacySection />}
          {section === "security" && <SecuritySection />}
        </section>
      </div>
    </main>
  );
}