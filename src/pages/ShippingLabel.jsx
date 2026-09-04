import {
  CalendarDays,
  Check,
  ChevronLeft,
  Download,
  Home,
  MapPin,
  PackageCheck,
  Printer,
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
  "completed",
  "refund_requested"
];

const CARRIERS = [
  {
    id: "J&T Express",
    name: "J&T Express",
    hours: "9:00 AM - 6:00 PM",
    slots: ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00"]
  },
  {
    id: "Ninja Van",
    name: "Ninja Van",
    hours: "10:00 AM - 7:00 PM",
    slots: ["10:00 - 13:00", "13:00 - 16:00", "16:00 - 19:00"]
  },
  {
    id: "LBC Express",
    name: "LBC Express",
    hours: "10:00 AM - 8:00 PM",
    slots: ["10:00 - 13:00", "13:00 - 16:00", "16:00 - 20:00"]
  }
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

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getTomorrowInputValue() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function getSellerAddress(order) {
  return (
    order?.sellerAddress ||
    order?.seller_address ||
    order?.pickupAddress ||
    order?.pickup_address ||
    {
      fullName: order?.sellerUsername || "Seller",
      mobileNumber: order?.sellerPhone || "",
      street: "Seller address",
      barangay: "",
      city: "Makati City",
      province: "Metro Manila",
      region: "National Capital Region",
      postalCode: "1210"
    }
  );
}

export default function ShippingLabel() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingAction, setLoadingAction] = useState("");
  const [showShippingChoice, setShowShippingChoice] = useState(false);
  const [showHomePickupForm, setShowHomePickupForm] = useState(false);
  const [showDropOffMap, setShowDropOffMap] = useState(false);
  const [selectedDropOffPoint, setSelectedDropOffPoint] = useState(DROP_OFF_POINTS[0]);
  const [selectedCarrier, setSelectedCarrier] = useState(CARRIERS[0].id);
  const [pickupDate, setPickupDate] = useState(getTomorrowInputValue());
  const [pickupSlot, setPickupSlot] = useState(CARRIERS[0].slots[0]);
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

  const selectedCarrierObject = useMemo(() => {
    return CARRIERS.find((carrier) => carrier.id === selectedCarrier) || CARRIERS[0];
  }, [selectedCarrier]);

  const sellerAddress = useMemo(() => getSellerAddress(order), [order]);

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
    } catch (error) {
      console.error("Download label error:", error);
      alert(error.message || "Unable to download the shipping label.");
    } finally {
      setLoadingAction("");
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleCarrierChange(carrierId) {
    const carrier = CARRIERS.find((item) => item.id === carrierId) || CARRIERS[0];

    setSelectedCarrier(carrier.id);
    setPickupSlot(carrier.slots[0]);
  }

  function openShippingChoice() {
    setShowShippingChoice(true);
    setShowHomePickupForm(false);
    setShowDropOffMap(false);
  }

  function closeShippingChoice() {
    setShowShippingChoice(false);
  }

  function openHomePickupForm() {
    setShowShippingChoice(false);
    setShowHomePickupForm(true);
    setShowDropOffMap(false);
  }

  function openDropOffMap() {
    setShowShippingChoice(false);
    setShowHomePickupForm(false);
    setShowDropOffMap(true);
  }

  async function handleCourierPickup() {
    if (!order?.id || loadingAction) return;

    setLoadingAction("pickup");

    try {
      const updatedOrder = await scheduleCourierPickup(order.id, {
        carrier: selectedCarrier,
        pickupDate,
        pickupSlot,
        sellerAddress
      });

      await refreshOrder(updatedOrder);

      setShowHomePickupForm(false);
      setShowShippingChoice(false);
      setSuccessMessage(
        `${selectedCarrier} pick-up scheduled on ${formatOrderDate(
          pickupDate
        )} between ${pickupSlot}. The buyer has been notified in the conversation.`
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Courier pickup error:", error);
      alert(error.message || "Unable to schedule courier pick-up.");
    } finally {
      setLoadingAction("");
    }
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
            Download and print the shipping label, then choose how you want to
            hand over the parcel.
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
            {order.carrier || selectedCarrier || "J&T Express"}
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
            <strong>{sellerAddress.fullName || order.sellerUsername || "Seller"}</strong>
            <br />
            {sellerAddress.mobileNumber || ""}
            <br />
            {sellerAddress.street || "Seller address"}
            <br />
            {sellerAddress.barangay ? `${sellerAddress.barangay}, ` : ""}
            {sellerAddress.city || "Makati City"}, {sellerAddress.province || "Metro Manila"}
            <br />
            {sellerAddress.region || "National Capital Region"},{" "}
            {sellerAddress.postalCode || "1210"}
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

      <section className="shipping-label-actions shipping-label-card-actions">
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
          <Printer size={17} />
          Print label
        </button>

        {!trackingAvailable && (
          <button
            type="button"
            className="parcel-outline-button"
            onClick={openShippingChoice}
          >
            <Truck size={17} />
            Choose drop-off method
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
              onClick={closeShippingChoice}
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
              onClick={openHomePickupForm}
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

      {showHomePickupForm && (
        <div className="parcel-modal-overlay">
          <section className="parcel-bottom-sheet shipping-home-pickup-sheet">
            <button
              type="button"
              className="parcel-sheet-close"
              onClick={() => setShowHomePickupForm(false)}
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <h2>Schedule courier pick-up</h2>

            <p>
              Check your seller details, choose a carrier, then select an
              available date and time slot.
            </p>

            <div className="shipping-pickup-address-card">
              <strong>Seller details</strong>

              <p>
                <b>{sellerAddress.fullName || order.sellerUsername || "Seller"}</b>
                <br />
                {sellerAddress.mobileNumber || "No phone number provided"}
                <br />
                {sellerAddress.street || "Seller address"}
                <br />
                {sellerAddress.barangay ? `${sellerAddress.barangay}, ` : ""}
                {sellerAddress.city || "Makati City"}, {sellerAddress.province || "Metro Manila"}
                <br />
                {sellerAddress.region || "National Capital Region"},{" "}
                {sellerAddress.postalCode || "1210"}
              </p>
            </div>

            <div className="shipping-pickup-field">
              <label>Carrier</label>

              <div className="shipping-carrier-grid">
                {CARRIERS.map((carrier) => (
                  <button
                    key={carrier.id}
                    type="button"
                    className={
                      selectedCarrier === carrier.id
                        ? "shipping-carrier-card active"
                        : "shipping-carrier-card"
                    }
                    onClick={() => handleCarrierChange(carrier.id)}
                  >
                    <Truck size={18} />

                    <div>
                      <strong>{carrier.name}</strong>
                      <span>{carrier.hours}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="shipping-pickup-field">
              <label htmlFor="pickup-date">Pick-up date</label>

              <div className="shipping-input-with-icon">
                <CalendarDays size={18} />
                <input
                  id="pickup-date"
                  type="date"
                  min={getTodayInputValue()}
                  value={pickupDate}
                  onChange={(event) => setPickupDate(event.target.value)}
                />
              </div>
            </div>

            <div className="shipping-pickup-field">
              <label htmlFor="pickup-slot">Available time slot</label>

              <select
                id="pickup-slot"
                value={pickupSlot}
                onChange={(event) => setPickupSlot(event.target.value)}
              >
                {selectedCarrierObject.slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>

              <small>
                Available hours for {selectedCarrierObject.name}:{" "}
                {selectedCarrierObject.hours}
              </small>
            </div>

            <button
              type="button"
              className="dropoff-confirm-button"
              onClick={handleCourierPickup}
              disabled={Boolean(loadingAction) || !pickupDate || !pickupSlot}
            >
              {loadingAction === "pickup"
                ? "Scheduling pick-up..."
                : "Confirm courier pick-up"}
            </button>
          </section>
        </div>
      )}

      {showDropOffMap && (
        <div
          className="dropoff-modal-overlay"
          role="presentation"
          onClick={() => setShowDropOffMap(false)}
        >
          <section
            className="dropoff-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Find relay point"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="dropoff-modal-header">
              <div>
                <h2>Find a relay point</h2>
                <p>
                  Choose the relay point where you will deposit the parcel.
                  Tracking becomes available after validation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDropOffMap(false)}
                aria-label="Close"
              >
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
                <span>Nearby relay points</span>
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
                : "Validate selected relay point"}
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