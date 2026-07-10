import {
  CheckCircle2,
  ChevronLeft,
  Download,
  MapPin,
  Navigation,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  formatOrderDate,
  formatOrderDateTime,
  formatTindaHanPrice,
  getStoredOrders
} from "../lib/orders";

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeMainTab, setActiveMainTab] = useState("purchases");
  const [activeFilter, setActiveFilter] = useState("in_progress");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(getStoredOrders());
  }, []);

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeMainTab === "sales") {
        return String(order.sellerId || "") === String(user?.id || "");
      }

      return String(order.buyerId || "") === String(user?.id || "");
    });
  }, [orders, activeMainTab, user?.id]);

  const filteredOrders = visibleOrders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "completed") return order.status === "completed";
    if (activeFilter === "cancelled") return order.status === "cancelled";
    return order.status !== "completed" && order.status !== "cancelled";
  });

  function openDirections(order) {
    if (!order?.meetup?.spot?.name) return;

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${order.meetup.spot.name} ${order.meetup.spot.address || ""}`
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function getOrderStatusLabel(order) {
    const labels = {
      paid_waiting_seller: "Paid · waiting for seller",
      label_downloaded: "Shipping label downloaded",
      courier_pickup_scheduled: "Courier pick-up scheduled",
      dropped_off: "Dropped off",
      in_transit: "In transit",
      ready_for_pickup: "Ready for pick-up",
      delivery_scheduled: "Delivery scheduled",
      meetup_request_sent: "Meet-Up request sent",
      completed: "Completed",
      cancelled: "Cancelled"
    };

    return labels[order.status] || "In progress";
  }

  function getOrderSubtitle(order) {
    if (order.deliveryMethod === "meetup") {
      return "Safe Meet-Up";
    }

    if (order.status === "paid_waiting_seller") {
      return `Ship before ${formatOrderDate(order.maxShippingDate)}`;
    }

    if (order.status === "courier_pickup_scheduled") {
      return `Pick-up scheduled ${formatOrderDate(order.pickupScheduledAt)}`;
    }

    return order.carrier || "J&T Express";
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
            <article className="order-card parcel-order-card" key={order.id}>
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
                  <span>₱{formatTindaHanPrice(order.total)}</span>
                  <p>{getOrderStatusLabel(order)}</p>
                </div>
              </div>

              <div className="parcel-order-meta">
                <div>
                  <PackageCheck size={17} />
                  <span>{getOrderSubtitle(order)}</span>
                </div>

                {order.trackingNumber && (
                  <div>
                    <Truck size={17} />
                    <span>{order.trackingNumber}</span>
                  </div>
                )}

                {order.createdAt && (
                  <div>
                    <ReceiptText size={17} />
                    <span>Ordered {formatOrderDateTime(order.createdAt)}</span>
                  </div>
                )}
              </div>

              {activeMainTab === "sales" &&
                order.deliveryMethod !== "meetup" &&
                order.status === "paid_waiting_seller" && (
                  <div className="seller-shipping-alert">
                    <ShieldCheck size={19} />

                    <div>
                      <strong>Your item has been sold</strong>
                      <p>
                        You have until {formatOrderDate(order.maxShippingDate)} to
                        ship this parcel.
                      </p>
                    </div>
                  </div>
                )}

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

              <div className="parcel-order-actions">
                {activeMainTab === "sales" &&
                  order.deliveryMethod !== "meetup" && (
                    <button
                      type="button"
                      className="parcel-outline-button"
                      onClick={() => navigate(`/shipping-label/${order.id}`)}
                    >
                      <Download size={16} />
                      Download shipping label
                    </button>
                  )}

                <button
                  type="button"
                  className="parcel-primary-button"
                  onClick={() => navigate(`/tracking/${order.id}`)}
                >
                  <Truck size={16} />
                  Track parcel
                </button>
              </div>

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