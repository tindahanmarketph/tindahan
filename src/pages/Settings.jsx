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
  Philippines: ["Manila", "Quezon City", "Cebu", "Davao", "Makati", "Taguig"],
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
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile loading error:", error.message);
        showToast("error", "Profile error", "Unable to load your profile.");
        setLoadingProfile(false);
        return;
      }

      if (data) {
        setProfilePhoto(data.avatar_url || "");
        setUsername(data.username || user.email?.split("@")[0] || "username");
        setBio(data.bio || "");
        setCountry(data.country || data.location || "Philippines");
        setCity(data.city || "");
        setLanguage(data.language || "English");
        setShowCity(data.show_city ?? true);
      } else {
        setUsername(user.email?.split("@")[0] || "username");
      }

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

  async function uploadAvatarIfNeeded() {
    if (!profilePhotoFile || !user?.id) {
      return profilePhoto;
    }

    const fileExt = profilePhotoFile.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, profilePhotoFile, {
        cacheControl: "3600",
        upsert: true
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      throw new Error("Unable to upload your profile photo.");
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleUpdate() {
    if (!user?.id) {
      showToast("error", "Not logged in", "Please log in to update your profile.");
      return;
    }

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      showToast("error", "Missing username", "Please choose a username.");
      return;
    }

    setSaving(true);

    try {
      const finalAvatarUrl = await uploadAvatarIfNeeded();

      const locationLabel =
        showCity && city ? `${city}, ${country}` : country || "Philippines";

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          username: cleanUsername,
          bio: bio.trim(),
          avatar_url: finalAvatarUrl || null,
          country,
          city: city || null,
          language,
          show_city: showCity,
          location: locationLabel,
          updated_at: new Date().toISOString()
        });

        if (insertError) {
          console.error("Profile insert error:", insertError);
          throw insertError;
        }
      } else {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            username: cleanUsername,
            bio: bio.trim(),
            avatar_url: finalAvatarUrl || null,
            country,
            city: city || null,
            language,
            show_city: showCity,
            location: locationLabel,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Profile update error:", updateError);
          throw updateError;
        }
      }

      setProfilePhoto(finalAvatarUrl || "");
      setProfilePhotoFile(null);

      window.dispatchEvent(new Event("tindahan-profile-updated"));

      showToast(
        "success",
        "Profile updated",
        "Your changes are now visible on your public profile."
      );

      window.setTimeout(() => {
        navigate(`/profile/${cleanUsername}`);
      }, 900);
    } catch (error) {
      const message = error?.message || "Your profile could not be saved.";

      if (message.toLowerCase().includes("duplicate")) {
        showToast(
          "error",
          "Username unavailable",
          "This username is already used by another member."
        );
      } else if (message.toLowerCase().includes("bucket")) {
        showToast(
          "error",
          "Storage error",
          "The avatars bucket is missing or not configured."
        );
      } else if (
        message.toLowerCase().includes("policy") ||
        message.toLowerCase().includes("permission") ||
        message.toLowerCase().includes("row-level")
      ) {
        showToast(
          "error",
          "Permission denied",
          "Supabase Storage policies are blocking the upload."
        );
      } else {
        showToast("error", "Update failed", message);
      }
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
  const [toast, setToast] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [holidayMode, setHolidayMode] = useState(false);
  const [facebook, setFacebook] = useState("");
  const [google, setGoogle] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    async function loadAccountSettings() {
      if (!user?.id) return;

      setLoadingAccount(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          phone,
          full_name,
          gender,
          birth_date,
          holiday_mode,
          facebook_url,
          google_email
        `
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Account settings loading error:", error.message);

        showToast(
          "error",
          "Loading failed",
          "Unable to load your account settings."
        );

        setLoadingAccount(false);
        return;
      }

      if (data) {
        setPhone(data.phone || "");
        setFullName(data.full_name || "");
        setGender(data.gender || "");
        setBirthDate(data.birth_date || "");
        setHolidayMode(data.holiday_mode || false);
        setFacebook(data.facebook_url || "");
        setGoogle(data.google_email || user?.email || "");
      }

      setLoadingAccount(false);
    }

    loadAccountSettings();
  }, [user]);

  function showToast(type, title, message) {
    setToast({ type, title, message });

    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }

  async function handleSaveAccount() {
    if (!user?.id) return;

    setSaving(true);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          phone: phone.trim() || null,
          full_name: fullName.trim() || null,
          gender: gender || null,
          birth_date: birthDate || null,
          holiday_mode: holidayMode,
          facebook_url: facebook.trim() || null,
          google_email: google.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Account profile update error:", profileError.message);

        showToast(
          "error",
          "Update failed",
          "Something went wrong while saving your account settings."
        );

        setSaving(false);
        return;
      }

      if (email.trim() && email.trim() !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim()
        });

        if (emailError) {
          console.error("Email update error:", emailError.message);

          showToast(
            "error",
            "Email update pending",
            "Your profile was saved, but your email could not be changed right now."
          );

          setSaving(false);
          return;
        }
      }

      if (newPassword.trim()) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword.trim()
        });

        if (passwordError) {
          console.error("Password update error:", passwordError.message);

          showToast(
            "error",
            "Password update failed",
            "Your profile was saved, but your password could not be changed."
          );

          setSaving(false);
          return;
        }

        setNewPassword("");
      }

      showToast(
        "success",
        "Account updated",
        "Your account settings have been saved successfully."
      );

      window.dispatchEvent(new Event("tindahan-account-updated"));
    } catch (error) {
      console.error("Account save error:", error);

      showToast(
        "error",
        "Update failed",
        "Something went wrong while saving your account settings."
      );
    } finally {
      setSaving(false);
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
              className="settings-inline-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
            />
          }
        />

        <SettingsRow
          title="Phone number"
          helper="Your phone number is only used to help you sign in. It will not be made public or used for marketing purposes."
          value={
            <input
              className="settings-inline-input"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter your phone number"
            />
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
              <option value="Woman">Woman</option>
              <option value="Man">Man</option>
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
                className="settings-inline-input"
                type="date"
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
          helper="Pause your selling activity when you are away."
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
          value={
            <input
              className="settings-inline-input"
              value={facebook}
              onChange={(event) => setFacebook(event.target.value)}
              placeholder="Add your Facebook profile link"
            />
          }
        />

        <SettingsRow
          title="Google"
          value={
            <input
              className="settings-inline-input"
              value={google}
              onChange={(event) => setGoogle(event.target.value)}
              placeholder="Add your Google email"
            />
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
              className="settings-inline-input"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter a new password"
            />
          }
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          title="Delete my account"
          helper="Account deletion will be handled later."
          action={<ChevronRight size={22} />}
          danger
        />
      </SettingsCard>

      <div className="settings-save-row">
        <button
          type="button"
          className="settings-save-button"
          onClick={handleSaveAccount}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function ShippingSection() {
  return (
    <div className="settings-content-inner">
      <h2 className="settings-panel-title">My address</h2>

      <SettingsCard>
        <SettingsRow title="Add your address" action={<Plus size={22} />} />
      </SettingsCard>

      <p className="settings-small-note">
        This is the address where couriers will collect or deliver parcels. It
        may also be used for returns when needed.
      </p>

      <div className="settings-info-box">
        <Info size={18} />
        <p>
          Disabling some shipping methods may reduce your sales. If a member
          cannot buy from you because a shipping option is disabled, we may still
          suggest it to them.
        </p>
      </div>

      <h2 className="settings-panel-title">Shipping methods</h2>

      <p className="settings-panel-subtitle">
        Choose the shipping methods you want to offer for each option below.
      </p>

      <SettingsCard>
        <SettingsRow
          title="From your home"
          helper="A courier collects the parcel at your address."
          icon={<Home size={22} />}
          action={<ChevronDown size={20} />}
          muted
        />
      </SettingsCard>

      <p className="settings-small-note">
        No carrier can currently pick up parcels from your home.
      </p>

      <SettingsCard>
        <SettingsRow
          title="From a drop-off point"
          helper="You drop off your parcel at a partner point or locker."
          icon={<MapPinned size={22} />}
          action={<ChevronDown size={20} />}
        />
      </SettingsCard>

      <p className="settings-small-note settings-shipping-note">
        Some shipping methods are enabled for all sellers and cannot be disabled.
      </p>
    </div>
  );
}

function PaymentsSection() {
  return (
    <div className="settings-content-inner">
      <div className="settings-section-label">Payment options</div>

      <SettingsCard>
        <SettingsRow title="Add a card" action={<ChevronRight size={22} />} />
      </SettingsCard>

      <div className="settings-section-label">Payout methods</div>

      <SettingsCard>
        <SettingsRow
          title="Add a bank account"
          action={<ChevronRight size={22} />}
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          title="TindaHan wallet"
          icon={<WalletCards size={22} />}
          action={<ChevronRight size={22} />}
        />
      </SettingsCard>
    </div>
  );
}

function BundleDiscountsSection() {
  const [bundleEnabled, setBundleEnabled] = useState(true);

  return (
    <div className="settings-content-inner">
      <SettingsCard>
        <SettingsRow
          title="Offer bundle discounts"
          action={
            <Toggle
              active={bundleEnabled}
              onClick={() => setBundleEnabled((current) => !current)}
            />
          }
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsRow title="2 items" value={<SelectLike>5%</SelectLike>} />
        <SettingsRow title="3 items" value={<SelectLike>10%</SelectLike>} />
        <SettingsRow title="5 items" value={<SelectLike>20%</SelectLike>} />
      </SettingsCard>

      <p className="settings-small-note">
        You can offer increasing discounts based on the number of items. The
        better the discount, the more attractive your bundle becomes.
      </p>
    </div>
  );
}

function NotificationsSection() {
  const [updates, setUpdates] = useState(false);
  const [commercial, setCommercial] = useState(false);
  const [messages, setMessages] = useState(true);
  const [reviews, setReviews] = useState(true);
  const [saleFavorites, setSaleFavorites] = useState(true);
  const [favorites, setFavorites] = useState(true);
  const [followedItems, setFollowedItems] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="settings-content-inner">
      <div className="settings-section-label">Newsletter</div>

      <SettingsCard>
        <SettingsRow
          title="TindaHan updates"
          helper="Receive the latest news about new features and updates."
          action={
            <Toggle
              active={updates}
              onClick={() => setUpdates((current) => !current)}
            />
          }
        />

        <SettingsRow
          title="Commercial communications"
          helper="Receive offers, news and personalised recommendations."
          action={
            <Toggle
              active={commercial}
              onClick={() => setCommercial((current) => !current)}
            />
          }
        />
      </SettingsCard>

      <div className="settings-section-label">Important notifications</div>

      <SettingsCard>
        <SettingsRow
          title="New messages"
          action={
            <Toggle
              active={messages}
              onClick={() => setMessages((current) => !current)}
            />
          }
        />

        <SettingsRow
          title="New reviews"
          action={
            <Toggle
              active={reviews}
              onClick={() => setReviews((current) => !current)}
            />
          }
        />

        <SettingsRow
          title="Favourite items on sale"
          action={
            <Toggle
              active={saleFavorites}
              onClick={() => setSaleFavorites((current) => !current)}
            />
          }
        />
      </SettingsCard>

      <div className="settings-section-label">Secondary notifications</div>

      <SettingsCard>
        <SettingsRow
          title="Favourite items"
          action={
            <Toggle
              active={favorites}
              onClick={() => setFavorites((current) => !current)}
            />
          }
        />

        <SettingsRow
          title="New items from members I follow"
          action={
            <Toggle
              active={followedItems}
              onClick={() => setFollowedItems((current) => !current)}
            />
          }
        />

        <SettingsRow
          title="Daily limit"
          value={<SelectLike>Up to 2 notifications</SelectLike>}
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          title="Allow email notifications"
          action={
            <Toggle
              active={emailNotifications}
              onClick={() => setEmailNotifications((current) => !current)}
            />
          }
        />
      </SettingsCard>
    </div>
  );
}

function PrivacySection() {
  const [marketing, setMarketing] = useState(true);
  const [favoriteNotify, setFavoriteNotify] = useState(true);
  const [personalisation, setPersonalisation] = useState(true);
  const [recentViews, setRecentViews] = useState(true);

  return (
    <div className="settings-content-inner">
      <div className="settings-section-label">Privacy settings</div>

      <SettingsCard>
        <SettingsRow
          title="Show my items in marketing campaigns to increase my chances of selling faster"
          helper="This allows TindaHan to showcase your listings on social media and other websites."
          action={
            <Toggle
              active={marketing}
              onClick={() => setMarketing((current) => !current)}
            />
          }
        />

        <SettingsRow
          title="Notify members when I favourite their items"
          action={
            <Toggle
              active={favoriteNotify}
              onClick={() => setFavoriteNotify((current) => !current)}
            />
          }
        />

        <SettingsRow
          title="Allow TindaHan to personalise my feed and search results"
          helper="We may use your preferences, settings, purchases and platform activity."
          action={
            <Toggle
              active={personalisation}
              onClick={() => setPersonalisation((current) => !current)}
            />
          }
        />

        <SettingsRow
          title="Show recently viewed items on my homepage"
          helper="If disabled, these items will not be used to personalise your home feed."
          action={
            <Toggle
              active={recentViews}
              onClick={() => setRecentViews((current) => !current)}
            />
          }
        />

        <SettingsRow
          title="Manage account data"
          helper="Request and download a copy of your TindaHan account data."
          action={<ChevronRight size={22} />}
        />
      </SettingsCard>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="settings-content-inner">
      <h2 className="settings-panel-title">Keep your account secure</h2>

      <p className="settings-panel-subtitle">
        Check your information to protect your account.
      </p>

      <SettingsCard>
        <SettingsRow
          title="Email"
          helper="Make sure your email address is up to date."
          action={<ChevronRight size={22} />}
        />

        <SettingsRow
          title="Password"
          helper="Protect your account with a stronger password."
          action={<ChevronRight size={22} />}
        />

        <SettingsRow
          title="Two-step verification"
          helper="Secure your login with an extra verification step."
          action={<ChevronRight size={22} />}
        />

        <SettingsRow
          title="Sessions"
          helper="Manage your connected devices."
          action={<ChevronRight size={22} />}
        />
      </SettingsCard>
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
    <main className="settings-page">
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