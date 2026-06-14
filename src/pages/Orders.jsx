import { ChevronLeft, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage orders-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>My orders</h1>

        <span />
      </header>

      <section className="orders-tabs">
        <button type="button" className="active">Sales</button>
        <button type="button">Purchases</button>
      </section>

      <section className="orders-filter-row">
        <button type="button">All</button>
        <button type="button" className="active">In progress</button>
        <button type="button">Cancelled</button>
        <button type="button">Completed</button>
      </section>

      <section className="mobile-empty-center orders-empty">
        <div className="mobile-empty-illustration purple">
          <ReceiptText size={56} />
        </div>

        <h2>No orders yet</h2>
        <p>Your sales will appear here.</p>
      </section>
    </main>
  );
}