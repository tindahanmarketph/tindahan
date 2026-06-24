import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getOfferStorageKey(listingId) {
  return `tindahan_offers_${listingId}`;
}

export default function MakeOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("custom");
  const [offerValue, setOfferValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (data?.price) {
        setOfferValue(String(Number(data.price).toFixed(2)));
      }

      setLoading(false);
    }

    loadListing();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const itemPrice = Number(listing?.price || 0);
  const firstPhoto = listing?.photos?.[0];

  const offer15 = useMemo(() => itemPrice * 0.85, [itemPrice]);
  const offer30 = useMemo(() => itemPrice * 0.7, [itemPrice]);

  const cleanOfferValue = Number(
    String(offerValue || "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );

  const buyerProtection = cleanOfferValue * 0.08;
  const protectedTotal = cleanOfferValue + buyerProtection;

  const canSubmit =
    cleanOfferValue > 0 &&
    cleanOfferValue <= itemPrice &&
    !isSubmitting &&
    Boolean(listing?.id);

  function selectSuggestion(type, value) {
    setSelectedType(type);
    setOfferValue(value.toFixed(2));
  }

  function handleCustomChange(event) {
    setSelectedType("custom");
    setOfferValue(event.target.value);
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
      <main className="make-offer-page">
        <div className="make-offer-loading">Loading offer...</div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="make-offer-page">
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
    <main className="make-offer-page">
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
          onClick={() => setSelectedType("custom")}
        >
          <strong>Other</strong>
          <span>Suggest a price</span>
        </button>
      </section>

      <section className="make-offer-input-section">
        <div className="make-offer-input-wrap">
          <span>₱</span>

          <input
            type="number"
            inputMode="decimal"
            min="1"
            max={itemPrice}
            step="0.01"
            value={offerValue}
            onChange={handleCustomChange}
            autoFocus
          />
        </div>

        <p>₱{formatPrice(protectedTotal)} incl. Buyer Protection</p>

        {cleanOfferValue > itemPrice && (
          <small>Your offer cannot be higher than the item price.</small>
        )}
      </section>

      <section className="make-offer-submit-section">
        <button type="button" disabled={!canSubmit} onClick={submitOffer}>
          {isSubmitting ? "Sending..." : "Send offer"}
        </button>

        <p>
          25 offers remaining today{" "}
          <button type="button" onClick={() => alert("You can send up to 25 offers per day.")}>
            Why?
          </button>
        </p>
      </section>
    </main>
  );
}