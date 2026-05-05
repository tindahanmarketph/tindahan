import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <Link to="/" className="site-footer-logo">
              TindaHan
            </Link>

            <p>
              Buy and sell second-hand treasures across the Philippines with a
              local, simple and secure marketplace experience.
            </p>
          </div>

          <div className="site-footer-columns">
            <div className="site-footer-column">
              <h3>TindaHan</h3>
              <Link to="/about">About TindaHan</Link>
              <Link to="/sustainability">Sustainability</Link>
              <Link to="/press">Press</Link>
              <Link to="/advertising">Advertising</Link>
              <Link to="/accessibility">Accessibility</Link>
            </div>

            <div className="site-footer-column">
              <h3>Discover</h3>
              <Link to="/how-it-works">How it works</Link>
              <Link to="/item-verification">Item verification</Link>
              <Link to="/mobile-apps">Mobile apps</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>

            <div className="site-footer-column">
              <h3>Help</h3>
              <Link to="/help-center">Help Center</Link>
              <Link to="/sell">Sell</Link>
              <Link to="/buy">Buy</Link>
              <Link to="/trust-and-safety">Trust and safety</Link>
            </div>
          </div>
        </div>

        <div className="site-footer-middle">
          <div className="site-footer-socials">
            <a href="#" aria-label="Facebook">
              f
            </a>
            <a href="#" aria-label="LinkedIn">
              in
            </a>
            <a href="#" aria-label="Instagram">
              ◎
            </a>
          </div>

          <div className="site-footer-apps">
            <a href="#" className="app-badge">
              <span className="app-icon"></span>
              <span>
                <small>Download on the</small>
                App Store
              </span>
            </a>

            <a href="#" className="app-badge">
              <span className="app-icon">▶</span>
              <span>
                <small>Get it on</small>
                Google Play
              </span>
            </a>
          </div>
        </div>

        <div className="site-footer-bottom">
          <Link to="/privacy">Privacy Center</Link>
          <Link to="/cookies">Cookie Policy</Link>
          <Link to="/cookie-settings">Cookie Settings</Link>
          <Link to="/terms">Terms and Conditions</Link>
          <Link to="/platform">Our platform</Link>
        </div>
      </div>
    </footer>
  );
}