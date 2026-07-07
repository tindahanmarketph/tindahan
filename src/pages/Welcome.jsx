import { ArrowRight, Recycle, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Welcome() {
  const { profile, user } = useAuth();

  const displayName =
    profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0];

  return (
    <main className="welcome-page">
      <section className="welcome-card">
        <div className="welcome-icon">
          <Sparkles size={34} />
        </div>

        <h1>Welcome to TindaHan{displayName ? `, ${displayName}` : ""}</h1>

        <p>
          Buy and sell second-hand items safely in the Philippines. Give your
          unused items a second life, discover unique pieces, and trade with
          confidence through TindaHan.
        </p>

        <div className="welcome-benefits">
          <div>
            <ShoppingBag size={22} />
            <strong>Sell easily</strong>
            <span>List your items and reach local buyers.</span>
          </div>

          <div>
            <ShieldCheck size={22} />
            <strong>Trade safely</strong>
            <span>Buyer Protection helps make transactions safer.</span>
          </div>

          <div>
            <Recycle size={22} />
            <strong>Second-hand first</strong>
            <span>Give clothes, gadgets and home items a new life.</span>
          </div>
        </div>

        <div className="welcome-actions">
          <Link to="/" className="welcome-primary-button">
            Start exploring <ArrowRight size={19} />
          </Link>

          <Link to="/sell" className="welcome-secondary-button">
            Sell your first item
          </Link>
        </div>
      </section>
    </main>
  );
}