import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Copy, Gift, MessageCircle, Share2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { bumpInviteCount } from "../lib/walletData";

/* Inviter des amis : lien personnel + partage via les apps les plus utilisées aux Philippines */
export default function Invite() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const username = profile?.username || user?.email?.split("@")[0] || "";
  const link = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/register${username ? `?ref=${encodeURIComponent(username)}` : ""}`;
  }, [username]);

  const message = `Join me on TindaHan, the second-hand marketplace for the Philippines. 0% seller fees! ${link}`;
  const enc = encodeURIComponent;

  const channels = [
    { label: "Messenger", href: `fb-messenger://share/?link=${enc(link)}` },
    { label: "Viber", href: `viber://forward?text=${enc(message)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(message)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(link)}` },
    { label: "SMS", href: `sms:?&body=${enc(message)}` }
  ];

  async function copyLink() {
    bumpInviteCount(user?.id);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy your invite link:", link);
    }
  }

  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "TindaHan", text: "Join me on TindaHan", url: link });
        bumpInviteCount(user?.id);
      } catch {
        /* annulé */
      }
    } else {
      copyLink();
    }
  }

  return (
    <main className="mobile-subpage info-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>Invite friends</h1>
        <span />
      </header>

      <div className="info-body">
        <section className="invite-hero">
          <span className="invite-icon"><Gift size={30} /></span>
          <h2>Share TindaHan with your friends</h2>
          <p>
            Selling is free and buying is protected. The more friends and family join, the more
            sulit finds for everyone.
          </p>
        </section>

        <section className="info-section">
          <h2>Your invite link</h2>
          <div className="invite-link-box">
            <input readOnly value={link} aria-label="Your invite link" onFocus={(e) => e.target.select()} />
            <button type="button" onClick={copyLink} aria-label="Copy link">
              {copied ? <Check size={20} /> : <Copy size={20} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <button type="button" className="invite-share-main" onClick={shareNative}>
            <Share2 size={20} /> Share
          </button>
        </section>

        <section className="info-section">
          <h2>Send it with</h2>
          <div className="invite-channels">
            {channels.map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="invite-channel" onClick={() => bumpInviteCount(user?.id)}>
                <MessageCircle size={18} /> {c.label}
              </a>
            ))}
          </div>
        </section>

        <p className="info-updated">
          Invite rewards are not available yet. We will announce them in the app before they start.
        </p>
      </div>
    </main>
  );
}
