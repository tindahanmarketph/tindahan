import {
  ChevronLeft,
  CreditCard,
  Edit3,
  Home,
  Info,
  Landmark,
  MapPin,
  Package,
  ShieldCheck,
  Smartphone,
  Truck,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const deliveryOptions = [
  {
    id: "meetup",
    title: "Meet Up In Person",
    subtitle:
      "Meet safely at a verified public location recommended by TindaHan.",
    price: 0,
    icon: Users
  },
  {
    id: "pickup",
    title: "Pick-up point",
    subtitle: "Recommended for safe and flexible delivery",
    price: 80,
    icon: MapPin
  },
  {
    id: "door",
    title: "Door-to-door delivery",
    subtitle: "Delivered directly to your address",
    price: 120,
    icon: Home
  },
  {
    id: "same_city",
    title: "Same-city courier",
    subtitle: "Available depending on seller location",
    price: 150,
    icon: Truck
  }
];

const paymentMethods = [
  {
    id: "gcash",
    label: "GCash",
    subtitle: "Pay securely with your GCash wallet",
    buttonLabel: "Pay with GCash",
    icon: Smartphone
  },
  {
    id: "maya",
    label: "Maya",
    subtitle: "Pay securely with your Maya wallet",
    buttonLabel: "Pay with Maya",
    icon: Smartphone
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    subtitle: "Pay with Visa, Mastercard or local bank card",
    buttonLabel: "Pay by card",
    icon: CreditCard
  },
  {
    id: "apple_pay",
    label: "Apple Pay",
    subtitle: "Fast checkout with Apple Pay",
    buttonLabel: "Pay with Apple Pay",
    icon: Landmark
  }
];

const defaultAddress = {
  fullName: "Gian Capino",
  mobileNumber: "+63 9XX XXX XXXX",
  region: "National Capital Region",
  province: "Metro Manila",
  city: "Makati City",
  barangay: "Poblacion",
  street: "Street name, building, house number",
  unit: "Unit / floor / landmark",
  postalCode: "1210",
  notes: ""
};

function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getPaymentButtonClass(paymentId) {
  return `checkout-pay-button ${paymentId}`;
}

function getMeetupStorageKey(listingId) {
  return `tindahan_safe_meetup_${listingId}`;
}

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState("pickup");
  const [selectedPayment, setSelectedPayment] = useState("gcash");
  const [showAddressEditor, setShowAddressEditor] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [address, setAddress] = useState(defaultAddress);
  const [draftAddress, setDraftAddress] = useState(defaultAddress);
  const [isPaying, setIsPaying] = useState(false);
  const [meetupPlan, setMeetupPlan] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCheckout() {
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error("Checkout listing error:", error);
        setListing(null);
        setLoading(false);
        return;
      }

      setListing(data);

      if (data?.seller_id) {
        const { data: sellerData } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("id", data.seller_id)
          .maybeSingle();

        if (isMounted) {
          setSeller(sellerData || null);
        }
      }

      try {
        const savedMeetup = JSON.parse(
          localStorage.getItem(getMeetupStorageKey(id)) || "null"
        );

        if (savedMeetup) {
          setMeetupPlan(savedMeetup);
        }

        if (savedMeetup || searchParams.get("delivery") === "meetup") {
          setSelectedDelivery("meetup");
        }
      } catch {
        if (searchParams.get("delivery") === "meetup") {
          setSelectedDelivery("meetup");
        }
      }

      setLoading(false);
    }

    loadCheckout();

    return () => {
      isMounted = false;
    };
  }, [id, searchParams]);

  const itemPrice = Number(listing?.price || 0);
  const buyerProtection = itemPrice * 0.08;

  const delivery = useMemo(() => {
    return (
      deliveryOptions.find((option) => option.id === selectedDelivery) ||
      deliveryOptions[0]
    );
  }, [selectedDelivery]);

  const payment = useMemo(() => {
    return (
      paymentMethods.find((method) => method.id === selectedPayment) ||
      paymentMethods[0]
    );
  }, [selectedPayment]);

  const total = itemPrice + buyerProtection + delivery.price;
  const firstPhoto = listing?.photos?.[0];

  function handleDeliverySelect(optionId) {
    setSelectedDelivery(optionId);
  }

  function openAddressEditor() {
    setDraftAddress(address);
    setShowAddressEditor(true);
  }

  function saveAddress() {
    setAddress(draftAddress);
    setShowAddressEditor(false);
  }

  function updateDraftAddress(field, value) {
    setDraftAddress((current) => ({
      ...current,
      [field]: value
    }));
  }

  function selectPayment(methodId) {
    setSelectedPayment(methodId);
    setShowPaymentSheet(false);
  }

  function handleDeliveryDetailsClick() {
    if (selectedDelivery === "meetup") {
      navigate(`/safe-meetup/${id}?mode=popup`);
      return;
    }

    if (selectedDelivery === "pickup") {
      alert("Pick-up point selection will be available in the next prototype step.");
      return;
    }

    alert("Delivery details will be available in the next prototype step.");
  }

  function handlePay() {
    if (!listing || isPaying) return;

    if (selectedDelivery === "meetup" && !meetupPlan) {
      navigate(`/safe-meetup/${id}?mode=popup`);
      return;
    }

    setIsPaying(true);

    const order = {
      id: `order-${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPhoto: firstPhoto || "",
      buyerId: user?.id || null,
      sellerId: listing.seller_id || null,
      sellerUsername: seller?.username || "",
      itemPrice,
      buyerProtection,
      shippingFee: delivery.price,
      total,
      deliveryMethod: selectedDelivery,
      paymentMethod: selectedPayment,
      address,
      meetup: selectedDelivery === "meetup" ? meetupPlan : null,
      createdAt: new Date().toISOString(),
      status: selectedDelivery === "meetup" ? "meetup_request_sent" : "pending"
    };

    try {
      const existingOrders = JSON.parse(
        localStorage.getItem("tindahan_orders") || "[]"
      );

      localStorage.setItem(
        "tindahan_orders",
        JSON.stringify([order, ...existingOrders])
      );
    } catch (error) {
      console.warn("Order local fallback skipped:", error);
    }

    setTimeout(() => {
      setIsPaying(false);
      navigate("/orders");
    }, 650);
  }

  if (loading) {
    return (
      <main className="checkout-page">
        <div className="checkout-loading">Loading checkout...</div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="checkout-page">
        <header className="checkout-header">
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
            <ChevronLeft size={26} />
          </button>

          <h1>Checkout</h1>

          <span />
        </header>

        <section className="checkout-empty">
          <h2>Item unavailable</h2>
          <p>This item may have been removed or sold.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={26} />
        </button>

        <h1>Checkout</h1>

        <span />
      </header>

      <section className="checkout-product-card">
        <div className="checkout-product-image">
          {firstPhoto ? (
            <img src={firstPhoto} alt={listing.title} />
          ) : (
            <Package size={34} />
          )}
        </div>

        <div className="checkout-product-info">
          <h2>{listing.title}</h2>

          {listing.brand && <p>{listing.brand}</p>}

          {listing.condition && (
            <span>{listing.condition.replaceAll("_", " ")}</span>
          )}

          <strong>₱{formatPrice(itemPrice)}</strong>
        </div>
      </section>

      {selectedDelivery !== "meetup" && (
        <section className="checkout-section">
          <h2>Delivery address</h2>

          <button
            type="button"
            className="checkout-address-card"
            onClick={openAddressEditor}
          >
            <div>
              <strong>{address.fullName}</strong>
              <span>{address.mobileNumber}</span>
              <p>
                {address.street}, {address.barangay}, {address.city},{" "}
                {address.province}, {address.region}, {address.postalCode}
              </p>
            </div>

            <Edit3 size={21} />
          </button>
        </section>
      )}

      <section className="checkout-section">
        <h2>Delivery options</h2>

        <div className="checkout-delivery-list">
          {deliveryOptions.map((option) => {
            const Icon = option.icon;
            const isActive = selectedDelivery === option.id;

            return (
              <button
                key={option.id}
                type="button"
                className={
                  isActive
                    ? "checkout-delivery-option active"
                    : "checkout-delivery-option"
                }
                onClick={() => handleDeliverySelect(option.id)}
              >
                <Icon size={24} />

                <div>
                  <strong>{option.title}</strong>
                  <span>{option.subtitle}</span>
                  <p>
                    {option.id === "meetup"
                      ? "Free"
                      : `from ₱${formatPrice(option.price)}`}
                  </p>
                </div>

                <span className="checkout-radio">{isActive && "✓"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="checkout-section">
        <h2>
          {selectedDelivery === "meetup"
            ? "Safe Meet-Up details"
            : "Delivery details"}
        </h2>

        <button
          type="button"
          className={
            selectedDelivery === "meetup"
              ? "checkout-row-button checkout-meetup-details-button"
              : "checkout-row-button"
          }
          onClick={handleDeliveryDetailsClick}
        >
          <span>
            {selectedDelivery === "meetup"
              ? meetupPlan
                ? `${meetupPlan.spot.name} · ${meetupPlan.time}`
                : "Choose a safe meeting point"
              : selectedDelivery === "pickup"
              ? "Choose a pick-up point"
              : "Add delivery instructions"}
          </span>

          <strong>{selectedDelivery === "meetup" && meetupPlan ? "›" : "+"}</strong>
        </button>

        {selectedDelivery === "meetup" && meetupPlan && (
          <div className="checkout-meetup-summary">
            <ShieldCheck size={19} />

            <div>
              <strong>{meetupPlan.spot.name}</strong>
              <p>
                Safety Score {meetupPlan.spot.score}/100 · {meetupPlan.date} at{" "}
                {meetupPlan.time}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="checkout-section">
        <h2>Payment</h2>

        <button
          type="button"
          className="checkout-payment-card"
          onClick={() => setShowPaymentSheet(true)}
        >
          <div className={`checkout-payment-logo ${payment.id}`}>
            {payment.id === "gcash" && "G"}
            {payment.id === "maya" && "Maya"}
            {payment.id === "card" && <CreditCard size={22} />}
            {payment.id === "apple_pay" && "Pay"}
          </div>

          <div>
            <strong>{payment.label}</strong>
            <span>{payment.subtitle}</span>
          </div>

          <Edit3 size={21} />
        </button>
      </section>

      <section className="checkout-section checkout-price-section">
        <h2>Price</h2>

        <div className="checkout-price-row">
          <span>Order</span>
          <strong>₱{formatPrice(itemPrice)}</strong>
        </div>

        <div className="checkout-price-row">
          <span>
            Buyer Protection fees <Info size={15} />
          </span>
          <strong>₱{formatPrice(buyerProtection)}</strong>
        </div>

        <div className="checkout-price-row">
          <span>
            {selectedDelivery === "meetup" ? "Meet-up fee" : "Shipping fees"}
          </span>
          <strong>₱{formatPrice(delivery.price)}</strong>
        </div>
      </section>

      <section className="checkout-fixed-total">
        <div className="checkout-total-row">
          <span>Total to pay</span>
          <strong>₱{formatPrice(total)}</strong>
        </div>

        <button
          type="button"
          className={getPaymentButtonClass(payment.id)}
          onClick={handlePay}
          disabled={isPaying}
        >
          {selectedDelivery === "meetup" && !meetupPlan
            ? "Choose a meeting point"
            : isPaying
            ? "Processing..."
            : payment.buttonLabel}
        </button>

        <p>
          <ShieldCheck size={14} />
          Your payment information is encrypted and secure
        </p>
      </section>

      {showAddressEditor && (
        <div className="checkout-address-page">
          <header className="checkout-address-header">
            <button type="button" onClick={() => setShowAddressEditor(false)}>
              Close
            </button>

            <h2>Address</h2>

            <span />
          </header>

          <section className="checkout-address-form">
            <label>
              <span>Full name</span>
              <input
                value={draftAddress.fullName}
                onChange={(event) =>
                  updateDraftAddress("fullName", event.target.value)
                }
              />
            </label>

            <label>
              <span>Mobile number</span>
              <input
                value={draftAddress.mobileNumber}
                onChange={(event) =>
                  updateDraftAddress("mobileNumber", event.target.value)
                }
                placeholder="+63 9XX XXX XXXX"
              />
            </label>

            <label>
              <span>Region</span>
              <select
                value={draftAddress.region}
                onChange={(event) =>
                  updateDraftAddress("region", event.target.value)
                }
              >
                <option>National Capital Region</option>
                <option>CALABARZON</option>
                <option>Central Luzon</option>
                <option>Central Visayas</option>
                <option>Davao Region</option>
                <option>Western Visayas</option>
                <option>Northern Mindanao</option>
              </select>
            </label>

            <label>
              <span>Province</span>
              <input
                value={draftAddress.province}
                onChange={(event) =>
                  updateDraftAddress("province", event.target.value)
                }
              />
            </label>

            <label>
              <span>City / Municipality</span>
              <input
                value={draftAddress.city}
                onChange={(event) =>
                  updateDraftAddress("city", event.target.value)
                }
              />
            </label>

            <label>
              <span>Barangay</span>
              <input
                value={draftAddress.barangay}
                onChange={(event) =>
                  updateDraftAddress("barangay", event.target.value)
                }
              />
            </label>

            <label>
              <span>Street name, building, house number</span>
              <input
                value={draftAddress.street}
                onChange={(event) =>
                  updateDraftAddress("street", event.target.value)
                }
              />
            </label>

            <label>
              <span>Unit / floor / landmark</span>
              <input
                value={draftAddress.unit}
                onChange={(event) =>
                  updateDraftAddress("unit", event.target.value)
                }
              />
            </label>

            <label>
              <span>Postal code</span>
              <input
                value={draftAddress.postalCode}
                onChange={(event) =>
                  updateDraftAddress("postalCode", event.target.value)
                }
              />
            </label>

            <label>
              <span>Delivery notes</span>
              <textarea
                value={draftAddress.notes}
                onChange={(event) =>
                  updateDraftAddress("notes", event.target.value)
                }
                placeholder="Example: gate color, landmark, preferred delivery time"
              />
            </label>
          </section>

          <div className="checkout-address-save">
            <button type="button" onClick={saveAddress}>
              Save address
            </button>
          </div>
        </div>
      )}

      {showPaymentSheet && (
        <div
          className="checkout-payment-overlay"
          role="presentation"
          onClick={() => setShowPaymentSheet(false)}
        >
          <section
            className="checkout-payment-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Payment methods"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="checkout-payment-handle" />

            <header>
              <span />
              <h2>Payment methods</h2>

              <button
                type="button"
                onClick={() => setShowPaymentSheet(false)}
                aria-label="Close"
              >
                <X size={25} />
              </button>
            </header>

            <div className="checkout-payment-list">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isActive = selectedPayment === method.id;

                return (
                  <button
                    key={method.id}
                    type="button"
                    className={
                      isActive
                        ? "checkout-payment-method active"
                        : "checkout-payment-method"
                    }
                    onClick={() => selectPayment(method.id)}
                  >
                    <div className={`checkout-payment-logo ${method.id}`}>
                      {method.id === "gcash" && "G"}
                      {method.id === "maya" && "Maya"}
                      {method.id === "card" && <Icon size={22} />}
                      {method.id === "apple_pay" && "Pay"}
                    </div>

                    <div>
                      <strong>{method.label}</strong>
                      <span>{method.subtitle}</span>
                    </div>

                    <span className="checkout-payment-check">
                      {isActive && "✓"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}