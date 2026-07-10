import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  createOfferMessage,
  fetchConversationsForUser,
  getOrCreateConversation,
  getOrCreateConversationFromListingId
} from "../lib/tindahanRealtime";

function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function parseOfferValue(value) {
  const parsedValue = Number(
    String(value || "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export default function MakeOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const customInputRef = useRef(null);

  const mode = searchParams.get("mode") || "buyer";
  const conversationIdFromParams = searchParams.get("conversationId") || "";
  const isCounterMode = mode === "counter";

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("15");
  const [offerValue, setOfferValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadListing() {
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error("Offer listing error:", error);
        setListing(null);
        setLoading(false);
        return;
      }

      setListing(data || null);

      let sellerData = null;

      if (data?.seller_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("id", data.seller_id)
          .maybeSingle();

        sellerData = profileData || null;

        if (isMounted) {
          setSeller(sellerData);
        }
      }

      if (data?.price) {
        const defaultOffer = isCounterMode
          ? Number(data.price)
          : Number(data.price) * 0.85;

        setSelectedType(isCounterMode ? "custom" : "15");
        setOfferValue(isCounterMode ? "0" : defaultOffer.toFixed(2));
      }

      try {
        if (conversationIdFromParams) {
          const existingConversations = await fetchConversationsForUser(user?.id);

          const foundConversation = existingConversations.find(
            (item) => item.id === conversationIdFromParams
          );

          setConversation(foundConversation || null);
        } else if (data?.id && user?.id) {
          const createdConversation = await getOrCreateConversation({
            listing: data,
            seller: sellerData,
            buyer: user,
            firstPhoto: data.photos?.[0] || ""
          });

          setConversation(createdConversation);
        }
      } catch (conversationError) {
        console.warn("Conversation loading skipped:", conversationError.message);
      }

      setLoading(false);
    }

    loadListing();

    return () => {
      isMounted = false;
    };
  }, [id, isCounterMode, conversationIdFromParams, user?.id]);

  useEffect(() => {
    if (selectedType === "custom") {
      requestAnimationFrame(() => {
        if (customInputRef.current) {
          customInputRef.current.focus();
          customInputRef.current.select();
        }
      });
    }
  }, [selectedType]);

  const itemPrice = Number(listing?.price || 0);
  const firstPhoto = listing?.photos?.[0];

  const offer15 = useMemo(() => itemPrice * 0.85, [itemPrice]);
  const offer30 = useMemo(() => itemPrice * 0.7, [itemPrice]);

  const cleanOfferValue = parseOfferValue(offerValue);
  const buyerProtection = cleanOfferValue * 0.08;
  const protectedTotal = cleanOfferValue + buyerProtection;

  const isCustomOffer = selectedType === "custom";

  const isCurrentUserSeller = Boolean(
    user?.id && listing?.seller_id && String(user.id) === String(listing.seller_id)
  );

  const canSubmit =
    cleanOfferValue > 0 &&
    cleanOfferValue <= itemPrice &&
    !isSubmitting &&
    Boolean(listing?.id) &&
    Boolean(user?.id);

  function selectSuggestion(type, value) {
    setSelectedType(type);
    setOfferValue(Number(value).toFixed(2));
  }

  function selectCustomOffer() {
    setSelectedType("custom");
    setOfferValue("0");
  }

  function handleCustomFocus(event) {
    event.target.select();
  }

  function handleCustomChange(event) {
    let nextValue = event.target.value;

    nextValue = nextValue.replace(",", ".");
    nextValue = nextValue.replace(/[^\d.]/g, "");

    const dotCount = (nextValue.match(/\./g) || []).length;

    if (dotCount > 1) {
      const firstDotIndex = nextValue.indexOf(".");
      nextValue =
        nextValue.slice(0, firstDotIndex + 1) +
        nextValue.slice(firstDotIndex + 1).replace(/\./g, "");
    }

    if (nextValue.length > 1 && nextValue.startsWith("0") && !nextValue.startsWith("0.")) {
      nextValue = nextValue.replace(/^0+/, "");
    }

    if (nextValue === "") {
      nextValue = "0";
    }

    setSelectedType("custom");
    setOfferValue(nextValue);
  }

  function handleCustomKeyDown(event) {
    const isNumberKey = /^[0-9]$/.test(event.key);
    const isDecimalKey = event.key === "." || event.key === ",";

    if ((offerValue === "0" || offerValue === "0.00") && isNumberKey) {
      event.preventDefault();
      setOfferValue(event.key);
      return;
    }

    if ((offerValue === "0" || offerValue === "0.00") && isDecimalKey) {
      event.preventDefault();
      setOfferValue("0.");
    }
  }

  function handleCustomBlur() {
    if (!offerValue || parseOfferValue(offerValue) === 0) {
      setOfferValue("0");
      return;
    }

    setOfferValue(String(parseOfferValue(offerValue)));
  }

  async function submitOffer() {
    if (!canSubmit) return;

    setIsSubmitting(true);

    try {
      let activeConversation = conversation;

      if (!activeConversation) {
        activeConversation = await getOrCreateConversationFromListingId({
          listingId: listing.id,
          buyer: isCurrentUserSeller
            ? {
                id: conversation?.buyerId
              }
            : user
        });
      }

      const buyerId = activeConversation.buyerId;
      const sellerId = activeConversation.sellerId || listing.seller_id;

      const isSellerOffer = isCounterMode || isCurrentUserSeller;

      await createOfferMessage({
        conversation: activeConversation,
        listing,
        buyerId,
        sellerId,
        senderId: user.id,
        senderRole: isSellerOffer ? "seller_counter_offer" : "buyer_offer",
        itemPrice,
        offerPrice: cleanOfferValue
      });

      const params = new URLSearchParams();
      params.set("listingId", listing.id);

      navigate(`/messages?${params.toString()}`);
    } catch (error) {
      console.error("Offer submit error:", error);
      alert(error.message || "Unable to send this offer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="make-offer-page make-offer-tindahan-page">
        <div className="make-offer-loading">Loading offer...</div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="make-offer-page make-offer-tindahan-page">
        <header className="make-offer-header">
          <button type="button" onClick={() => navigate(-1)}>
            Close
          </button>

          <h1>Make an offer</h1>

          <span />
        </header>

        <section className="make-offer-empty">
          <h2>Item unavailable</h2>
          <p>This item may have been removed or sold.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="make-offer-page make-offer-tindahan-page">
      <header className="make-offer-header">
        <button type="button" onClick={() => navigate(-1)}>
          Close
        </button>

        <h1>{isCounterMode ? "Make a counter-offer" : "Make an offer"}</h1>

        <span />
      </header>

      <section className="make-offer-product">
        <div className="make-offer-product-image">
          {firstPhoto ? (
            <img src={firstPhoto} alt={listing.title} />
          ) : (
            <span>No photo</span>
          )}
        </div>

        <div>
          <h2>{listing.title}</h2>
          <p>Item price: ₱{formatPrice(itemPrice)}</p>
        </div>
      </section>

      {!isCounterMode && (
        <section className="make-offer-suggestions">
          <button
            type="button"
            className={selectedType === "15" ? "active" : ""}
            onClick={() => selectSuggestion("15", offer15)}
          >
            <strong>₱{formatPrice(offer15)}</strong>
            <span>15% discount</span>
          </button>

          <button
            type="button"
            className={selectedType === "30" ? "active" : ""}
            onClick={() => selectSuggestion("30", offer30)}
          >
            <strong>₱{formatPrice(offer30)}</strong>
            <span>30% discount</span>
          </button>

          <button
            type="button"
            className={selectedType === "custom" ? "active" : ""}
            onClick={selectCustomOffer}
          >
            <strong>Other</strong>
            <span>Suggest a price</span>
          </button>
        </section>
      )}

      {(isCustomOffer || isCounterMode) && (
        <section className="make-offer-input-section visible">
          <div className="make-offer-input-wrap">
            <span>₱</span>

            <input
              ref={customInputRef}
              type="text"
              inputMode="decimal"
              value={offerValue}
              onFocus={handleCustomFocus}
              onChange={handleCustomChange}
              onKeyDown={handleCustomKeyDown}
              onBlur={handleCustomBlur}
              aria-label="Custom offer amount"
            />
          </div>

          {cleanOfferValue > itemPrice && (
            <small>Your offer cannot be higher than the item price.</small>
          )}
        </section>
      )}

      <section className="make-offer-protection-summary">
        <p>₱{formatPrice(protectedTotal)} incl. Buyer Protection</p>

        <span>
          Buyer Protection is calculated automatically from your offer amount.
        </span>
      </section>

      <section className="make-offer-submit-section">
        <button type="button" disabled={!canSubmit} onClick={submitOffer}>
          {isSubmitting
            ? "Sending..."
            : isCounterMode
            ? `Send counter-offer ₱${formatPrice(cleanOfferValue)}`
            : `Send offer ₱${formatPrice(cleanOfferValue)}`}
        </button>

        {!isCounterMode && (
          <p>
            25 offers remaining today{" "}
            <button type="button" onClick={() => setShowLimitModal(true)}>
              Why?
            </button>
          </p>
        )}
      </section>

      {showLimitModal && (
        <div
          className="make-offer-modal-overlay"
          role="presentation"
          onClick={() => setShowLimitModal(false)}
        >
          <section
            className="make-offer-limit-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Offer limit"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>You can only send 25 offers per day!</h2>

            <p>
              This limit helps prevent spam and keeps negotiations fair for both
              buyers and sellers on TindaHan.
            </p>

            <button type="button" onClick={() => setShowLimitModal(false)}>
              I understand
            </button>
          </section>
        </div>
      )}
    </main>
  );
}