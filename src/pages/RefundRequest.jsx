import {
  AlertTriangle,
  Camera,
  Check,
  ChevronLeft,
  Home,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Store,
  Upload,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  formatTindaHanPrice,
  getOrderById,
  requestOrderRefund
} from "../lib/orders";

const REFUND_REASONS = [
  "Item does not match the description",
  "Wrong item received",
  "Item is damaged",
  "Item appears counterfeit",
  "Missing parts or accessories",
  "Other issue"
];

const RETURN_POINTS = [
  {
    id: "jt-makati-ave",
    carrier: "J&T Express",
    name: "J&T Express - Makati Avenue",
    address: "Makati Avenue, Makati City, Metro Manila",
    distance: "0.8 km",
    openingHours: "Open today · 9:00 AM - 6:00 PM"
  },
  {
    id: "ninja-bgc",
    carrier: "Ninja Van",
    name: "Ninja Van Drop-Off - BGC",
    address: "Bonifacio Global City, Taguig, Metro Manila",
    distance: "2.1 km",
    openingHours: "Open today · 10:00 AM - 7:00 PM"
  },
  {
    id: "lbc-greenbelt",
    carrier: "LBC Express",
    name: "LBC Express - Greenbelt",
    address: "Greenbelt, Ayala Center, Makati City",
    distance: "1.4 km",
    openingHours: "Open today · 10:00 AM - 8:00 PM"
  }
];

function fileToPreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        id: `${file.name}-${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`,
        name: file.name,
        type: file.type,
        dataUrl: reader.result
      });
    };

    reader.onerror = () => reject(new Error("Unable to read this photo."));
    reader.readAsDataURL(file);
  });
}

export default function RefundRequest() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [photos, setPhotos] = useState([]);

  const [returnMethod, setReturnMethod] = useState("relay");
  const [selectedReturnPoint, setSelectedReturnPoint] = useState(
    RETURN_POINTS[0]
  );

  const [submitted, setSubmitted] = useState(false);

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
        console.error("Refund request order loading error:", error);

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

  const canContinueEvidence = useMemo(() => {
    return Boolean(reason && details.trim().length >= 20 && photos.length > 0);
  }, [reason, details, photos.length]);

  const selectedReturnLabel = useMemo(() => {
    if (returnMethod === "home_pickup") {
      return "Home pickup requested";
    }

    return `${selectedReturnPoint.carrier} · ${selectedReturnPoint.name}`;
  }, [returnMethod, selectedReturnPoint]);

  async function handlePhotoChange(event) {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      event.target.value = "";
      return;
    }

    try {
      const nextPhotos = await Promise.all(imageFiles.map(fileToPreview));
      setPhotos((current) => [...current, ...nextPhotos].slice(0, 6));
    } catch (error) {
      console.error("Refund photo error:", error);
      alert("Unable to add this photo.");
    } finally {
      event.target.value = "";
    }
  }

  function removePhoto(photoId) {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
  }

  async function handleSubmitRefundRequest() {
    if (!order?.id || submitting) return;

    setSubmitting(true);

    try {
      await requestOrderRefund(order.id, {
        reason,
        details,
        photosCount: photos.length,
        returnMethod,
        returnPoint: returnMethod === "relay" ? selectedReturnPoint : null
      });

      setSubmitted(true);
      setStep(4);
    } catch (error) {
      console.error("Refund submit error:", error);
      alert(error.message || "Unable to submit this refund request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingOrder) {
    return (
      <main className="refund-request-page">
        <header className="refund-request-header">
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
            <ChevronLeft size={27} />
          </button>

          <h1>Refund request</h1>

          <span />
        </header>

        <section className="refund-request-empty">
          <h2>Loading request...</h2>
          <p>Please wait a moment.</p>
        </section>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="refund-request-page">
        <header className="refund-request-header">
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
            <ChevronLeft size={27} />
          </button>

          <h1>Refund request</h1>

          <span />
        </header>

        <section className="refund-request-empty">
          <h2>Order unavailable</h2>
          <p>This order could not be found.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="refund-request-page">
      <header className="refund-request-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>Refund request</h1>

        <span />
      </header>

      <section className="refund-request-product-card">
        <div className="refund-request-product-image">
          {order.listingPhoto ? (
            <img src={order.listingPhoto} alt={order.listingTitle} />
          ) : (
            <PackageCheck size={28} />
          )}
        </div>

        <div>
          <strong>{order.listingTitle}</strong>
          <span>₱{formatTindaHanPrice(order.total)}</span>
          <small>Protected by TindaHan Buyer Protection</small>
        </div>
      </section>

      <section className="refund-request-progress">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className={
              item === step ? "active" : item < step ? "completed" : ""
            }
          >
            {item < step ? <Check size={14} /> : item}
          </div>
        ))}
      </section>

      {step === 1 && (
        <section className="refund-request-card">
          <div className="refund-request-title-row">
            <AlertTriangle size={22} />

            <div>
              <h2>Prove the item is not as described</h2>
              <p>
                Before a refund can be reviewed, TindaHan needs clear evidence:
                photos and a detailed explanation.
              </p>
            </div>
          </div>

          <div className="refund-field-group">
            <label>What is the problem?</label>

            <div className="refund-reason-grid">
              {REFUND_REASONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    reason === item
                      ? "refund-choice-card active"
                      : "refund-choice-card"
                  }
                  onClick={() => setReason(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="refund-field-group">
            <label>Add details</label>

            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Explain precisely what is different from the listing, what is missing, damaged, or incorrect..."
              maxLength={1000}
            />

            <small>{details.length}/1000 · Minimum 20 characters</small>
          </div>

          <div className="refund-field-group">
            <label>Add photos</label>

            <label className="refund-upload-box">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
              />

              <Camera size={25} />

              <div>
                <strong>Upload evidence</strong>
                <span>Add up to 6 photos of the issue.</span>
              </div>
            </label>

            {photos.length > 0 && (
              <div className="refund-photo-grid">
                {photos.map((photo) => (
                  <div className="refund-photo-card" key={photo.id}>
                    <img src={photo.dataUrl} alt={photo.name} />

                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      aria-label="Remove photo"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="refund-primary-button"
            disabled={!canContinueEvidence}
            onClick={() => setStep(2)}
          >
            Continue
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="refund-request-card">
          <div className="refund-request-title-row">
            <ShieldCheck size={22} />

            <div>
              <h2>Choose how to return the item</h2>
              <p>
                If TindaHan approves your complaint, the item must be returned
                before your refund can be released to your wallet.
              </p>
            </div>
          </div>

          <div className="refund-return-method-grid">
            <button
              type="button"
              className={
                returnMethod === "relay"
                  ? "refund-return-method active"
                  : "refund-return-method"
              }
              onClick={() => setReturnMethod("relay")}
            >
              <Store size={24} />

              <div>
                <strong>Drop off at a relay point</strong>
                <span>Choose a nearby J&T, Ninja Van or LBC point.</span>
              </div>
            </button>

            <button
              type="button"
              className={
                returnMethod === "home_pickup"
                  ? "refund-return-method active"
                  : "refund-return-method"
              }
              onClick={() => setReturnMethod("home_pickup")}
            >
              <Home size={24} />

              <div>
                <strong>Home pickup</strong>
                <span>A courier collects the item from your address.</span>
              </div>
            </button>
          </div>

          {returnMethod === "relay" && (
            <div className="refund-relay-list">
              {RETURN_POINTS.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  className={
                    selectedReturnPoint.id === point.id
                      ? "refund-relay-card active"
                      : "refund-relay-card"
                  }
                  onClick={() => setSelectedReturnPoint(point)}
                >
                  <div className="refund-relay-icon">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <strong>{point.name}</strong>
                    <span>{point.carrier}</span>
                    <p>{point.address}</p>
                    <small>
                      {point.distance} · {point.openingHours}
                    </small>
                  </div>

                  {selectedReturnPoint.id === point.id && (
                    <div className="refund-relay-check">
                      <Check size={15} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="refund-step-actions">
            <button
              type="button"
              className="refund-secondary-button"
              onClick={() => setStep(1)}
            >
              Back
            </button>

            <button
              type="button"
              className="refund-primary-button"
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="refund-request-card">
          <div className="refund-request-title-row">
            <Upload size={22} />

            <div>
              <h2>Review your complaint</h2>
              <p>
                TindaHan will review your evidence. The seller payment remains
                protected during the review.
              </p>
            </div>
          </div>

          <div className="refund-review-box">
            <span>Reason</span>
            <strong>{reason}</strong>
          </div>

          <div className="refund-review-box">
            <span>Details</span>
            <p>{details}</p>
          </div>

          <div className="refund-review-box">
            <span>Evidence</span>
            <strong>{photos.length} photo(s) attached</strong>
          </div>

          <div className="refund-review-box">
            <span>Return method</span>
            <strong>{selectedReturnLabel}</strong>
          </div>

          <section className="refund-process-card">
            <h3>What happens next?</h3>

            <div>
              <Check size={16} />
              <p>TindaHan reviews your complaint and evidence.</p>
            </div>

            <div>
              <Check size={16} />
              <p>If approved, you return the item by relay point or pickup.</p>
            </div>

            <div>
              <Check size={16} />
              <p>Once the item is returned, the refund process starts.</p>
            </div>

            <div>
              <Check size={16} />
              <p>The refund is sent to your TindaHan wallet.</p>
            </div>
          </section>

          <div className="refund-step-actions">
            <button
              type="button"
              className="refund-secondary-button"
              onClick={() => setStep(2)}
            >
              Back
            </button>

            <button
              type="button"
              className="refund-primary-button"
              disabled={submitting}
              onClick={handleSubmitRefundRequest}
            >
              {submitting ? "Sending..." : "Submit complaint"}
            </button>
          </div>
        </section>
      )}

      {step === 4 && submitted && (
        <section className="refund-request-card refund-success-card">
          <div className="refund-success-icon">
            <Check size={34} />
          </div>

          <h2>Complaint sent to TindaHan</h2>

          <p>
            Your request has been submitted. The payment remains protected while
            our team reviews your evidence.
          </p>

          <div className="refund-success-timeline">
            <div className="active">
              <span>1</span>
              <p>Complaint submitted</p>
            </div>

            <div>
              <span>2</span>
              <p>TindaHan review</p>
            </div>

            <div>
              <span>3</span>
              <p>Return the item</p>
            </div>

            <div>
              <span>4</span>
              <p>Refund to wallet</p>
            </div>
          </div>

          <button
            type="button"
            className="refund-primary-button"
            onClick={() => navigate(`/tracking/${order.id}`)}
          >
            Back to order tracking
          </button>

          <button
            type="button"
            className="refund-secondary-button"
            onClick={() => navigate("/messages")}
          >
            Open conversation
          </button>
        </section>
      )}
    </main>
  );
}