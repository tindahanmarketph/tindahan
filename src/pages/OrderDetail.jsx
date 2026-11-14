import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  Download,
  LifeBuoy,
  MapPin,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  Truck,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BetaPaymentBanner from "../components/BetaPaymentBanner";
import { formatAddressLines } from "../lib/addressBook";
import {
  canBuyerCancelOrder,
  cancelOrderByBuyer,
  formatOrderDate,
  formatOrderDateTime,
  formatTindaHanPrice,
  getOrderById,
  getOrderDeadlineInfo,
  getOrderStatusLabel,
  isOrderActive,
  PRE_SHIPMENT_STATUSES,
  sweepOverdueOrders
} from "../lib/orders";
import { DB_HARDENING } from "../lib/featureFlags";

const SUPPORT_EMAIL = "support@tindahan.ph";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function load() {
    setLoading(true);
    setError("");

    try {
      let next = await getOrderById(orderId);

      if (next && !DB_HARDENING) {
        const closed = await sweepOverdueOrders([next]);
        if (closed.length > 0) next = await getOrderById(orderId);
      }

      setOrder(next);
    } catch (err) {
      setError(err.message || "Unable to load this order.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const isBuyer = Boolean(order && user?.id && String(order.buyerId) === String(user.id));
  const isSeller = Boolean(order && user?.id && String(order.sellerId) === String(user.id));

  async function handleCancel() {
    setBusy(true);
    setError("");

    try {
      await cancelOrderByBuyer(order.id);
      setConfirmCancel(false);
      await load();
    } catch (err) {
      setError(err.message || "Unable to cancel this order.");
    } finally {
      setBusy(false);
    }
  }

  function openConversation() {
    if (isBuyer) {
      const params = new URLSearchParams({
        listingId: order.listingId,
        sellerId: order.sellerId,
        title: order.listingTitle || "Item",
        seller: order.sellerUsername || "Seller"
      });
      navigate(`/messages?${params.toString()}`);
      return;
    }

    navigate("/messages");
  }

  function contactSupport() {
    const subject = encodeURIComponent(`Order ${order.trackingNumber || order.id}`);
    const body = encodeURIComponent(
      `Hello TindaHan support,\n\nI need help with order ${order.trackingNumber || order.id} (${order.listingTitle}).\n`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }

  if (loading) {
    return (
      <main className="mobile-subpage order-detail-page">
        <section className="mobile-empty-center orders-empty">
          <h2>Loading order…</h2>
        </section>
      </main>
    );
  }

  if (!order || (!isBuyer && !isSeller)) {
    return (
      <main className="mobile-subpage order-detail-page">
        <header className="mobile-subpage-header">
          <button type="button" onClick={() => navigate("/orders")} aria-label="Back to orders">
            <ChevronLeft size={27} />
          </button>
          <h1>Order</h1>
          <span />
        </header>
        <section className="mobile-empty-center orders-empty">
          <h2>{error || "Order not found"}</h2>
          <p>This order does not exist or is not linked to your account.</p>
        </section>
      </main>
    );
  }

  const { deadline, daysLeft, overdue } = getOrderDeadlineInfo(order);
  const showDeadline =
    order.deliveryMethod !== "meetup" &&
    ["paid_waiting_seller", "label_downloaded", "courier_pickup_scheduled"].includes(order.status);
  const isClosed = ["cancelled", "canceled", "expired", "refunded"].includes(order.status);
  const addressLines = formatAddressLines(order.address);
  const history = [...(order.trackingEvents || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <main className="mobile-subpage order-detail-page" data-testid="order-detail">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate("/orders")} aria-label="Back to orders">
          <ChevronLeft size={27} />
        </button>
        <h1>Order details</h1>
        <span />
      </header>

      <BetaPaymentBanner compact />

      <section className="order-detail-card">
        <div className="order-card-top">
          <div className="order-card-image">
            {order.listingPhoto ? <img src={order.listingPhoto} alt={order.listingTitle} /> : <ReceiptText size={28} />}
          </div>
          <div>
            <strong>{order.listingTitle}</strong>
            <span>
              {isSeller ? `Buyer paid ₱${formatTindaHanPrice(order.total)}` : `Total ₱${formatTindaHanPrice(order.total)}`}
            </span>
            <p className={order.status === "expired" ? "order-expired-badge" : ""} data-testid="order-status">
              {getOrderStatusLabel(order.status)}
            </p>
          </div>
        </div>

        {showDeadline && deadline && (
          <div className={`seller-shipping-alert ${overdue ? "overdue" : ""}`} data-testid="order-deadline">
            <Clock size={19} />
            <div>
              <strong>
                {isSeller ? "Ship before" : "The seller must ship before"} {formatOrderDate(deadline)}
              </strong>
              <p>
                {overdue
                  ? "The deadline has passed."
                  : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left. If the parcel is not shipped in time, the order is cancelled and the buyer is refunded in full.`}
              </p>
            </div>
          </div>
        )}

        {order.status === "expired" && (
          <div className="seller-shipping-alert overdue">
            <XCircle size={19} />
            <div>
              <strong>Order expired</strong>
              <p>The seller did not ship in time. The buyer is refunded in full and the item is available again.</p>
            </div>
          </div>
        )}
      </section>

      <section className="order-detail-card">
        <h2>Payment summary</h2>
        {isSeller ? (
          <>
            <div className="checkout-price-row">
              <span>Item price</span>
              <strong>₱{formatTindaHanPrice(order.itemPrice)}</strong>
            </div>
            <div className="checkout-price-row">
              <span>Seller fees</span>
              <strong>₱0</strong>
            </div>
            <div className="checkout-price-row">
              <span>You receive</span>
              <strong>₱{formatTindaHanPrice(order.itemPrice)}</strong>
            </div>
            <p className="order-detail-note">
              Released to your wallet once the buyer confirms the item is as described.
            </p>
          </>
        ) : (
          <>
            <div className="checkout-price-row">
              <span>Item</span>
              <strong>₱{formatTindaHanPrice(order.itemPrice)}</strong>
            </div>
            <div className="checkout-price-row">
              <span>Buyer Protection (8%)</span>
              <strong>₱{formatTindaHanPrice(order.buyerProtection)}</strong>
            </div>
            <div className="checkout-price-row">
              <span>{order.deliveryMethod === "meetup" ? "Meet-up fee" : "Shipping"}</span>
              <strong>₱{formatTindaHanPrice(order.shippingFee)}</strong>
            </div>
            <div className="checkout-price-row">
              <span>Total</span>
              <strong>₱{formatTindaHanPrice(order.total)}</strong>
            </div>
          </>
        )}
      </section>

      <section className="order-detail-card">
        <h2>{order.deliveryMethod === "meetup" ? "Safe Meet-Up" : "Delivery"}</h2>
        {order.deliveryMethod === "meetup" ? (
          <p>
            <MapPin size={15} /> {order.meetup?.spot?.name || order.sellerMeetupSpot?.name || "Meeting point to confirm"}
          </p>
        ) : (
          <>
            <p><Truck size={15} /> {order.carrier}{order.trackingNumber ? ` · ${order.trackingNumber}` : ""}</p>
            {isBuyer && addressLines.length > 0 && (
              <p className="order-detail-note">{[order.address?.fullName, ...addressLines].filter(Boolean).join(" · ")}</p>
            )}
          </>
        )}
      </section>

      <section className="order-detail-card">
        <h2>History</h2>
        <ol className="order-history" data-testid="order-history">
          <li>
            <CheckCircle2 size={15} />
            <div>
              <strong>Order placed</strong>
              <span>{formatOrderDateTime(order.createdAt)}</span>
            </div>
          </li>
          {history.map((event) => (
            <li key={event.id}>
              <CheckCircle2 size={15} />
              <div>
                <strong>{event.title}</strong>
                {event.description && <p>{event.description}</p>}
                <span>{formatOrderDateTime(event.date)}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {error && <p className="field-error" role="alert">{error}</p>}

      <section className="order-detail-actions">
        {!isClosed && order.deliveryMethod !== "meetup" && (
          <button type="button" className="parcel-outline-button" onClick={() => navigate(`/tracking/${order.id}`)}>
            <PackageCheck size={16} /> Parcel tracking
          </button>
        )}

        {isSeller && order.deliveryMethod !== "meetup" &&
          ["paid_waiting_seller", "label_downloaded", "courier_pickup_scheduled"].includes(order.status) && (
            <button type="button" className="parcel-primary-button" onClick={() => navigate(`/shipping-label/${order.id}`)}>
              <Download size={16} /> Shipping label
            </button>
          )}

        {isBuyer && canBuyerCancelOrder(order) && !confirmCancel && (
          <button type="button" className="parcel-outline-button danger" onClick={() => setConfirmCancel(true)} data-testid="cancel-order">
            <XCircle size={16} /> Cancel order
          </button>
        )}

        {isBuyer && isOrderActive(order) && !PRE_SHIPMENT_STATUSES.includes(order.status) && order.status !== "refund_requested" && (
          <button type="button" className="parcel-outline-button" onClick={() => navigate(`/refund-request/${order.id}`)}>
            <RotateCcw size={16} /> Request a refund
          </button>
        )}

        <button type="button" className="parcel-outline-button" onClick={openConversation}>
          <MessageCircle size={16} /> Open conversation
        </button>

        <button type="button" className="parcel-outline-button" onClick={contactSupport}>
          <LifeBuoy size={16} /> Contact support
        </button>
      </section>

      {confirmCancel && (
        <section className="order-detail-card" role="alertdialog" aria-label="Confirm cancellation">
          <h2>Cancel this order?</h2>
          <p>The seller has not shipped yet. You will be refunded in full and the item becomes available again.</p>
          <div className="order-detail-actions">
            <button type="button" className="parcel-outline-button" onClick={() => setConfirmCancel(false)} disabled={busy}>
              Keep order
            </button>
            <button type="button" className="parcel-primary-button" onClick={handleCancel} disabled={busy} data-testid="confirm-cancel">
              {busy ? "Cancelling…" : "Yes, cancel"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
