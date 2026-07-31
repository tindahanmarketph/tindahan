import {
  Check,
  ChevronLeft,
  Download,
  Home,
  MapPin,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Store,
  Truck,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  formatOrderDate,
  formatTindaHanPrice,
  getOrderById,
  markParcelDroppedOff,
  markShippingLabelDownloaded,
  scheduleCourierPickup
} from "../lib/orders";

const TRACKING_VISIBLE_STATUSES = [
  "dropped_off",
  "in_transit",
  "ready_for_pickup",
  "delivery_scheduled",
  "completed"
];

const DROP_OFF_POINTS = [
  {
    id: "jt-makati-ave",
    carrier: "J&T Express",
    name: "J&T Express - Makati Avenue",
    address: "Makati Avenue, Makati City, Metro Manila",
    openingHours: "Open today · 9:00 AM - 6:00 PM",
    distance: "0.8 km",
    mapX: 34,
    mapY: 55
  },
  {
    id: "ninja-bgc",
    carrier: "Ninja Van",
    name: "Ninja Van Drop-Off - BGC",
    address: "Bonifacio Global City, Taguig, Metro Manila",
    openingHours: "Open today · 10:00 AM - 7:00 PM",
    distance: "2.1 km",
    mapX: 68,
    mapY: 42
  },
  {
    id: "lbc-greenbelt",
    carrier: "LBC Express",
    name: "LBC Express - Greenbelt",
    address: "Greenbelt, Ayala Center, Makati City",
    openingHours: "Open today · 10:00 AM - 8:00 PM",
    distance: "1.4 km",
    mapX: 48,
    mapY: 66
  },
  {
    id: "jt-ortigas",
    carrier: "J&T Express",
    name: "J&T Express - Ortigas Center",
    address: "Ortigas Center, Pasig, Metro Manila",
    openingHours: "Open today · 9:00 AM - 6:00 PM",
    distance: "3.7 km",
    mapX: 78,
    mapY: 28
  }
];

function canTrackParcel(order) {
  return TRACKING_VISIBLE_STATUSES.includes(order?.status);
}

export default function ShippingLabel() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingAction, setLoadingAction] = useState("");
  const [showShippingChoice, setShowShippingChoice] = useState(false);
  const [showDropOffMap, setShowDropOffMap] = useState(false);
  const [selectedDropOffPoint, setSelectedDropOffPoint] = useState(DROP_OFF_POINTS[0]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      setLoadingOrder(true);

      try {
        const loadedOrder = await getOrderById(orderId);

        if (mounted) {
          setOrder(loadedOrder);
        }
      } catch (error) {
        console.error("Shipping label loading error:", error);

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

  const trackingAvailable = useMemo(() => canTrackParcel(order), [order]);

  async function refreshOrder(updatedOrder = null) {
    if (updatedOrder) {
      setOrder(updatedOrder);
      return updatedOrder;
    }

    const freshOrder = await getOrderById(orderId);
    setOrder(freshOrder);
    return freshOrder;
  }

  async function handleDownloadLabel() {
    if (!order?.id || loadingAction) return;

    setLoadingAction("label");

    try {
      const updatedOrder = await markShippingLabelDownloaded(order.id);
      await refreshOrder(updatedOrder);
      setShowShippingChoice(true);
    } catch (error) {
      console.error("Download label error:", error);
      alert(error.message || "Unable to download the shipping label.");
    } finally {
      setLoadingAction("");
    }
  }

  async function handleCourierPickup() {
    if (!order?.id || loadingAction) return;

    setLoadingAction("pickup");

    try {
      const updatedOrder = await scheduleCourierPickup(order.id);
      await refreshOrder(updatedOrder);

      setShowShippingChoice(false);
      setSuccessMessage(
        "Courier pick-up scheduled. The buyer has been notified in the conversation. Tracking will start once the parcel is collected."
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Courier pickup error:", error);
      alert(error.message || "Unable to schedule courier pick-up.");
    } finally {
      setLoadingAction("");
    }
  }

  function openDropOffMap() {
    setShowShippingChoice(false);
    setShowDropOffMap(true);
  }

  async function handleConfirmDropOff() {
    if (!order?.id || !selectedDropOffPoint || loadingAction) return;

    setLoadingAction("dropoff");

    try {
      const updatedOrder = await markParcelDroppedOff(
        order.id,
        selectedDropOffPoint.carrier,
        selectedDropOffPoint
      );

      await refreshOrder(updatedOrder);

      setShowDropOffMap(false);
      setShowShippingChoice(false);
      setSuccessMessage(
        `Parcel marked as dropped off at ${selectedDropOffPoint.name}. The buyer has been notified and tracking is now available.`
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Drop-off error:", error);
      alert(error.message || "Unable to confirm parcel drop-off.");
    } finally {
      setLoadingAction("");
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loadingOrder) {
    return (
      <main className="shipping-label-page">
        <header className="shipping-label-header">
          <button type="button" onClick={() => navigate(-1)}>
            <ChevronLeft size={27} />
          </button>

          <h1>Shipping label</h1>

          <span />
        </header>

        <section className="shipping-label-empty">
          <h2>Loading label...</h2>
          <p>Please wait a moment.</p>
        </section>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="shipping-label-page">
        <header className="shipping-label-header">
          <button type="button" onClick={() => navigate(-1)}>
            <ChevronLeft size={27} />
          </button>

          <h1>Shipping label</h1>

          <span />
        </header>

        <section className="shipping-label-empty">
          <h2>Label unavailable</h2>
          <p>This order could not be found.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="shipping-label-page">
      <header className="shipping-label-header">
        <button type="button" onClick={() => navigate(-1)}>
          <ChevronLeft size={27} />
        </button>

        <h1>Shipping label</h1>

        <span />
      </header>

      <section className="shipping-label-alert">
        <ShieldCheck size={20} />

        <div>
          <strong>Ship before {formatOrderDate(order.maxShippingDate)}</strong>
          <p>
            Download the label, then choose courier pick-up or drop-off at a
            partner point. Tracking starts only after the parcel is dropped off
            or collected.
          </p>
        </div>
      </section>

      <section className="shipping-label-document">
        <div className="shipping-label-brand">
          <div>
            <strong>TindaHan</strong>
            <span>Second-hand marketplace</span>
          </div>

          <div className="shipping-label-carrier">
            {order.carrier || "J&T Express"}
          </div>
        </div>

        <div className="shipping-label-code-row">
          <div>
            <span>Tracking number</span>
            <strong>{order.trackingNumber}</strong>
          </div>

          <QrCode size={54} />
        </div>

        <div className="shipping-label-section">
          <h2>Ship to</h2>

          <p>
            <strong>{order.address?.fullName || "Buyer"}</strong>
            <br />
            {order.address?.mobileNumber}
            <br />
            {order.address?.street}, {order.address?.barangay}
            <br />
            {order.address?.city}, {order.address?.province}
            <br />
            {order.address?.region}, {order.address?.postalCode}
          </p>
        </div>

        <div className="shipping-label-section">
          <h2>Seller</h2>

          <p>
            <strong>{order.sellerUsername || "Seller"}</strong>
            <br />
            Philippines
          </p>
        </div>

        <div className="shipping-label-product">
          <div className="shipping-label-product-image">
            {order.listingPhoto ? (
              <img src={order.listingPhoto} alt={order.listingTitle} />
            ) : (
              <PackageCheck size={28} />
            )}
          </div>

          <div>
            <strong>{order.listingTitle}</strong>
            <span>Order total: ₱{formatTindaHanPrice(order.total)}</span>
          </div>
        </div>

        <div className="shipping-label-barcode">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="shipping-label-actions">
        <button
          type="button"
          className="parcel-primary-button"
          onClick={handleDownloadLabel}
          disabled={Boolean(loadingAction)}
        >
          <Download size={17} />
          {loadingAction === "label" ? "Preparing label..." : "Download shipping label"}
        </button>

        <button
          type="button"
          className="parcel-outline-button"
          onClick={handlePrint}
        >
          Print label
        </button>

        {!trackingAvailable && (
          <button
            type="button"
            className="parcel-outline-button"
            onClick={openDropOffMap}
          >
            <MapPin size={17} />
            Find drop-off point
          </button>
        )}

        {trackingAvailable && (
          <button
            type="button"
            className="parcel-outline-button"
            onClick={() => navigate(`/tracking/${order.id}`)}
          >
            <Truck size={17} />
            Track parcel
          </button>
        )}
      </section>

      {showShippingChoice && (
        <div className="parcel-modal-overlay">
          <section className="parcel-bottom-sheet shipping-choice-sheet">
            <button
              type="button"
              className="parcel-sheet-close"
              onClick={() => setShowShippingChoice(false)}
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <h2>How would you like to ship this parcel?</h2>

            <p>
              Choose whether a courier should pick up the parcel at your address
              or whether you will drop it off at a partner point.
            </p>

            <button
              type="button"
              className="shipping-choice-card"
              onClick={handleCourierPickup}
              disabled={Boolean(loadingAction)}
            >
              <Home size={24} />

              <div>
                <strong>Courier pick-up</strong>
                <span>A courier comes to the seller address.</span>
              </div>
            </button>

            <button
              type="button"
              className="shipping-choice-card"
              onClick={openDropOffMap}
            >
              <MapPin size={24} />

              <div>
                <strong>Drop off at a relay point</strong>
                <span>Deposit the parcel at J&T Express, Ninja Van or LBC.</span>
              </div>
            </button>
          </section>
        </div>
      )}

      {showDropOffMap && (
        <div className="dropoff-modal-overlay" role="presentation" onClick={() => setShowDropOffMap(false)}>
          <section
            className="dropoff-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Find drop-off point"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="dropoff-modal-header">
              <div>
                <h2>Find a drop-off point</h2>
                <p>
                  Choose where you will deposit the parcel. Tracking will become
                  available after you confirm the drop-off.
                </p>
              </div>

              <button type="button" onClick={() => setShowDropOffMap(false)} aria-label="Close">
                <X size={22} />
              </button>
            </header>

            <div className="dropoff-map-card">
              <div className="dropoff-map-grid" />
              <div className="dropoff-map-road road-one" />
              <div className="dropoff-map-road road-two" />
              <div className="dropoff-map-road road-three" />

              <div className="dropoff-map-label">
                <MapPin size={15} />
                <span>Nearby drop-off points</span>
              </div>

              {DROP_OFF_POINTS.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  className={
                    selectedDropOffPoint?.id === point.id
                      ? "dropoff-map-pin active"
                      : "dropoff-map-pin"
                  }
                  style={{
                    "--dropoff-x": `${point.mapX}%`,
                    "--dropoff-y": `${point.mapY}%`
                  }}
                  onClick={() => setSelectedDropOffPoint(point)}
                  aria-label={point.name}
                >
                  <Store size={15} />
                </button>
              ))}
            </div>

            <div className="dropoff-point-list">
              {DROP_OFF_POINTS.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  className={
                    selectedDropOffPoint?.id === point.id
                      ? "dropoff-point-card active"
                      : "dropoff-point-card"
                  }
                  onClick={() => setSelectedDropOffPoint(point)}
                >
                  <div className="dropoff-point-icon">
                    <Store size={20} />
                  </div>

                  <div>
                    <strong>{point.name}</strong>
                    <span>{point.carrier}</span>
                    <p>{point.address}</p>
                    <small>
                      {point.distance} · {point.openingHours}
                    </small>
                  </div>

                  {selectedDropOffPoint?.id === point.id && (
                    <div className="dropoff-point-check">
                      <Check size={15} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="dropoff-confirm-button"
              onClick={handleConfirmDropOff}
              disabled={!selectedDropOffPoint || Boolean(loadingAction)}
            >
              {loadingAction === "dropoff"
                ? "Confirming..."
                : "Confirm parcel dropped off"}
            </button>
          </section>
        </div>
      )}

      {showSuccessModal && (
        <div className="parcel-modal-overlay">
          <section className="parcel-bottom-sheet">
            <h2>Parcel update sent</h2>

            <p>{successMessage}</p>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);

                if (trackingAvailable || order.status === "dropped_off") {
                  navigate(`/tracking/${order.id}`);
                }
              }}
            >
              {trackingAvailable || order.status === "dropped_off"
                ? "Continue to tracking"
                : "Done"}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}