import { ChevronLeft, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Members() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage mobile-empty-centered-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>Members</h1>

        <span />
      </header>

      <section className="mobile-empty-center">
        <div className="mobile-empty-illustration">
          <UserRound size={54} />
        </div>

        <h2>Follow your favorites</h2>
        <p>
          Tap the follow button on members’ profiles. You’ll see them here later.
        </p>
      </section>
    </main>
  );
}