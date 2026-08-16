import {
  Check,
  ChevronLeft,
  Clock,
  MapPin,
  MessageSquare,
  PackageCheck,
  ShieldCheck,
  Truck,
  X
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
  markParcelDelivered,
  notifyHomeDeliveryTomorrow
} from "../lib/orders";

const TRACKING_VISIBLE_STATUSES = [
  "dropped_off",
  "in_transit",
  "ready_for_pickup",
  "delivery_scheduled",
  "delivered",
  "completed",
  "refund_requested"
];

const DROP_OFF_POINTS = [
  {
    id: "jt-makati-ave",
    carrier: "J&T Express",
    name: "J&T Express - Makati Avenue",
    address: "Makati Avenue, Makati City, Metro Manila"
  },
  {
    id: "ninja-bgc",
    carrier: "Ninja Van",
    name: "Ninja Van Drop-Off - BGC",
    address: "Bonifacio Global City, Taguig, Metro Manila"
  },
  {
    id: "lbc-greenbelt",
    carrier: "LBC Express",
    name: "LBC Express - Greenbelt",
    address: "Greenbelt, Ayala Center, Makati City"
  }
];

function getReadableStatus(status) {
  const labels = {
    paid_waiting_seller: "Waiting for seller to ship",
    label_downloaded: "Shipping label downloaded",
    courier_pickup_scheduled: "Courier pick-up scheduled",
    dropped_off: "Order shipped",
    in_transit: "Parcel in transit",
    ready_for_pickup: "Parcel arrived",
    delivery_scheduled: "Delivery scheduled",
    delivered: "Parcel delivered",
    completed: "Order completed",
    refund_requested: "Problem reported",
    cancelled: "Cancelled"
  };

  return labels[status] || "Tracking active";
}

function canTrackParcel(order) {
  return TRACKING_VISIBLE_STATUSES.includes(order?.status);
}

function canSellerPrepareShipment(order) {
  return [
    "paid_waiting_seller",
    "label_downloaded",
    "courier_pickup_scheduled"
  ].includes(order?.status);
}

function getBuyerReviewDeadline(order) {
  const baseDate =
    order?.estimatedDeliveryEnd ||
    order?.estimatedDeliveryStart ||
    order?.updatedAt ||
    new Date().toISOString();

  const deadline = new Date(baseDate);
  deadline.setDate(deadline.getDate() + 2);

  return deadline.toISOString();
}

function getPickupPointText(order) {
  if (order?.status !== "ready_for_pickup") return "";

  const carrier = order?.carrier || "the selected pick-up point";

  return `Your parcel is waiting at ${carrier}.`;
}

function getCleanTrackingDescription(description) {
  if (!description) return "";

  if (typeof description !== "string") {
    return "";
  }

  const trimmedDescription = description.trim();

  if (!trimmedDescription) return "";

  if (
    (trimmedDescription.startsWith("{") && trimmedDescription.endsWith("}")) ||
    trimmedDescription.includes('"reason"') ||
    trimmedDescription.includes('"details"')
  ) {
    try {
      const parsed = JSON.parse(trimmedDescription);
      const reason = parsed.reason || "Issue reported";
      const details = parsed.details || "";

      if (details) {
        return `The buyer reported a problem: ${reason}. ${details}`;
      }

      return `The buyer reported a problem: ${reason}. TindaHan will review the evidence.`;
    } catch {
      return "The buyer reported a problem with this order. TindaHan will review the evidence.";
    }
  }

  return description;
}

export default function ParcelTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingAction, setLoadingAction] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [showReceivedModal, setShowReceivedModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      setLoadingOrder(true);

      try {
        const loadedOrder = await getOrderById(orderId);

        if (mounted) {
          setOrder(loadedOrder);
          setInstructions(loadedOrder?.deliveryInstructions || "");
        }
      } catch (error) {
        console.error("Tracking order loading error:", error);

        if (mounted) {
          setOrder(null);
        }
      } finally {
        if (mounted) {
          setLoadingOrder(false);
        }
      }
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const isSeller = useMemo(() => {
    return Boolean(
      user?.id &&
        order?.sellerId &&
        String(user.id) === String(order.sellerId)
    );
  }, [user?.id, order?.sellerId]);

  const isBuyer = useMemo(() => {
    return Boolean(
      user?.id &&
        order?.buyerId &&
        String(user.id) === String(order.buyerId)
    );
  }, [user?.id, order?.buyerId]);

  const trackingAvailable = canTrackParcel(order);

  const orderedEvents = useMemo(() => {
    return [...(order?.trackingEvents || [])];
  }, [order?.trackingEvents]);

  const buyerReviewDeadline = useMemo(() => {
    return getBuyerReviewDeadline(order);
  }, [order]);

  async function refreshOrder(updatedOrder = null) {
    if (updatedOrder) {
      setOrder(updatedOrder);
      return updatedOrder;
    }

    const freshOrder = await getOrderById(orderId);
    setOrder(freshOrder);
    return freshOrder;
  }

  async function handleDroppedOff(point = DROP_OFF_POINTS[0]) {
    if (!order?.id || loadingAction) return;

    setLoadingAction("dropoff");

    try {
      const updatedOrder = await markParcelDroppedOff(
        order.id,
        point.carrier,
        point
      );

      await refreshOrder(updatedOrder);
    } catch (error) {
      console.error("Drop-off update error:", error);
      alert(error.message || "Unable to mark this parcel as dropped off.");
    } finally {
      setLoadingAction("");
    }
  }

  async function handleInTransit() {
    if (!order?.id || loadingAction) return;

    setLoadingAction("in_transit");

    try {
      const updatedOrder = await markParcelInTransit(order.id);
      await refreshOrder(updatedOrder);
    } catch (error) {
      console.error("In transit update error:", error);
      alert(error.message || "Unable to update parcel status.");
    } finally {
      setLoadingAction("");
    }
  }

  async function handleReadyForPickup() {
    if (!order?.id || loadingAction) return;

    setLoadingAction("ready_for_pickup");

    try {
      const updatedOrder = await markParcelReadyForPickup(order.id);
      await refreshOrder(updatedOrder);
    } catch (error) {
      console.error("Ready for pickup update error:", error);
      alert(error.message || "Unable to update parcel status.");
    } finally {
      setLoadingAction("");
    }
  }

  async function handleDeliveryTomorrow() {
    if (!order?.id || loadingAction) return;

    setLoadingAction("delivery_tomorrow");

    try {
      const updatedOrder = await notifyHomeDeliveryTomorrow(order.id);
      await refreshOrder(updatedOrder);
    } catch (error) {
      console.error("Delivery update error:", error);
      alert(error.message || "Unable to update parcel status.");
    } finally {
      setLoadingAction("");
    }
  }

  async function handleDelivered() {
    if (!order?.id || loadingAction) return;

    setLoadingAction("delivered");

    try {
      const updatedOrder = await markParcelDelivered(order.id);
      await refreshOrder(updatedOrder);
    } catch (error) {
      console.error("Delivered update error:", error);
      alert(error.message || "Unable to update parcel status.");
    } finally {
      setLoadingAction("");
    }
  }

  async function handleCompleteOrder() {
    if (!order?.id || loadingAction) return;

    setLoadingAction("complete");

    try {
      const updatedOrder = await completeOrder(order.id);
      await refreshOrder(updatedOrder);
      setShowReceivedModal(false);
    } catch (error) {
      console.error("Complete order error:", error);
      alert(error.message || "Unable to complete this order.");
    } finally {
      setLoadingAction("");
    }
  }

  function handleSaveInstructions() {
    const savedOrder = {
      ...order,
      deliveryInstructions: instructions,
      updatedAt: new Date().toISOString()
    };

    setOrder(savedOrder);
    setShowInstructions(false);
  }

  function renderTrackingEvent(event, index) {
    const cleanDescription = getCleanTrackingDescription(event.description);

    return (
      <div className="parcel-timeline-item" key={event.id || index}>
        <div className="parcel-timeline-marker">
          <Check size={18} />
        </div>

        <div>
          <strong>{event.title}</strong>
          {cleanDescription && <p>{cleanDescription}</p>}
          <span>{formatOrderDateTime(event.date)}</span>
        </div>
      </div>
    );
  }

  function renderBuyerPendingSummaryCard() {
    return (
      <section className="parcel-order-summary-card">
        <div className="parcel-order-product-row">
          <div className="parcel-order-product-image">
            {order.listingPhoto ? (
              <img src={order.listingPhoto} alt={order.listingTitle} />
            ) : (
              <PackageCheck size={30} />
            )}
          </div>

          <div className="parcel-order-product-info">
            <strong>{order.listingTitle}</strong>
            <span>₱{Number(order.total || 0).toLocaleString("en-PH")}</span>
          </div>
        </div>

        <div className="parcel-order-status-row">
          <div className="parcel-order-status-icon">
            <ShieldCheck size={18} />
          </div>

          <div>
            <strong>Purchase successful</strong>
            <p>
              Your purchase is confirmed. The seller must send the parcel before{" "}
              {formatOrderDate(order.maxShippingDate)}. Tracking will become
              available once the seller drops off the parcel.
            </p>
          </div>
        </div>
      </section>
    );
  }

  function renderBuyerReviewCard() {
    const pickupPointText = getPickupPointText(order);
    const isRefundRequested = order.status === "refund_requested";

    if (isRefundRequested) {
      return (
        <section className="buyer-vinted-order-card">
          <strong>Problem reported</strong>

          <p>
            Your report has been sent. The payment remains protected while
            TindaHan reviews the case.
          </p>
        </section>
      );
    }

    if (order.status === "ready_for_pickup") {
      return (
        <section className="buyer-vinted-order-card">
          <strong>Your parcel has arrived!</strong>

          <p>
            {pickupPointText ||
              "Your parcel is waiting at the selected pick-up point."}
          </p>

          <button
            type="button"
            className="parcel-primary-button"
            onClick={() => setShowReceivedModal(true)}
          >
            Item received
          </button>

          <button
            type="button"
            className="vinted-problem-button"
            onClick={() => navigate(`/refund-request/${order.id}`)}
          >
            I have a problem
          </button>
        </section>
      );
    }

    if (order.status === "delivered") {
      return (
        <section className="buyer-vinted-order-card">
          <strong>
            Check your order before {formatOrderDate(buyerReviewDeadline)}
          </strong>

          <p>
            If your order matches its description, confirm that everything is
            okay. Report a problem if it does not match what you expected.
          </p>

          <button
            type="button"
            className="parcel-primary-button"
            onClick={() => setShowReceivedModal(true)}
          >
            Everything is OK
          </button>

          <button
            type="button"
            className="vinted-problem-button"
            onClick={() => navigate(`/refund-request/${order.id}`)}
          >
            I have a problem
          </button>
        </section>
      );
    }

    if (
      order.status === "delivery_scheduled" ||
      order.status === "in_transit" ||
      order.status === "dropped_off"
    ) {
      return (
        <section className="buyer-vinted-order-card">
          <strong>{getReadableStatus(order.status)}</strong>

          <p>
            Your parcel is on its way. You will be able to confirm the order or
            report a problem once the parcel has been delivered or is ready for
            pick-up.
          </p>
        </section>
      );
    }

    return null;
  }

  if (loadingOrder) {
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
          <h2>Loading tracking...</h2>
          <p>Please wait a moment.</p>
        </section>
      </main>
    );
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

  if (isBuyer && !trackingAvailable && order.deliveryMethod !== "meetup") {
    return (
      <main className="parcel-tracking-page">
        <header className="parcel-tracking-header">
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
            <ChevronLeft size={28} />
          </button>

          <h1>Order update</h1>

          <span />
        </header>

        {renderBuyerPendingSummaryCard()}

        <section className="parcel-tracking-timeline muted">
          <h3>Order information</h3>

          <div className="parcel-timeline-list">
            {orderedEvents.map(renderTrackingEvent)}
          </div>
        </section>

        <section className="parcel-conversation-link">
          <button type="button" onClick={() => navigate("/messages")}>
            <MessageSquare size={18} />
            Open conversation
          </button>
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

        <h1>{trackingAvailable ? "Track parcel" : "Seller shipping"}</h1>

        <span />
      </header>

      {!isBuyer && (
        <section className="parcel-tracking-help-card">
          <ShieldCheck size={20} />
          <p>
            {trackingAvailable
              ? "For more information, check your carrier page or follow updates from your TindaHan conversation."
              : `The buyer has paid. Deposit the parcel before ${formatOrderDate(
                  order.maxShippingDate
                )}. Tracking will start after drop-off.`}
          </p>
        </section>
      )}

      {isBuyer && trackingAvailable && order.deliveryMethod !== "meetup" ? (
        renderBuyerReviewCard()
      ) : (
        <>
          <section className="parcel-tracking-hero">
            <span>{getReadableStatus(order.status)}</span>

            {trackingAvailable ? (
              <>
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
              </>
            ) : (
              <>
                <h2>
                  Ship before
                  <br />
                  {formatOrderDate(order.maxShippingDate)}
                </h2>

                <div className="parcel-tracking-number inactive">
                  <Clock size={18} />
                  <p>
                    Tracking not active yet
                    <strong>Deposit the parcel first</strong>
                  </p>
                </div>
              </>
            )}
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
        </>
      )}

      {isSeller && !trackingAvailable && order.deliveryMethod !== "meetup" && (
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
        <h3>{trackingAvailable ? "Tracking information" : "Order information"}</h3>

        <div className="parcel-timeline-list">
          {orderedEvents.map(renderTrackingEvent)}
        </div>
      </section>

      {isSeller && order.deliveryMethod !== "meetup" && (
        <section className="parcel-actions-panel">
          <h3>Seller actions</h3>

          {canSellerPrepareShipment(order) && (
            <>
              <button
                type="button"
                className="parcel-primary-button"
                onClick={() => navigate(`/shipping-label/${order.id}`)}
              >
                Download shipping label
              </button>

              <div className="parcel-dropoff-quick-list">
                <strong>Confirm drop-off at a relay point</strong>

                {DROP_OFF_POINTS.map((point) => (
                  <button
                    key={point.id}
                    type="button"
                    className="parcel-outline-button"
                    disabled={Boolean(loadingAction)}
                    onClick={() => handleDroppedOff(point)}
                  >
                    <MapPin size={17} />
                    {loadingAction === "dropoff"
                      ? "Confirming..."
                      : `Dropped off at ${point.carrier}`}
                  </button>
                ))}
              </div>
            </>
          )}

          {order.status === "dropped_off" && (
            <button
              type="button"
              className="parcel-outline-button"
              disabled={Boolean(loadingAction)}
              onClick={handleInTransit}
            >
              Simulate parcel in transit
            </button>
          )}

          {order.status === "in_transit" && order.deliveryMethod === "pickup" && (
            <button
              type="button"
              className="parcel-outline-button"
              disabled={Boolean(loadingAction)}
              onClick={handleReadyForPickup}
            >
              Simulate ready for pick-up
            </button>
          )}

          {order.status === "in_transit" && order.deliveryMethod !== "pickup" && (
            <button
              type="button"
              className="parcel-outline-button"
              disabled={Boolean(loadingAction)}
              onClick={handleDeliveryTomorrow}
            >
              Simulate delivery tomorrow
            </button>
          )}

          {order.status === "delivery_scheduled" && (
            <button
              type="button"
              className="parcel-outline-button"
              disabled={Boolean(loadingAction)}
              onClick={handleDelivered}
            >
              {loadingAction === "delivered"
                ? "Confirming..."
                : "Simulate parcel delivered"}
            </button>
          )}

          {!canSellerPrepareShipment(order) &&
            !["dropped_off", "in_transit", "delivery_scheduled"].includes(
              order.status
            ) && (
              <p className="refund-status-note">
                No seller action is required for this order at the moment.
              </p>
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
            <button
              type="button"
              className="parcel-sheet-close"
              onClick={() => setShowInstructions(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2>Delivery instructions</h2>

            <p>Add details to help the courier deliver your parcel safely.</p>

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
          <section className="parcel-bottom-sheet order-acceptance-sheet">
            <button
              type="button"
              className="parcel-sheet-close"
              onClick={() => setShowReceivedModal(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="order-acceptance-illustration" aria-hidden="true">
              <div className="order-acceptance-person">
                <div className="person-hair" />
                <div className="person-head" />
                <div className="person-body" />
                <div className="person-phone" />
              </div>

              <div className="order-acceptance-box" />
            </div>

            <h2>Confirm order acceptance</h2>

            <p>
              Your payment will be released to the seller and you will no longer
              be able to request a refund or return the order.
            </p>

            <button
              type="button"
              disabled={Boolean(loadingAction)}
              onClick={handleCompleteOrder}
            >
              {loadingAction === "complete" ? "Confirming..." : "Accept order"}
            </button>

            <button
              type="button"
              className="parcel-sheet-secondary"
              onClick={() => setShowReceivedModal(false)}
            >
              No, go back
            </button>
          </section>
        </div>
      )}
    </main>
  );
}