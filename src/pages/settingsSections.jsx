import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, CreditCard, Download, Landmark, Mail, ShieldCheck, Smartphone, Trash2, WalletCards } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { ThemeChoiceCards } from "../components/ThemeControls";
import { CONTACT_EMAIL, NPC_WEBSITE } from "../content/site";

/* ---------- petits éléments identiques à ceux de Settings.jsx ---------- */
function Toggle({ active = false, onClick, label }) {
  return (
    <button
      type="button"
      className={`settings-toggle ${active ? "active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={label || (active ? "Enabled" : "Disabled")}
    >
      <span />
    </button>
  );
}

function SettingsCard({ children }) {
  return <div className="settings-card">{children}</div>;
}

function SettingsRow({ title, helper, value, action, icon, muted = false, danger = false, to, onClick }) {
  const inner = (
    <>
      {icon && <div className="settings-row-icon">{icon}</div>}
      <div className="settings-row-main">
        <strong>{title}</strong>
        {helper && <p>{helper}</p>}
      </div>
      {value && <div className="settings-row-value">{value}</div>}
      {action && <div className="settings-row-action">{action}</div>}
    </>
  );
  const cls = `settings-row ${muted ? "muted" : ""} ${danger ? "danger" : ""} ${to || onClick ? "clickable" : ""}`;

  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (onClick) return <button type="button" className={cls} onClick={onClick}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

function SoonBadge() {
  return <span className="settings-soon-badge">Coming soon</span>;
}

function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? { ...initial, ...JSON.parse(raw) } : initial;
    } catch {
      return initial;
    }
  });

  function update(patch) {
    setValue((current) => {
      const next = { ...current, ...patch };
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return [value, update];
}

/* ---------- Appearance ---------- */
export function AppearanceSection() {
  return (
    <div className="settings-content-inner">
      <h2 className="settings-panel-title">Appearance</h2>
      <p className="settings-panel-subtitle">
        Choose how TindaHan looks on this device. Dark mode is easier on the eyes at night and can save battery on OLED screens.
      </p>

      <ThemeChoiceCards />

      <p className="settings-small-note">
        Your choice is saved on this device. “Automatic” follows your phone or computer settings.
      </p>
    </div>
  );
}

/* ---------- Shipping : adresse philippine + modes de livraison ---------- */
const REGIONS = [
  "NCR – National Capital Region",
  "CAR – Cordillera Administrative Region",
  "Region I – Ilocos Region",
  "Region II – Cagayan Valley",
  "Region III – Central Luzon",
  "Region IV-A – CALABARZON",
  "MIMAROPA Region",
  "Region V – Bicol Region",
  "Region VI – Western Visayas",
  "Region VII – Central Visayas",
  "Region VIII – Eastern Visayas",
  "Region IX – Zamboanga Peninsula",
  "Region X – Northern Mindanao",
  "Region XI – Davao Region",
  "Region XII – SOCCSKSARGEN",
  "Region XIII – Caraga",
  "BARMM – Bangsamoro Autonomous Region"
];

const EMPTY_ADDRESS = {
  fullName: "", mobileNumber: "", street: "", barangay: "", city: "", province: "", region: "", postalCode: "", landmark: ""
};

export function ShippingSection() {
  const { user } = useAuth();
  const uid = user?.id || "guest";
  const [address, setAddress] = usePersistedState(`tindahan_address_${uid}`, EMPTY_ADDRESS);
  const [methods, setMethods] = usePersistedState(`tindahan_shipping_methods_${uid}`, {
    jt: true, ninja: true, lbc: true, meetup: true
  });
  const [draft, setDraft] = useState(address);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => setDraft(address), [address]);

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  function saveAddress() {
    const mobile = draft.mobileNumber.replace(/\s|-/g, "");

    if (!draft.fullName.trim() || !draft.street.trim() || !draft.barangay.trim() || !draft.city.trim() || !draft.province.trim()) {
      setMessage({ type: "error", text: "Please fill in your name, street, barangay, city and province." });
      return;
    }

    if (!/^(\+63|0)9\d{9}$/.test(mobile)) {
      setMessage({ type: "error", text: "Enter a valid mobile number, for example 0917 123 4567 or +63 917 123 4567." });
      return;
    }

    if (draft.postalCode && !/^\d{4}$/.test(draft.postalCode.trim())) {
      setMessage({ type: "error", text: "A Philippine postal code has 4 digits." });
      return;
    }

    setAddress({ ...draft, mobileNumber: mobile });
    setMessage({ type: "success", text: "Address saved." });
  }

  return (
    <div className="settings-content-inner">
      <h2 className="settings-panel-title">My address</h2>

      <SettingsCard>
        <SettingsRow title="Full name" value={<input className="settings-inline-input" value={draft.fullName} onChange={set("fullName")} placeholder="Juan Dela Cruz" autoComplete="name" />} />
        <SettingsRow title="Mobile number" value={<input type="tel" className="settings-inline-input" value={draft.mobileNumber} onChange={set("mobileNumber")} placeholder="0917 123 4567" autoComplete="tel" />} />
        <SettingsRow title="House no., street, building" value={<input className="settings-inline-input" value={draft.street} onChange={set("street")} placeholder="123 Sampaguita St., Unit 4B" autoComplete="address-line1" />} />
        <SettingsRow title="Barangay" value={<input className="settings-inline-input" value={draft.barangay} onChange={set("barangay")} placeholder="Brgy. San Antonio" />} />
        <SettingsRow title="City or municipality" value={<input className="settings-inline-input" value={draft.city} onChange={set("city")} placeholder="Quezon City" autoComplete="address-level2" />} />
        <SettingsRow title="Province" value={<input className="settings-inline-input" value={draft.province} onChange={set("province")} placeholder="Metro Manila" autoComplete="address-level1" />} />
        <SettingsRow
          title="Region"
          value={
            <select className="settings-inline-input settings-inline-select" value={draft.region} onChange={set("region")}>
              <option value="">Select a region</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          }
        />
        <SettingsRow title="Postal code" value={<input inputMode="numeric" maxLength={4} className="settings-inline-input" value={draft.postalCode} onChange={set("postalCode")} placeholder="1100" autoComplete="postal-code" />} />
        <SettingsRow title="Landmark (optional)" helper="Helps the courier find you, for example “near the barangay hall”." value={<input className="settings-inline-input" value={draft.landmark} onChange={set("landmark")} placeholder="Near Jollibee" />} />
      </SettingsCard>

      <div className="settings-save-row">
        <button type="button" className="settings-save-button" onClick={saveAddress}>Save address</button>
        {message.text && <p className={`settings-form-message ${message.type}`} role="status">{message.text}</p>}
      </div>

      <p className="settings-small-note">
        This is the address where couriers will collect or deliver parcels. It is shared only with the other member and the courier for an order. Your address is saved on this device for now.
      </p>

      <h2 className="settings-panel-title">Shipping methods</h2>
      <p className="settings-panel-subtitle">Choose the delivery options you want to offer as a seller.</p>

      <SettingsCard>
        <SettingsRow title="J&T Express drop-off" helper="You drop the parcel at a partner point." icon={<Building2 size={22} />}
          action={<Toggle active={methods.jt} onClick={() => setMethods({ jt: !methods.jt })} label="J&T Express" />} />
        <SettingsRow title="Ninja Van drop-off" helper="You drop the parcel at a Ninja Van point." icon={<Building2 size={22} />}
          action={<Toggle active={methods.ninja} onClick={() => setMethods({ ninja: !methods.ninja })} label="Ninja Van" />} />
        <SettingsRow title="LBC Express drop-off" helper="You drop the parcel at an LBC branch." icon={<Building2 size={22} />}
          action={<Toggle active={methods.lbc} onClick={() => setMethods({ lbc: !methods.lbc })} label="LBC Express" />} />
        <SettingsRow title="Safe Meet-Up" helper="Meet the buyer in a busy public place." icon={<ShieldCheck size={22} />}
          action={<Toggle active={methods.meetup} onClick={() => setMethods({ meetup: !methods.meetup })} label="Safe Meet-Up" />} />
        <SettingsRow title="Pick-up from your home" helper="A courier collects the parcel at your address." muted action={<SoonBadge />} />
      </SettingsCard>

      <p className="settings-small-note">
        Turning off delivery options may reduce your sales. Pick-up from your home is not available in your area yet.
      </p>
    </div>
  );
}

/* ---------- Payments ---------- */
export function PaymentsSection() {
  const { user } = useAuth();
  const email = user?.email;

  return (
    <div className="settings-content-inner">
      <div className="settings-section-label">Pay with</div>
      <SettingsCard>
        <SettingsRow title="GCash" helper="Pay securely with your GCash wallet at checkout." icon={<Smartphone size={22} />} value={<span className="settings-status-ok">Beta</span>} />
        <SettingsRow title="Maya" helper="Pay securely with your Maya wallet at checkout." icon={<Smartphone size={22} />} value={<span className="settings-status-ok">Beta</span>} />
        <SettingsRow title="Debit or credit card" icon={<CreditCard size={22} />} muted action={<SoonBadge />} />
      </SettingsCard>
      <p className="settings-small-note">
        You approve each payment in your GCash or Maya app. TindaHan never sees your PIN or OTP.
      </p>

      <div className="settings-section-label">Get paid</div>
      <SettingsCard>
        <SettingsRow title="TindaHan wallet" helper="Your earnings and refunds arrive here first." icon={<WalletCards size={22} />} to="/wallet" action={<span className="settings-chevron">›</span>} />
        <SettingsRow title="GCash payout" icon={<Smartphone size={22} />} muted action={<SoonBadge />} />
        <SettingsRow title="Maya payout" icon={<Smartphone size={22} />} muted action={<SoonBadge />} />
        <SettingsRow title="Bank account" icon={<Landmark size={22} />} muted action={<SoonBadge />} />
      </SettingsCard>
      <p className="settings-small-note">
        Payouts are being prepared. {email ? `Updates will be sent to ${email}.` : ""} Selling costs 0% in fees; buyers pay an 8% Buyer Protection fee.
      </p>
    </div>
  );
}

/* ---------- Bundle discounts (mêmes données que la page /bundle-discounts) ---------- */
export function BundleDiscountsSection() {
  const { user } = useAuth();
  const [state, setState] = usePersistedState(`tindahan_bundle_discounts_${user?.id || "guest"}`, {
    enabled: false, tiers: { 2: 5, 3: 10, 5: 20 }
  });
  const options = [0, 5, 10, 15, 20, 25, 30];

  return (
    <div className="settings-content-inner">
      <SettingsCard>
        <SettingsRow title="Offer bundle discounts" action={<Toggle active={state.enabled} onClick={() => setState({ enabled: !state.enabled })} label="Bundle discounts" />} />
      </SettingsCard>

      {state.enabled && (
        <SettingsCard>
          {[2, 3, 5].map((count) => (
            <SettingsRow
              key={count}
              title={`${count} items`}
              value={
                <select className="settings-inline-input settings-inline-select" value={state.tiers[count]}
                  onChange={(e) => setState({ tiers: { ...state.tiers, [count]: Number(e.target.value) } })}>
                  {options.map((o) => <option key={o} value={o}>{o === 0 ? "No discount" : `${o}%`}</option>)}
                </select>
              }
            />
          ))}
        </SettingsCard>
      )}

      <p className="settings-small-note">
        You can offer increasing discounts based on the number of items. Your choices are saved on this device. Bundle prices at checkout are being rolled out during the beta.
      </p>
    </div>
  );
}

/* ---------- Notifications ---------- */
export function NotificationsSection() {
  const { user } = useAuth();
  const [n, setN] = usePersistedState(`tindahan_notifications_${user?.id || "guest"}`, {
    messages: true, orders: true, reviews: true, favourites: true, followed: true, email: true, updates: false, commercial: false
  });
  const row = (key, title, helper) => (
    <SettingsRow title={title} helper={helper} action={<Toggle active={n[key]} onClick={() => setN({ [key]: !n[key] })} label={title} />} />
  );

  return (
    <div className="settings-content-inner">
      <div className="settings-section-label">Activity</div>
      <SettingsCard>
        {row("messages", "Messages and offers", "New messages, offers and answers.")}
        {row("orders", "Orders and delivery", "Payment, shipping, tracking and refund updates.")}
        {row("reviews", "Reviews", "When a member reviews you.")}
        {row("favourites", "Favourites", "Price drops and sales on items you saved.")}
        {row("followed", "Members you follow", "New items from members you follow.")}
      </SettingsCard>

      <div className="settings-section-label">Channels</div>
      <SettingsCard>
        {row("email", "E-mail notifications", "Important updates about your account and orders are always sent.")}
        <SettingsRow title="Push notifications" helper="On your phone or browser." muted action={<SoonBadge />} />
      </SettingsCard>

      <div className="settings-section-label">News and offers</div>
      <SettingsCard>
        {row("updates", "TindaHan news and launch updates", "Optional. You can unsubscribe at any time.")}
        {row("commercial", "Tips and promotions", "Optional. Selling tips and offers from TindaHan.")}
      </SettingsCard>

      <p className="settings-small-note">
        Your choices are saved on this device. We only send news and offers if you agreed, under the Philippine Data Privacy Act.
      </p>
    </div>
  );
}

/* ---------- Privacy + droits sur les données (Data Privacy Act) ---------- */
async function collectMyData(user) {
  const uid = user.id;
  const safe = async (label, query) => {
    try {
      const { data, error } = await query;
      return error ? { error: error.message } : data;
    } catch (e) {
      return { error: String(e?.message || e) };
    }
  };

  const local = {};
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith("tindahan_") && !key.includes("auth")) local[key] = localStorage.getItem(key);
    }
  } catch {
    /* ignore */
  }

  return {
    exportedAt: new Date().toISOString(),
    note: "Copy of the personal data TindaHan holds about you, generated from your account. For a complete export or a deletion, write to " + CONTACT_EMAIL + ".",
    account: { id: uid, email: user.email, createdAt: user.created_at },
    profile: await safe("profile", supabase.from("profiles").select("*").eq("id", uid).maybeSingle()),
    listings: await safe("listings", supabase.from("listings").select("*").eq("seller_id", uid)),
    favourites: await safe("favorites", supabase.from("favorites").select("*").eq("user_id", uid)),
    ordersAsBuyer: await safe("orders", supabase.from("orders").select("*").eq("buyer_id", uid)),
    ordersAsSeller: await safe("orders", supabase.from("orders").select("*").eq("seller_id", uid)),
    reviewsWritten: await safe("reviews", supabase.from("reviews").select("*").eq("reviewer_id", uid)),
    reviewsReceived: await safe("reviews", supabase.from("reviews").select("*").eq("reviewed_user_id", uid)),
    savedOnThisDevice: local
  };
}

export function PrivacySection() {
  const { user, profile } = useAuth();
  const [p, setP] = usePersistedState(`tindahan_privacy_${user?.id || "guest"}`, {
    marketing: true, favouriteNotify: true, personalisation: true, recentViews: true
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function downloadData() {
    if (!user) return;
    setBusy(true);
    setMessage({ type: "", text: "" });

    try {
      const data = await collectMyData(user);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tindahan-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage({ type: "success", text: "Your data was downloaded." });
    } catch {
      setMessage({ type: "error", text: "We could not prepare your data. Please try again or write to us." });
    } finally {
      setBusy(false);
    }
  }

  const username = profile?.username || user?.email?.split("@")[0] || "";
  const deleteMail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Account deletion request – ${username}`)}&body=${encodeURIComponent(
    `Hello TindaHan,\n\nI would like to delete my account and personal data.\n\nUsername: ${username}\nE-mail: ${user?.email || ""}\n\nThank you.`
  )}`;

  const row = (key, title, helper) => (
    <SettingsRow title={title} helper={helper} action={<Toggle active={p[key]} onClick={() => setP({ [key]: !p[key] })} label={title} />} />
  );

  return (
    <div className="settings-content-inner">
      <div className="settings-section-label">Privacy settings</div>
      <SettingsCard>
        {row("marketing", "Show my items in marketing campaigns to increase my chances of selling faster", "This allows TindaHan to showcase your listings on social media and other websites.")}
        {row("favouriteNotify", "Notify members when I favourite their items")}
        {row("personalisation", "Allow TindaHan to personalise my feed and search results", "We may use your preferences, settings, purchases and platform activity.")}
        {row("recentViews", "Show recently viewed items on my homepage", "If disabled, these items will not be used to personalise your home feed.")}
      </SettingsCard>

      <div className="settings-section-label">Your data</div>
      <SettingsCard>
        <SettingsRow
          title="Download my data"
          helper="Get a copy of your account data (profile, listings, favourites, orders, reviews) as a file."
          icon={<Download size={22} />}
          onClick={downloadData}
          action={<span className="settings-chevron">{busy ? "…" : "›"}</span>}
        />
        <a className="settings-row clickable danger" href={deleteMail}>
          <div className="settings-row-icon"><Trash2 size={22} /></div>
          <div className="settings-row-main">
            <strong>Request account deletion</strong>
            <p>Opens an e-mail to {CONTACT_EMAIL}. Orders in progress must be completed first.</p>
          </div>
          <div className="settings-row-action"><span className="settings-chevron">›</span></div>
        </a>
        <SettingsRow title="Privacy Center" helper="How we use your data and your rights under the Data Privacy Act." icon={<ShieldCheck size={22} />} to="/privacy" action={<span className="settings-chevron">›</span>} />
        <SettingsRow title="Cookie settings" icon={<Mail size={22} />} to="/cookie-settings" action={<span className="settings-chevron">›</span>} />
      </SettingsCard>

      {message.text && <p className={`settings-form-message ${message.type}`} role="status">{message.text}</p>}

      <p className="settings-small-note">
        You can also access, correct, object to or ask us to erase your data by writing to {CONTACT_EMAIL}. If you are not satisfied, you can complain to the{" "}
        <a href={NPC_WEBSITE} target="_blank" rel="noopener noreferrer">National Privacy Commission</a>. These switches are saved on this device.
      </p>
    </div>
  );
}

/* ---------- Security ---------- */
export function SecuritySection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  async function changePassword() {
    if (pw.next.length < 8) return setMessage({ type: "error", text: "Use at least 8 characters." });
    if (!/[A-Za-z]/.test(pw.next) || !/\d/.test(pw.next)) return setMessage({ type: "error", text: "Use letters and numbers." });
    if (pw.next !== pw.confirm) return setMessage({ type: "error", text: "The two passwords do not match." });

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setBusy(false);

    if (error) return setMessage({ type: "error", text: error.message || "We could not change your password." });

    setPw({ next: "", confirm: "" });
    setMessage({ type: "success", text: "Your password was changed." });
  }

  async function signOutEverywhere() {
    if (!window.confirm("Log out of all devices, including this one?")) return;
    await supabase.auth.signOut({ scope: "global" });
    navigate("/login");
  }

  return (
    <div className="settings-content-inner">
      <h2 className="settings-panel-title">Keep your account secure</h2>
      <p className="settings-panel-subtitle">Check your information to protect your account.</p>

      <SettingsCard>
        <SettingsRow title="E-mail" helper={user?.email || "Make sure your e-mail address is up to date."} to="/settings/account" action={<span className="settings-chevron">›</span>} />
        <SettingsRow title="Two-step verification" helper="Secure your login with an extra verification step." muted action={<SoonBadge />} />
        <SettingsRow title="Log out of all devices" helper="Use this if you lost your phone or used a shared device." onClick={signOutEverywhere} action={<span className="settings-chevron">›</span>} />
      </SettingsCard>

      <div className="settings-section-label">Change password</div>
      <SettingsCard>
        <SettingsRow title="New password" value={<input type="password" className="settings-inline-input" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" placeholder="At least 8 characters" />} />
        <SettingsRow title="Confirm password" value={<input type="password" className="settings-inline-input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" placeholder="Repeat it" />} />
      </SettingsCard>
      <div className="settings-save-row">
        <button type="button" className="settings-save-button" onClick={changePassword} disabled={busy}>{busy ? "Saving..." : "Change password"}</button>
        {message.text && <p className={`settings-form-message ${message.type}`} role="status">{message.text}</p>}
      </div>

      <div className="settings-info-box">
        <ShieldCheck size={18} />
        <p>
          Never share your password, OTP or GCash and Maya PIN, even with people who say they work for TindaHan. We will never ask for them. See{" "}
          <Link to="/trust-and-safety">Trust and safety</Link>.
        </p>
      </div>
    </div>
  );
}
