import {
  ChevronLeft,
  Download,
  Home,
  MapPin,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Truck,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  formatOrderDate,
  formatTindaHanPrice,
  getOrderById,
  markParcelDroppedOff,
  markShippingLabelDownloaded,
  scheduleCourierPickup
} from "../lib/orders";

export default function ShippingLabel() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [showShippingChoice, setShowShippingChoice] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setOrder(getOrderById(orderId));
  }, [orderId]);

  function refreshOrder(updatedOrder) {
    if (updatedOrder) {
      setOrder(updatedOrder);
    } else {
      setOrder(getOrderById(orderId));
    }
  }

  function handleDownloadLabel() {
    const updatedOrder = markShippingLabelDownloaded(order.id);
    refreshOrder(updatedOrder);
    setShowShippingChoice(true);
  }

  function handleCourierPickup() {
    const updatedOrder = scheduleCourierPickup(order.id);
    refreshOrder(updatedOrder);
    setShowShippingChoice(false);
    setSuccessMessage(
      "Courier pick-up scheduled. The buyer has been notified in the conversation."
    );
    setShowSuccessModal(true);
  }

  function handleDropOff() {
    const updatedOrder = markParcelDroppedOff(order.id, "J&T Express");
    refreshOrder(updatedOrder);
    setShowShippingChoice(false);
    setSuccessMessage(
      "Parcel marked as dropped off at J&T Express. The buyer has been notified."
    );
    setShowSuccessModal(true);
  }

  function handlePrint() {
    window.print();
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
            Download the label, then choose courier pick-up or drop-off at a J&T
            Express point.
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
            J&T Express
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
        <button type="button" className="parcel-primary-button" onClick={handleDownloadLabel}>
          <Download size={17} />
          Download shipping label
        </button>

        <button type="button" className="parcel-outline-button" onClick={handlePrint}>
          Print label
        </button>

        <button
          type="button"
          className="parcel-outline-button"
          onClick={() => navigate(`/tracking/${order.id}`)}
        >
          <Truck size={17} />
          Track parcel
        </button>
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
              or whether you will drop it off at a J&T Express point.
            </p>

            <button type="button" className="shipping-choice-card" onClick={handleCourierPickup}>
              <Home size={24} />

              <div>
                <strong>Courier pick-up</strong>
                <span>A J&T Express courier comes to the seller address.</span>
              </div>
            </button>

            <button type="button" className="shipping-choice-card" onClick={handleDropOff}>
              <MapPin size={24} />

              <div>
                <strong>Drop off at J&T Express</strong>
                <span>Deposit the parcel at a J&T Express partner point.</span>
              </div>
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
                navigate(`/tracking/${order.id}`);
              }}
            >
              Continue to tracking
            </button>
          </section>
        </div>
      )}
    </main>
  );
}