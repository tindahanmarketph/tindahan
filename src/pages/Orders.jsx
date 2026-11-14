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
  getOrderDeadlineInfo,
  getOrderStatusLabel as getStatusLabel,
  getStoredOrders,
  PRE_SHIPMENT_STATUSES,
  sweepOverdueOrders,
  TERMINAL_ORDER_STATUSES
} from "../lib/orders";
import BetaPaymentBanner from "../components/BetaPaymentBanner";
import { DB_HARDENING } from "../lib/featureFlags";

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeMainTab, setActiveMainTab] = useState("purchases");
  const [activeFilter, setActiveFilter] = useState("in_progress");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadOrders() {
    if (!user?.id) return;

    setLoadingOrders(true);
    setErrorMessage("");

    try {
      let nextOrders = await getStoredOrders(user.id);

      /* Filet de sécurité avant l'activation de la tâche planifiée SQL */
      if (!DB_HARDENING) {
        const closed = await sweepOverdueOrders(nextOrders);
        if (closed.length > 0) nextOrders = await getStoredOrders(user.id);
      }

      setOrders(nextOrders);
    } catch (error) {
      console.error("Orders loading error:", error);
      setErrorMessage(error.message || "Unable to load orders.");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

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
    if (activeFilter === "cancelled") {
      return ["cancelled", "canceled", "expired", "refunded"].includes(order.status);
    }
    return !TERMINAL_ORDER_STATUSES.includes(order.status);
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
    return getStatusLabel(order.status);
  }

  /* Montant affiché : l'acheteur voit le total payé, le vendeur le net (0 % de frais). */
  function getOrderAmountLabel(order) {
    if (activeMainTab === "sales") {
      return `You receive ₱${formatTindaHanPrice(order.itemPrice)}`;
    }
    return `₱${formatTindaHanPrice(order.total)}`;
  }

  function getDeadlineLine(order) {
    if (order.deliveryMethod === "meetup") return null;
    if (!["paid_waiting_seller", "label_downloaded", "courier_pickup_scheduled"].includes(order.status)) {
      return null;
    }

    const { deadline, daysLeft, overdue } = getOrderDeadlineInfo(order);
    if (!deadline) return null;

    if (overdue) return "Shipping deadline passed";
    if (daysLeft <= 2) return `Ship before ${formatOrderDate(deadline)} · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
    return `Ship before ${formatOrderDate(deadline)}`;
  }

  function getOrderSubtitle(order) {
    if (order.deliveryMethod === "meetup") {
      return "Safe Meet-Up";
    }

    const deadlineLine = getDeadlineLine(order);

    if (deadlineLine && order.status !== "courier_pickup_scheduled") {
      return deadlineLine;
    }

    if (order.status === "courier_pickup_scheduled") {
      return `Pick-up scheduled ${formatOrderDate(order.pickupScheduledAt)}`;
    }

    if (order.status === "expired") return "Seller did not ship in time · refunded";
    if (order.status === "cancelled") return "Order cancelled · refunded";

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

      <div className="orders-banner-wrap">
        <BetaPaymentBanner compact />
      </div>

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

      {loadingOrders ? (
        <section className="mobile-empty-center orders-empty">
          <div className="mobile-empty-illustration purple">
            <ReceiptText size={56} />
          </div>

          <h2>Loading orders...</h2>
          <p>Please wait a moment.</p>
        </section>
      ) : errorMessage ? (
        <section className="mobile-empty-center orders-empty">
          <div className="mobile-empty-illustration purple">
            <ReceiptText size={56} />
          </div>

          <h2>Unable to load orders</h2>
          <p>{errorMessage}</p>
        </section>
      ) : filteredOrders.length === 0 ? (
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
            <article
              className="order-card parcel-order-card"
              key={order.id}
              data-testid="order-card"
            >
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
                  <span>{getOrderAmountLabel(order)}</span>
                  <p className={order.status === "expired" ? "order-expired-badge" : ""}>
                    {getOrderStatusLabel(order)}
                  </p>
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
                PRE_SHIPMENT_STATUSES.includes(order.status) && (
                  <div className="seller-shipping-alert">
                    <ShieldCheck size={19} />

                    <div>
                      <strong>Your item has been sold</strong>
                      <p>
                        You have until {formatOrderDate(order.maxShippingDate)} to
                        ship this parcel. After that the order is cancelled and
                        the buyer is refunded.
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
                  order.deliveryMethod !== "meetup" &&
                  ["paid_waiting_seller", "label_downloaded", "courier_pickup_scheduled"].includes(order.status) && (
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
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <ReceiptText size={16} />
                  View order
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