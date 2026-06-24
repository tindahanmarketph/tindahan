import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

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

function getOfferStorageKey(listingId) {
  return `tindahan_offers_${listingId}`;
}

export default function MakeOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const customInputRef = useRef(null);

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
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

      if (data?.price) {
        const defaultOffer = Number(data.price) * 0.85;
        setSelectedType("15");
        setOfferValue(defaultOffer.toFixed(2));
      }

      setLoading(false);
    }

    loadListing();

    return () => {
      isMounted = false;
    };
  }, [id]);

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

  const canSubmit =
    cleanOfferValue > 0 &&
    cleanOfferValue <= itemPrice &&
    !isSubmitting &&
    Boolean(listing?.id);

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

  function submitOffer() {
    if (!canSubmit) return;

    setIsSubmitting(true);

    const offer = {
      id: `offer-${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPhoto: firstPhoto || "",
      itemPrice,
      offerPrice: cleanOfferValue,
      buyerProtection,
      protectedTotal,
      buyerId: user?.id || null,
      sellerId: listing.seller_id || null,
      sellerUsername: seller?.username || "",
      status: "sent",
      createdAt: new Date().toISOString()
    };

    try {
      const existingOffers = JSON.parse(
        localStorage.getItem(getOfferStorageKey(listing.id)) || "[]"
      );

      localStorage.setItem(
        getOfferStorageKey(listing.id),
        JSON.stringify([offer, ...existingOffers])
      );

      const existingConversations = JSON.parse(
        localStorage.getItem("tindahan_demo_conversations") || "[]"
      );

      const conversationId = `listing-${listing.id}`;

      const newMessage = {
        id: `message-${Date.now()}`,
        sender: "me",
        text: `I would like to make an offer of ₱${formatPrice(
          cleanOfferValue
        )} for this item.`,
        photos: [],
        type: "offer",
        offer,
        createdAt: new Date().toISOString()
      };

      const existingConversation = existingConversations.find(
        (conversation) => conversation.id === conversationId
      );

      let nextConversations;

      if (existingConversation) {
        nextConversations = existingConversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [...(conversation.messages || []), newMessage],
                updatedAt: new Date().toISOString()
              }
            : conversation
        );
      } else {
        nextConversations = [
          {
            id: conversationId,
            listingId: listing.id,
            sellerName: seller?.username || "Seller",
            sellerLocation: "Philippines",
            lastSeen: "Recently active",
            listing: {
              id: listing.id,
              title: listing.title,
              price: listing.price,
              photo: firstPhoto || ""
            },
            messages: [newMessage],
            updatedAt: new Date().toISOString()
          },
          ...existingConversations
        ];
      }

      localStorage.setItem(
        "tindahan_demo_conversations",
        JSON.stringify(nextConversations)
      );
    } catch (error) {
      console.warn("Offer local save skipped:", error);
    }

    setTimeout(() => {
      setIsSubmitting(false);

      const params = new URLSearchParams();
      params.set("listingId", listing.id);
      params.set("title", listing.title || "Item");
      params.set("price", String(listing.price || 0));

      if (firstPhoto) {
        params.set("photo", firstPhoto);
      }

      if (seller?.id) {
        params.set("sellerId", seller.id);
      }

      if (seller?.username) {
        params.set("seller", seller.username);
      }

      navigate(`/messages?${params.toString()}`);
    }, 500);
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

        <h1>Make an offer</h1>

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

      {isCustomOffer && (
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
            : `Send offer ₱${formatPrice(cleanOfferValue)}`}
        </button>

        <p>
          25 offers remaining today{" "}
          <button type="button" onClick={() => setShowLimitModal(true)}>
            Why?
          </button>
        </p>
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