import { Link } from "react-router-dom";

export default function StaticPage({ title }) {
  return (
    <main className="page static-page">
      <div className="container narrow">
        <div className="static-page-card">
          <p className="static-page-kicker">TindaHan</p>

          <h1>{title}</h1>

          <p>
            This page will be completed soon. The structure is already ready so
            the footer links can work properly across the website.
          </p>

          <Link to="/" className="static-page-button">
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}