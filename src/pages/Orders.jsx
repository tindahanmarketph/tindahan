import {
  CheckCircle2,
  ChevronLeft,
  MapPin,
  Navigation,
  ReceiptText,
  ShieldCheck
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getStoredOrders() {
  try {
    return JSON.parse(localStorage.getItem("tindahan_orders") || "[]");
  } catch {
    return [];
  }
}

export default function Orders() {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState("purchases");
  const [activeFilter, setActiveFilter] = useState("in_progress");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(getStoredOrders());
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "completed") return order.status === "completed";
    if (activeFilter === "cancelled") return order.status === "cancelled";
    return order.status !== "completed" && order.status !== "cancelled";
  });

  function openDirections(order) {
    if (!order?.meetup?.spot?.name) return;

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        order.meetup.spot.name + " " + order.meetup.spot.address
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

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
        <button
          type="button"
          className={activeMainTab === "sales" ? "active" : ""}
          onClick={() => setActiveMainTab("sales")}
        >
          Sales
        </button>

        <button
          type="button"
          className={activeMainTab === "purchases" ? "active" : ""}
          onClick={() => setActiveMainTab("purchases")}
        >
          Purchases
        </button>
      </section>

      <section className="orders-filter-row">
        <button
          type="button"
          className={activeFilter === "all" ? "active" : ""}
          onClick={() => setActiveFilter("all")}
        >
          All
        </button>

        <button
          type="button"
          className={activeFilter === "in_progress" ? "active" : ""}
          onClick={() => setActiveFilter("in_progress")}
        >
          In progress
        </button>

        <button
          type="button"
          className={activeFilter === "cancelled" ? "active" : ""}
          onClick={() => setActiveFilter("cancelled")}
        >
          Cancelled
        </button>

        <button
          type="button"
          className={activeFilter === "completed" ? "active" : ""}
          onClick={() => setActiveFilter("completed")}
        >
          Completed
        </button>
      </section>

      {filteredOrders.length === 0 ? (
        <section className="mobile-empty-center orders-empty">
          <div className="mobile-empty-illustration purple">
            <ReceiptText size={56} />
          </div>

          <h2>No orders yet</h2>
          <p>
            {activeMainTab === "sales"
              ? "Your sales will appear here."
              : "Your purchases will appear here."}
          </p>
        </section>
      ) : (
        <section className="orders-list">
          {filteredOrders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-top">
                <div className="order-card-image">
                  {order.listingPhoto ? (
                    <img src={order.listingPhoto} alt={order.listingTitle} />
                  ) : (
                    <ReceiptText size={28} />
                  )}
                </div>

                <div>
                  <strong>{order.listingTitle}</strong>
                  <span>₱{formatPrice(order.total)}</span>
                  <p>
                    {order.deliveryMethod === "meetup"
                      ? "Safe Meet-Up"
                      : "Delivery order"}
                  </p>
                </div>
              </div>

              {order.deliveryMethod === "meetup" && order.meetup && (
                <div className="order-meetup-box">
                  <div>
                    <ShieldCheck size={19} />
                    <strong>Meet-Up Confirmed</strong>
                  </div>

                  <p>
                    <MapPin size={16} />
                    {order.meetup.spot.name}
                  </p>

                  <p>
                    {order.meetup.date} · {order.meetup.time}
                  </p>

                  <p>Safety Score: {order.meetup.spot.score}/100</p>

                  <button type="button" onClick={() => openDirections(order)}>
                    <Navigation size={16} />
                    Open Directions
                  </button>
                </div>
              )}

              {order.status === "completed" && (
                <div className="order-completed">
                  <CheckCircle2 size={17} />
                  Transaction completed
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}