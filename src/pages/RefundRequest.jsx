import {
  AlertTriangle,
  Camera,
  Check,
  ChevronLeft,
  FileText,
  PackageCheck,
  ShieldCheck,
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
  {
    id: "not_as_described",
    title: "Item does not match the description",
    description: "The product is different from what was shown or described."
  },
  {
    id: "wrong_item",
    title: "Wrong item received",
    description: "You received a different product than the one you bought."
  },
  {
    id: "damaged_item",
    title: "Item is damaged",
    description: "The item arrived broken, damaged or unusable."
  },
  {
    id: "counterfeit",
    title: "Item appears counterfeit",
    description: "The item seems fake or not authentic."
  },
  {
    id: "missing_parts",
    title: "Missing parts or accessories",
    description: "Some parts, accessories or elements are missing."
  },
  {
    id: "other",
    title: "Other issue",
    description: "The problem is not listed above."
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
  const [submitted, setSubmitted] = useState(false);

  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [photos, setPhotos] = useState([]);

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
        console.error("Refund request loading error:", error);

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

  const selectedReasonObject = useMemo(() => {
    return REFUND_REASONS.find((reason) => reason.id === selectedReason);
  }, [selectedReason]);

  const canSubmit = useMemo(() => {
    return Boolean(
      selectedReason &&
        details.trim().length >= 20 &&
        photos.length > 0 &&
        !submitting
    );
  }, [selectedReason, details, photos.length, submitting]);

  async function handlePhotoChange(event) {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      event.target.value = "";
      return;
    }

    try {
      const nextPhotos = await Promise.all(imageFiles.map(fileToPreview));

      setPhotos((current) => {
        const mergedPhotos = [...current, ...nextPhotos];
        return mergedPhotos.slice(0, 6);
      });
    } catch (error) {
      console.error("Refund photo upload error:", error);
      alert("Unable to add this photo.");
    } finally {
      event.target.value = "";
    }
  }

  function removePhoto(photoId) {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
  }

  async function handleRequestRefund() {
    if (!order?.id || !canSubmit) return;

    setSubmitting(true);

    try {
      await requestOrderRefund(order.id, {
        reason: selectedReasonObject?.title || "Issue reported",
        details,
        photosCount: photos.length,
        returnMethod: "to_be_selected_after_review",
        returnPoint: null
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Refund request submit error:", error);
      alert(error.message || "Unable to submit this refund request.");
    } finally {
      setSubmitting(false);
    }
  }

  function goBackToConversation() {
    navigate("/messages");
  }

  if (loadingOrder) {
    return (
      <main className="refund-request-page">
        <header className="refund-request-header">
          <button type="button" onClick={goBackToConversation} aria-label="Go back">
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
          <button type="button" onClick={goBackToConversation} aria-label="Go back">
            <ChevronLeft size={27} />
          </button>

          <h1>Refund request</h1>

          <span />
        </header>

        <section className="refund-request-empty">
          <h2>Order unavailable</h2>
          <p>This order could not be found.</p>

          <button
            type="button"
            className="refund-primary-button"
            onClick={goBackToConversation}
          >
            Back to conversation
          </button>
        </section>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="refund-request-page">
        <header className="refund-request-header">
          <button type="button" onClick={goBackToConversation} aria-label="Go back">
            <ChevronLeft size={27} />
          </button>

          <h1>Refund request</h1>

          <span />
        </header>

        <section className="refund-request-card refund-success-card">
          <div className="refund-success-icon">
            <Check size={34} />
          </div>

          <h2>Refund request sent</h2>

          <p>
            Your complaint has been submitted to TindaHan. The payment remains
            protected while our team reviews your photos and explanation.
          </p>

          <div className="refund-success-timeline">
            <div className="active">
              <span>1</span>
              <p>Complaint submitted</p>
            </div>

            <div>
              <span>2</span>
              <p>TindaHan reviews the evidence</p>
            </div>

            <div>
              <span>3</span>
              <p>If approved, you will return the item</p>
            </div>

            <div>
              <span>4</span>
              <p>Your refund will be sent to your wallet</p>
            </div>
          </div>

          <button
            type="button"
            className="refund-primary-button"
            onClick={goBackToConversation}
          >
            Back to conversation
          </button>

          <button
            type="button"
            className="refund-secondary-button"
            onClick={() => navigate(`/tracking/${order.id}`)}
          >
            Back to order tracking
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="refund-request-page">
      <header className="refund-request-header">
        <button type="button" onClick={goBackToConversation} aria-label="Go back">
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

      <section className="refund-request-card">
        <div className="refund-request-title-row">
          <AlertTriangle size={23} />

          <div>
            <h2>What is wrong with the item?</h2>
            <p>
              Choose the reason that best describes the problem. You will need
              to add photos and a detailed explanation before requesting a refund.
            </p>
          </div>
        </div>

        <div className="refund-reason-grid">
          {REFUND_REASONS.map((reason) => (
            <button
              key={reason.id}
              type="button"
              className={
                selectedReason === reason.id
                  ? "refund-choice-card active"
                  : "refund-choice-card"
              }
              onClick={() => setSelectedReason(reason.id)}
            >
              <strong>{reason.title}</strong>
              <span>{reason.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="refund-request-card">
        <div className="refund-request-title-row">
          <FileText size={23} />

          <div>
            <h2>Add details</h2>
            <p>
              Explain clearly why the product does not match what you bought.
            </p>
          </div>
        </div>

        <div className="refund-field-group">
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Example: the item arrived damaged, the color is different, the size does not match the listing, or an accessory is missing..."
            maxLength={1000}
          />

          <small>{details.length}/1000 · Minimum 20 characters</small>
        </div>
      </section>

      <section className="refund-request-card">
        <div className="refund-request-title-row">
          <Camera size={23} />

          <div>
            <h2>Add photos</h2>
            <p>
              Add clear photos showing the issue. At least one photo is required.
            </p>
          </div>
        </div>

        <label className="refund-upload-box">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
          />

          <Camera size={25} />

          <div>
            <strong>Upload photos</strong>
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
      </section>

      <section className="refund-request-card refund-process-card">
        <div className="refund-request-title-row">
          <ShieldCheck size={23} />

          <div>
            <h2>What happens next?</h2>
            <p>
              TindaHan will review your request. If it is approved, you will be
              asked to return the item before the refund is released to your wallet.
            </p>
          </div>
        </div>

        <div className="refund-process-line">
          <Check size={16} />
          <p>Your request is sent to TindaHan.</p>
        </div>

        <div className="refund-process-line">
          <Check size={16} />
          <p>Our team reviews your photos and explanation.</p>
        </div>

        <div className="refund-process-line">
          <Check size={16} />
          <p>If approved, you return the item by relay point or home pickup.</p>
        </div>

        <div className="refund-process-line">
          <Check size={16} />
          <p>The refund is then sent to your TindaHan wallet.</p>
        </div>
      </section>

      <section className="refund-request-actions">
        <button
          type="button"
          className="refund-primary-button"
          disabled={!canSubmit}
          onClick={handleRequestRefund}
        >
          {submitting ? "Sending request..." : "Request refund"}
        </button>

        <button
          type="button"
          className="refund-secondary-button"
          onClick={goBackToConversation}
        >
          Cancel and return to conversation
        </button>
      </section>
    </main>
  );
}