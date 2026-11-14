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
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { createOrderFromCheckout } from "../lib/orders";
import {
  EMPTY_ADDRESS,
  loadSavedAddress,
  saveAddress as persistAddress,
  validateAddress
} from "../lib/addressBook";
import BetaPaymentBanner from "../components/BetaPaymentBanner";
import { PAYMENTS_SIMULATED } from "../lib/featureFlags";

const deliveryOptions = [
  {
    id: "meetup",
    title: "Meet Up In Person",
    subtitle:
      "Meet safely at the seller’s preferred public location or suggest another nearby safe place.",
    price: 0,
    icon: Users
  },
  {
    id: "pickup",
    title: "Pick-up point",
    subtitle: "Collect your parcel at a J&T Express partner point",
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

const pickupPoints = [
  {
    id: "jt-makati-ave",
    carrier: "J&T Express",
    name: "J&T Express - Makati Avenue",
    address: "Makati Avenue, Makati City, Metro Manila",
    openingHours: "Open today · 9:00 AM - 6:00 PM"
  },
  {
    id: "jt-greenbelt",
    carrier: "J&T Express",
    name: "J&T Express - Greenbelt",
    address: "Greenbelt, Ayala Center, Makati City",
    openingHours: "Open today · 9:00 AM - 6:00 PM"
  },
  {
    id: "ninja-bgc",
    carrier: "Ninja Van",
    name: "Ninja Van Drop-Off - BGC",
    address: "Bonifacio Global City, Taguig, Metro Manila",
    openingHours: "Open today · 10:00 AM - 7:00 PM"
  },
  {
    id: "lbc-greenbelt",
    carrier: "LBC Express",
    name: "LBC Express - Greenbelt",
    address: "Greenbelt, Ayala Center, Makati City",
    openingHours: "Open today · 10:00 AM - 8:00 PM"
  }
];

/* Cahier L2.2 : plus aucune adresse / téléphone « exemple » pré-rempli. */
const defaultAddress = { ...EMPTY_ADDRESS };

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

function parseOfferPrice(searchParams) {
  const rawOfferPrice = searchParams.get("offerPrice");
  const offerPrice = Number(rawOfferPrice);

  if (!Number.isFinite(offerPrice) || offerPrice <= 0) {
    return null;
  }

  return offerPrice;
}

function getTodayLabel() {
  return new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

function createDefaultMeetupPlan(sellerMeetupSpot) {
  if (!sellerMeetupSpot) return null;

  return {
    spot: sellerMeetupSpot,
    sellerSpot: sellerMeetupSpot,
    time: sellerMeetupSpot.time || "3:00 PM",
    date: getTodayLabel(),
    buyerSuggestedAlternative: false,
    status: "accepted_seller_point",
    selectedAt: new Date().toISOString(),
    selectedBy: "buyer"
  };
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
  const [showPickupPointSheet, setShowPickupPointSheet] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(pickupPoints[0]);
  const [address, setAddress] = useState(defaultAddress);
  const [draftAddress, setDraftAddress] = useState(defaultAddress);
  const [isPaying, setIsPaying] = useState(false);
  const [meetupPlan, setMeetupPlan] = useState(null);
  const [payError, setPayError] = useState("");
  const [addressErrors, setAddressErrors] = useState({});
  const payLockRef = useRef(false);
  const idempotencyKeyRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `req-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );

  /* Pré-remplit avec l'adresse enregistrée du compte (jamais avec un exemple). */
  useEffect(() => {
    if (!user?.id) return;
    const saved = loadSavedAddress(user.id);
    setAddress((current) =>
      current.fullName || current.street ? current : saved
    );
  }, [user?.id]);

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

      setListing(data || null);

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

          if (!savedMeetup && data?.seller_meetup_spot) {
            const defaultPlan = createDefaultMeetupPlan(data.seller_meetup_spot);
            localStorage.setItem(getMeetupStorageKey(id), JSON.stringify(defaultPlan));
            setMeetupPlan(defaultPlan);
          }
        }
      } catch {
        if (searchParams.get("delivery") === "meetup") {
          setSelectedDelivery("meetup");

          if (data?.seller_meetup_spot) {
            const defaultPlan = createDefaultMeetupPlan(data.seller_meetup_spot);
            localStorage.setItem(getMeetupStorageKey(id), JSON.stringify(defaultPlan));
            setMeetupPlan(defaultPlan);
          }
        }
      }

      setLoading(false);
    }

    loadCheckout();

    return () => {
      isMounted = false;
    };
  }, [id, searchParams]);

  const originalItemPrice = Number(listing?.price || 0);
  const acceptedOfferPrice = parseOfferPrice(searchParams);
  const itemPrice = acceptedOfferPrice || originalItemPrice;
  const hasAcceptedOfferPrice = Boolean(acceptedOfferPrice);
  const buyerProtection = itemPrice * 0.08;
  const sellerMeetupSpot = listing?.seller_meetup_spot || null;
  const hasSellerMeetup = Boolean(listing?.meetup_enabled && sellerMeetupSpot);

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

  const checkoutAddress = useMemo(() => {
    if (selectedDelivery !== "pickup") {
      return address;
    }

    return {
      ...address,
      pickupPoint: selectedPickupPoint,
      pickup_point: selectedPickupPoint,
      relayPoint: selectedPickupPoint,
      relay_point: selectedPickupPoint,
      dropOffPoint: selectedPickupPoint,
      drop_off_point: selectedPickupPoint
    };
  }, [address, selectedDelivery, selectedPickupPoint]);

  const total = itemPrice + buyerProtection + delivery.price;
  const firstPhoto = listing?.photos?.[0];

  const isOwnListing = Boolean(
    user?.id && listing?.seller_id && String(user.id) === String(listing.seller_id)
  );

  /* Adresse domicile : tout est obligatoire ; point relais : nom + mobile. */
  const contactErrors = useMemo(() => {
    if (selectedDelivery === "meetup") return {};
    const all = validateAddress(address, { requirePhone: true });
    if (selectedDelivery === "pickup") {
      const subset = {};
      if (all.fullName) subset.fullName = all.fullName;
      if (all.mobileNumber) subset.mobileNumber = all.mobileNumber;
      return subset;
    }
    return all;
  }, [address, selectedDelivery]);

  const addressIncomplete = Object.keys(contactErrors).length > 0;

  const buyerSuggestedDifferentMeetup =
    selectedDelivery === "meetup" &&
    meetupPlan?.buyerSuggestedAlternative &&
    meetupPlan?.spot?.id !== sellerMeetupSpot?.id;

  function handleDeliverySelect(optionId) {
    if (optionId === "meetup" && !hasSellerMeetup) {
      alert("The seller has not offered a Meet-Up point for this item.");
      return;
    }

    if (optionId === "meetup") {
      if (!meetupPlan && sellerMeetupSpot) {
        const defaultPlan = createDefaultMeetupPlan(sellerMeetupSpot);
        localStorage.setItem(getMeetupStorageKey(id), JSON.stringify(defaultPlan));
        setMeetupPlan(defaultPlan);
      }

      setSelectedDelivery("meetup");
      return;
    }

    setSelectedDelivery(optionId);
  }

  function openAddressEditor() {
    setAddressErrors({});
    setDraftAddress(address);
    setShowAddressEditor(true);
  }

  function saveAddress() {
    const needsFullAddress = selectedDelivery !== "pickup";
    const all = validateAddress(draftAddress, { requirePhone: true });
    const errors = needsFullAddress
      ? all
      : Object.fromEntries(
          Object.entries(all).filter(([key]) => key === "fullName" || key === "mobileNumber")
        );

    setAddressErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setAddress(draftAddress);
    persistAddress(user?.id, draftAddress);
    setPayError("");
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
      navigate(`/safe-meetup/${id}?returnTo=checkout`);
      return;
    }

    if (selectedDelivery === "pickup") {
      setShowPickupPointSheet(true);
      return;
    }

    if (selectedDelivery === "door") {
      openAddressEditor();
      return;
    }

    alert("Same-city courier details will be available in the next prototype step.");
  }

  async function handlePay() {
    if (!listing || isPaying || payLockRef.current) return;

    if (isOwnListing) {
      setPayError("You can't buy your own listing.");
      return;
    }

    if (addressIncomplete) {
      setPayError("Please complete your delivery details before paying.");
      openAddressEditor();
      return;
    }

    setPayError("");

    if (selectedDelivery === "meetup" && !hasSellerMeetup) {
      alert("The seller has not offered Meet-Up for this item.");
      return;
    }

    if (selectedDelivery === "meetup" && !meetupPlan) {
      navigate(`/safe-meetup/${id}?returnTo=checkout`);
      return;
    }

    if (selectedDelivery === "pickup" && !selectedPickupPoint?.id) {
      setShowPickupPointSheet(true);
      return;
    }

    payLockRef.current = true;
    setIsPaying(true);

    try {
      const order = await createOrderFromCheckout({
        idempotencyKey: idempotencyKeyRef.current,
        listing,
        seller,
        buyer: user,
        firstPhoto,
        originalItemPrice,
        acceptedOfferPrice: hasAcceptedOfferPrice ? acceptedOfferPrice : null,
        itemPrice,
        buyerProtection,
        shippingFee: delivery.price,
        total,
        deliveryMethod: selectedDelivery,
        paymentMethod: selectedPayment,
        address: checkoutAddress,
        meetup: selectedDelivery === "meetup" ? meetupPlan : null,
        sellerMeetupSpot,
        buyerSuggestedMeetupSpot: buyerSuggestedDifferentMeetup
          ? meetupPlan?.spot
          : null,
        meetupChangeStatus: buyerSuggestedDifferentMeetup ? "pending" : "none"
      });

      navigate(selectedDelivery === "meetup" ? "/orders" : `/tracking/${order.id}`);
    } catch (error) {
      console.error("Checkout payment error:", error);
      setPayError(error.message || "Unable to create this order. Please try again.");
    } finally {
      payLockRef.current = false;
      setIsPaying(false);
    }
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

  if (isOwnListing) {
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
          <h2>This is your own listing</h2>
          <p>You can't buy your own listing. You can edit or boost it from the listing page.</p>
          <button type="button" onClick={() => navigate(`/listing/${id}`)}>
            Back to my listing
          </button>
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

          {hasAcceptedOfferPrice ? (
            <>
              <strong>₱{formatPrice(itemPrice)}</strong>
              <small className="checkout-offer-price-label">
                Accepted offer price
              </small>
              <small className="checkout-original-price">
                Original price: ₱{formatPrice(originalItemPrice)}
              </small>
            </>
          ) : (
            <strong>₱{formatPrice(itemPrice)}</strong>
          )}
        </div>
      </section>

      {selectedDelivery !== "meetup" && (
        <section className="checkout-section">
          <h2>
            {selectedDelivery === "pickup"
              ? "Buyer information"
              : "Delivery address"}
          </h2>

          <button
            type="button"
            className="checkout-address-card"
            onClick={openAddressEditor}
          >
            <div>
              {address.fullName || address.street ? (
                <>
                  <strong>{address.fullName || "Add your name"}</strong>
                  <span>{address.mobileNumber || "Add your mobile number"}</span>
                  {selectedDelivery !== "pickup" && (
                    <p>
                      {[address.street, address.unit, address.barangay, address.city, address.province, address.postalCode]
                        .filter(Boolean)
                        .join(", ") || "Add your delivery address"}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <strong>
                    {selectedDelivery === "pickup"
                      ? "Add your name and mobile number"
                      : "Add your delivery address"}
                  </strong>
                  <span>Required to place your order</span>
                </>
              )}
              {addressIncomplete && (address.fullName || address.street) && (
                <p className="field-error" role="alert">
                  {Object.values(contactErrors)[0]}
                </p>
              )}
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
            const isMeetupDisabled = option.id === "meetup" && !hasSellerMeetup;

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
                disabled={isMeetupDisabled}
              >
                <Icon size={24} />

                <div>
                  <strong>{option.title}</strong>
                  <span>
                    {isMeetupDisabled
                      ? "Not available because the seller did not choose a Meet-Up point."
                      : option.subtitle}
                  </span>
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
                : "View Meet-Up route and details"
              : selectedDelivery === "pickup"
              ? `${selectedPickupPoint.name} · ${selectedPickupPoint.address}`
              : selectedDelivery === "door"
              ? "Add delivery instructions"
              : "Confirm courier delivery"}
          </span>

          <strong>{selectedDelivery === "meetup" && meetupPlan ? "›" : "+"}</strong>
        </button>

        {selectedDelivery === "pickup" && selectedPickupPoint && (
          <div className="checkout-pickup-summary">
            <MapPin size={19} />

            <div>
              <strong>{selectedPickupPoint.name}</strong>
              <p>{selectedPickupPoint.address}</p>
              <small>
                {selectedPickupPoint.carrier} · {selectedPickupPoint.openingHours}
              </small>
            </div>
          </div>
        )}

        {selectedDelivery === "meetup" && meetupPlan && (
          <div
            className={
              buyerSuggestedDifferentMeetup
                ? "checkout-meetup-summary alternative"
                : "checkout-meetup-summary"
            }
          >
            <ShieldCheck size={19} />

            <div>
              <strong>{meetupPlan.spot.name}</strong>
              <p>
                Safety Score {meetupPlan.spot.score}/100 · {meetupPlan.date} at{" "}
                {meetupPlan.time}
              </p>

              {meetupPlan.distanceLabel && (
                <small>
                  {meetupPlan.distanceLabel} from your address
                  {meetupPlan.transportLabel && meetupPlan.transportTime
                    ? ` · ${meetupPlan.transportLabel} ${meetupPlan.transportTime}`
                    : ""}
                </small>
              )}

              {buyerSuggestedDifferentMeetup && (
                <small>
                  This alternative place will be sent to the seller for review,
                  but you can continue buying now.
                </small>
              )}
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

        {hasAcceptedOfferPrice && (
          <div className="checkout-offer-notice">
            <ShieldCheck size={17} />
            <span>You are checking out with an accepted offer price.</span>
          </div>
        )}

        <div className="checkout-price-row">
          <span>{hasAcceptedOfferPrice ? "Accepted offer" : "Order"}</span>
          <strong>₱{formatPrice(itemPrice)}</strong>
        </div>

        {hasAcceptedOfferPrice && (
          <div className="checkout-price-row muted">
            <span>Original item price</span>
            <strong>₱{formatPrice(originalItemPrice)}</strong>
          </div>
        )}

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
          disabled={isPaying || addressIncomplete}
        >
          {addressIncomplete
            ? "Add your delivery details"
            : selectedDelivery === "meetup" && !meetupPlan
            ? "Choose a meeting point"
            : selectedDelivery === "pickup" && !selectedPickupPoint?.id
            ? "Choose a pick-up point"
            : isPaying
            ? "Processing..."
            : payment.buttonLabel}
        </button>

        {payError && (
          <p className="field-error" role="alert" data-testid="pay-error">
            {payError}
          </p>
        )}

        <BetaPaymentBanner compact />

        {!PAYMENTS_SIMULATED && (
          <p>
            <ShieldCheck size={14} />
            Your payment information is encrypted and secure
          </p>
        )}
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
                className={addressErrors.fullName ? "input-invalid" : ""}
                onChange={(event) =>
                  updateDraftAddress("fullName", event.target.value)
                }
              />
            {addressErrors.fullName && (
                <small className="field-error" role="alert">{addressErrors.fullName}</small>
              )}
            </label>

            <label>
              <span>Mobile number</span>
              <input
                value={draftAddress.mobileNumber}
                className={addressErrors.mobileNumber ? "input-invalid" : ""}
                onChange={(event) =>
                  updateDraftAddress("mobileNumber", event.target.value)
                }
                placeholder="09171234567" inputMode="tel"
              />
            {addressErrors.mobileNumber && (
                <small className="field-error" role="alert">{addressErrors.mobileNumber}</small>
              )}
            </label>

            <label>
              <span>Region</span>
              <select
                value={draftAddress.region}
                onChange={(event) =>
                  updateDraftAddress("region", event.target.value)
                }
              >
                <option value="">Select region</option>
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
                className={addressErrors.province ? "input-invalid" : ""}
                onChange={(event) =>
                  updateDraftAddress("province", event.target.value)
                }
              />
            {addressErrors.province && (
                <small className="field-error" role="alert">{addressErrors.province}</small>
              )}
            </label>

            <label>
              <span>City / Municipality</span>
              <input
                value={draftAddress.city}
                className={addressErrors.city ? "input-invalid" : ""}
                onChange={(event) =>
                  updateDraftAddress("city", event.target.value)
                }
              />
            {addressErrors.city && (
                <small className="field-error" role="alert">{addressErrors.city}</small>
              )}
            </label>

            <label>
              <span>Barangay</span>
              <input
                value={draftAddress.barangay}
                className={addressErrors.barangay ? "input-invalid" : ""}
                onChange={(event) =>
                  updateDraftAddress("barangay", event.target.value)
                }
              />
            {addressErrors.barangay && (
                <small className="field-error" role="alert">{addressErrors.barangay}</small>
              )}
            </label>

            <label>
              <span>Street name, building, house number</span>
              <input
                value={draftAddress.street}
                className={addressErrors.street ? "input-invalid" : ""}
                onChange={(event) =>
                  updateDraftAddress("street", event.target.value)
                }
              />
            {addressErrors.street && (
                <small className="field-error" role="alert">{addressErrors.street}</small>
              )}
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
                className={addressErrors.postalCode ? "input-invalid" : ""}
                onChange={(event) =>
                  updateDraftAddress("postalCode", event.target.value)
                }
              />
            {addressErrors.postalCode && (
                <small className="field-error" role="alert">{addressErrors.postalCode}</small>
              )}
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

      {showPickupPointSheet && (
        <div
          className="checkout-payment-overlay"
          role="presentation"
          onClick={() => setShowPickupPointSheet(false)}
        >
          <section
            className="checkout-payment-sheet pickup-point-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Pick-up points"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="checkout-payment-handle" />

            <header>
              <span />
              <h2>Pick-up point</h2>

              <button
                type="button"
                onClick={() => setShowPickupPointSheet(false)}
                aria-label="Close"
              >
                <X size={25} />
              </button>
            </header>

            <div className="pickup-point-list">
              {pickupPoints.map((point) => {
                const isActive = selectedPickupPoint?.id === point.id;

                return (
                  <button
                    key={point.id}
                    type="button"
                    className={
                      isActive
                        ? "pickup-point-option active"
                        : "pickup-point-option"
                    }
                    onClick={() => setSelectedPickupPoint(point)}
                  >
                    <MapPin size={21} />

                    <div>
                      <strong>{point.name}</strong>
                      <span>{point.carrier}</span>
                      <p>{point.address}</p>
                      <small>{point.openingHours}</small>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="pickup-point-confirm-button"
              onClick={() => setShowPickupPointSheet(false)}
            >
              Confirm pick-up point
            </button>
          </section>
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