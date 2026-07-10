import {
  Check,
  ChevronLeft,
  Clock,
  MapPin,
  MessageSquare,
  PackageCheck,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  completeOrder,
  formatOrderDate,
  formatOrderDateTime,
  getOrderById,
  markParcelDroppedOff,
  markParcelInTransit,
  markParcelReadyForPickup,
  notifyHomeDeliveryTomorrow
} from "../lib/orders";

function getReadableStatus(status) {
  const labels = {
    paid_waiting_seller: "Waiting for seller to ship",
    label_downloaded: "Shipping label downloaded",
    courier_pickup_scheduled: "Courier pick-up scheduled",
    dropped_off: "Parcel dropped off",
    in_transit: "Parcel in transit",
    ready_for_pickup: "Ready for pick-up",
    delivery_scheduled: "Delivery scheduled",
    completed: "Delivered",
    cancelled: "Cancelled"
  };

  return labels[status] || "Tracking active";
}

export default function ParcelTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [showReceivedModal, setShowReceivedModal] = useState(false);

  useEffect(() => {
    setOrder(getOrderById(orderId));
  }, [orderId]);

  const isSeller = useMemo(() => {
    return Boolean(user?.id && order?.sellerId && String(user.id) === String(order.sellerId));
  }, [user?.id, order?.sellerId]);

  const isBuyer = useMemo(() => {
    return Boolean(user?.id && order?.buyerId && String(user.id) === String(order.buyerId));
  }, [user?.id, order?.buyerId]);

  const orderedEvents = useMemo(() => {
    return [...(order?.trackingEvents || [])];
  }, [order?.trackingEvents]);

  function refreshOrder(updatedOrder) {
    if (updatedOrder) {
      setOrder(updatedOrder);
    } else {
      setOrder(getOrderById(orderId));
    }
  }

  function handleDroppedOff() {
    refreshOrder(markParcelDroppedOff(order.id, "J&T Express"));
  }

  function handleInTransit() {
    refreshOrder(markParcelInTransit(order.id));
  }

  function handleReadyForPickup() {
    refreshOrder(markParcelReadyForPickup(order.id));
  }

  function handleDeliveryTomorrow() {
    refreshOrder(notifyHomeDeliveryTomorrow(order.id));
  }

  function handleCompleteOrder() {
    refreshOrder(completeOrder(order.id));
    setShowReceivedModal(false);
  }

  function handleSaveInstructions() {
    const savedOrder = {
      ...order,
      deliveryInstructions: instructions,
      updatedAt: new Date().toISOString()
    };

    const orders = JSON.parse(localStorage.getItem("tindahan_orders") || "[]");
    const nextOrders = orders.map((item) =>
      item.id === order.id ? savedOrder : item
    );

    localStorage.setItem("tindahan_orders", JSON.stringify(nextOrders));
    setOrder(savedOrder);
    setShowInstructions(false);
  }

  if (!order) {
    return (
      <main className="parcel-tracking-page">
        <header className="parcel-tracking-header">
          <button type="button" onClick={() => navigate(-1)}>
            <ChevronLeft size={28} />
          </button>

          <h1>Track parcel</h1>

          <span />
        </header>

        <section className="parcel-tracking-empty">
          <h2>Tracking unavailable</h2>
          <p>This order could not be found.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="parcel-tracking-page">
      <header className="parcel-tracking-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={28} />
        </button>

        <h1>Track parcel</h1>

        <span />
      </header>

      <section className="parcel-tracking-help-card">
        <ShieldCheck size={20} />
        <p>
          For more information, check your carrier page or follow updates from
          your TindaHan conversation.
        </p>
      </section>

      <section className="parcel-tracking-hero">
        <span>{getReadableStatus(order.status)}</span>

        <h2>
          Estimated delivery
          <br />
          {formatOrderDate(order.estimatedDeliveryStart)} -{" "}
          {formatOrderDate(order.estimatedDeliveryEnd)}
        </h2>

        <div className="parcel-tracking-number">
          <Truck size={18} />
          <p>
            {order.carrier || "J&T Express"}
            <strong>{order.trackingNumber}</strong>
          </p>
        </div>
      </section>

      <section className="parcel-tracking-product">
        <div className="parcel-tracking-product-image">
          {order.listingPhoto ? (
            <img src={order.listingPhoto} alt={order.listingTitle} />
          ) : (
            <PackageCheck size={30} />
          )}
        </div>

        <div>
          <strong>{order.listingTitle}</strong>
          <p>₱{Number(order.total || 0).toLocaleString("en-PH")}</p>
        </div>
      </section>

      {isSeller && order.status === "paid_waiting_seller" && (
        <section className="parcel-seller-deadline">
          <Clock size={20} />

          <div>
            <strong>Your item has been sold</strong>
            <p>
              You have until {formatOrderDate(order.maxShippingDate)} to ship
              this parcel.
            </p>
          </div>
        </section>
      )}

      <section className="parcel-tracking-timeline">
        <h3>Tracking information</h3>

        <div className="parcel-timeline-list">
          {orderedEvents.map((event, index) => (
            <div className="parcel-timeline-item" key={event.id || index}>
              <div className="parcel-timeline-marker">
                <Check size={18} />
              </div>

              <div>
                <strong>{event.title}</strong>
                {event.description && <p>{event.description}</p>}
                <span>{formatOrderDateTime(event.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isSeller && order.deliveryMethod !== "meetup" && (
        <section className="parcel-actions-panel">
          <h3>Seller actions</h3>

          <button
            type="button"
            className="parcel-primary-button"
            onClick={() => navigate(`/shipping-label/${order.id}`)}
          >
            Download shipping label
          </button>

          {order.status !== "dropped_off" &&
            order.status !== "in_transit" &&
            order.status !== "ready_for_pickup" &&
            order.status !== "completed" && (
              <button
                type="button"
                className="parcel-outline-button"
                onClick={handleDroppedOff}
              >
                Mark as dropped off at J&T Express
              </button>
            )}

          {order.status === "dropped_off" && (
            <button
              type="button"
              className="parcel-outline-button"
              onClick={handleInTransit}
            >
              Simulate parcel in transit
            </button>
          )}

          {order.status === "in_transit" && order.deliveryMethod === "pickup" && (
            <button
              type="button"
              className="parcel-outline-button"
              onClick={handleReadyForPickup}
            >
              Simulate ready for pick-up
            </button>
          )}

          {order.status === "in_transit" && order.deliveryMethod !== "pickup" && (
            <button
              type="button"
              className="parcel-outline-button"
              onClick={handleDeliveryTomorrow}
            >
              Simulate delivery tomorrow
            </button>
          )}
        </section>
      )}

      {isBuyer && order.deliveryMethod !== "meetup" && (
        <section className="parcel-actions-panel">
          <h3>Buyer options</h3>

          {order.status === "delivery_scheduled" && (
            <>
              <button
                type="button"
                className="parcel-outline-button"
                onClick={() => setShowInstructions(true)}
              >
                Add delivery instructions
              </button>

              <button
                type="button"
                className="parcel-outline-button"
                onClick={() =>
                  alert("Delivery rescheduling will be available in the next prototype step.")
                }
              >
                Reschedule delivery
              </button>
            </>
          )}

          {(order.status === "ready_for_pickup" ||
            order.status === "delivery_scheduled" ||
            order.status === "in_transit") && (
            <button
              type="button"
              className="parcel-primary-button"
              onClick={() => setShowReceivedModal(true)}
            >
              Item received
            </button>
          )}
        </section>
      )}

      <section className="parcel-conversation-link">
        <button type="button" onClick={() => navigate("/messages")}>
          <MessageSquare size={18} />
          Open conversation
        </button>
      </section>

      {showInstructions && (
        <div className="parcel-modal-overlay">
          <section className="parcel-bottom-sheet">
            <h2>Delivery instructions</h2>

            <p>
              Add details to help the courier deliver your parcel safely.
            </p>

            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Example: call me before arrival, leave at guard house, gate color..."
            />

            <button type="button" onClick={handleSaveInstructions}>
              Save instructions
            </button>

            <button
              type="button"
              className="parcel-sheet-secondary"
              onClick={() => setShowInstructions(false)}
            >
              Cancel
            </button>
          </section>
        </div>
      )}

      {showReceivedModal && (
        <div className="parcel-modal-overlay">
          <section className="parcel-bottom-sheet">
            <h2>Confirm item received?</h2>

            <p>
              This will complete the transaction and release the payment to the
              seller.
            </p>

            <button type="button" onClick={handleCompleteOrder}>
              Yes, item received
            </button>

            <button
              type="button"
              className="parcel-sheet-secondary"
              onClick={() => setShowReceivedModal(false)}
            >
              Not yet
            </button>
          </section>
        </div>
      )}
    </main>
  );
}