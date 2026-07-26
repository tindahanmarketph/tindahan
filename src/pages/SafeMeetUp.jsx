import {
  Check,
  ChevronLeft,
  Coffee,
  Landmark,
  MapPin,
  Navigation,
  ShieldCheck,
  ShoppingBag,
  Store,
  Utensils
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const safeSpots = [
  {
    id: "starbucks-sm-megamall",
    name: "Starbucks - SM Megamall",
    address: "SM Megamall, Mandaluyong, Metro Manila",
    type: "Coffee Shop",
    icon: Coffee,
    score: 95,
    distanceFromSeller: "1.2 km",
    distanceFromBuyer: "2.1 km",
    tags: ["CCTV monitored", "High foot traffic", "Indoor location", "Well-lit area"],
    sector: "metro_manila"
  },
  {
    id: "jollibee-bgc",
    name: "Jollibee - BGC High Street",
    address: "Bonifacio Global City, Taguig, Metro Manila",
    type: "Fast Food",
    icon: Utensils,
    score: 92,
    distanceFromSeller: "1.7 km",
    distanceFromBuyer: "2.5 km",
    tags: ["Open daily", "High foot traffic", "Public location", "Well-lit area"],
    sector: "metro_manila"
  },
  {
    id: "ayala-mall-manila-bay",
    name: "Ayala Malls Manila Bay",
    address: "Parañaque, Metro Manila",
    type: "Mall",
    icon: ShoppingBag,
    score: 94,
    distanceFromSeller: "3.1 km",
    distanceFromBuyer: "4.4 km",
    tags: ["Security guards", "Indoor location", "CCTV monitored", "Parking available"],
    sector: "metro_manila"
  },
  {
    id: "bdo-makati-avenue",
    name: "BDO - Makati Avenue",
    address: "Makati Avenue, Makati City, Metro Manila",
    type: "Bank",
    icon: Landmark,
    score: 90,
    distanceFromSeller: "2.4 km",
    distanceFromBuyer: "3.2 km",
    tags: ["Public location", "CCTV monitored", "Daytime recommended", "Easy to find"],
    sector: "metro_manila"
  },
  {
    id: "seven-eleven-ortigas",
    name: "7-Eleven - Ortigas Center",
    address: "Ortigas Center, Pasig, Metro Manila",
    type: "Convenience Store",
    icon: Store,
    score: 87,
    distanceFromSeller: "1.4 km",
    distanceFromBuyer: "2.8 km",
    tags: ["Open late", "Public place", "Easy to find", "Well-lit area"],
    sector: "metro_manila"
  }
];

const filters = ["Recommended", "Mall", "Coffee Shop", "Fast Food", "Bank", "Nearby"];
const meetingTimes = ["10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"];

function getMeetupStorageKey(listingId) {
  return `tindahan_safe_meetup_${listingId}`;
}

function getTodayLabel() {
  return new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

export default function SafeMeetUp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const returnTo = searchParams.get("returnTo") || "checkout";

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Recommended");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedTime, setSelectedTime] = useState("3:00 PM");
  const [saving, setSaving] = useState(false);
  const [buyerIsInSector, setBuyerIsInSector] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadListing() {
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Safe Meet-Up listing error:", error);
        setListing(null);
        setLoading(false);
        return;
      }

      setListing(data || null);

      try {
        const savedBuyerPlan = JSON.parse(
          localStorage.getItem(getMeetupStorageKey(id)) || "null"
        );

        if (savedBuyerPlan?.spot) {
          setSelectedSpot(savedBuyerPlan.spot);
          setSelectedTime(savedBuyerPlan.time || "3:00 PM");
        } else if (data?.seller_meetup_spot) {
          setSelectedSpot(data.seller_meetup_spot);
          setSelectedTime(data.seller_meetup_spot.time || "3:00 PM");
        } else {
          setSelectedSpot(safeSpots[0]);
        }
      } catch {
        setSelectedSpot(data?.seller_meetup_spot || safeSpots[0]);
      }

      setLoading(false);
    }

    loadListing();

    return () => {
      mounted = false;
    };
  }, [id]);

  const sellerPreferredSpot = listing?.seller_meetup_spot || null;

  const filteredSpots = useMemo(() => {
    if (activeFilter === "Recommended") {
      return [...safeSpots].sort((a, b) => b.score - a.score);
    }

    if (activeFilter === "Nearby") {
      return safeSpots.filter((spot) => Number(spot.distanceFromBuyer.split(" ")[0]) <= 3);
    }

    return safeSpots.filter((spot) => spot.type === activeFilter);
  }, [activeFilter]);

  const isAlternativeToSellerSpot =
    Boolean(sellerPreferredSpot && selectedSpot) &&
    selectedSpot.id !== sellerPreferredSpot.id;

  function handleBack() {
    if (returnTo === "checkout") {
      navigate(`/checkout/${id}?delivery=meetup`);
      return;
    }

    navigate(-1);
  }

  function saveBuyerMeetupPoint() {
    if (!selectedSpot || saving) return;

    if (!buyerIsInSector) {
      alert("Meet-Up is only available if you are in the same sector.");
      return;
    }

    setSaving(true);

    const plan = {
      spot: selectedSpot,
      sellerSpot: sellerPreferredSpot || null,
      time: selectedTime,
      date: getTodayLabel(),
      buyerSuggestedAlternative: isAlternativeToSellerSpot,
      status: isAlternativeToSellerSpot ? "pending_seller_review" : "accepted_seller_point",
      selectedAt: new Date().toISOString(),
      selectedBy: "buyer"
    };

    localStorage.setItem(getMeetupStorageKey(id), JSON.stringify(plan));

    setTimeout(() => {
      setSaving(false);
      navigate(
        `/checkout/${id}?delivery=meetup${
          isAlternativeToSellerSpot ? "&meetupSuggestion=1" : ""
        }`
      );
    }, 250);
  }

  if (loading) {
    return (
      <main className="safe-meetup-page">
        <header className="safe-meetup-header">
          <button type="button" onClick={handleBack} aria-label="Go back">
            <ChevronLeft size={28} />
          </button>

          <h1>Safe Meet-Up</h1>

          <span />
        </header>

        <section className="safe-meetup-loading">Loading safe places...</section>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="safe-meetup-page">
        <header className="safe-meetup-header">
          <button type="button" onClick={handleBack} aria-label="Go back">
            <ChevronLeft size={28} />
          </button>

          <h1>Safe Meet-Up</h1>

          <span />
        </header>

        <section className="safe-meetup-loading">
          This listing is unavailable.
        </section>
      </main>
    );
  }

  return (
    <main className="safe-meetup-page">
      <header className="safe-meetup-header">
        <button type="button" onClick={handleBack} aria-label="Go back">
          <ChevronLeft size={28} />
        </button>

        <h1>Safe Meet-Up</h1>

        <span />
      </header>

      <section className="safe-meetup-intro">
        <div className="safe-meetup-intro-icon">
          <ShieldCheck size={24} />
        </div>

        <div>
          <strong>Choose a public location where you and the seller can meet safely.</strong>
          <p>
            You can accept the seller’s preferred point or suggest another safe
            place if you are in the same sector.
          </p>
        </div>
      </section>

      {sellerPreferredSpot && (
        <section className="safe-meetup-seller-point">
          <span>Seller preferred Meet-Up point</span>
          <strong>{sellerPreferredSpot.name}</strong>
          <p>{sellerPreferredSpot.address}</p>

          <div>
            <em>Safety Score {sellerPreferredSpot.score}/100</em>
            <em>{sellerPreferredSpot.type}</em>
          </div>

          <button type="button" onClick={() => setSelectedSpot(sellerPreferredSpot)}>
            Accept seller point
          </button>
        </section>
      )}

      <section className="safe-meetup-sector-check">
        <div>
          <strong>Are you in the same sector?</strong>
          <p>
            Meet-Up is available only when the buyer is close enough to the seller’s area.
          </p>
        </div>

        <button
          type="button"
          className={buyerIsInSector ? "active" : ""}
          onClick={() => setBuyerIsInSector((current) => !current)}
        >
          {buyerIsInSector ? "In sector" : "Out of sector"}
        </button>
      </section>

      <section className="safe-meetup-map">
        <div className="safe-meetup-map-bg">
          <div className="safe-map-grid" />

          <div className="safe-map-user-dot">
            <Navigation size={18} />
          </div>

          {safeSpots.map((spot, index) => {
            const Icon = spot.icon || MapPin;
            const isSelected = selectedSpot?.id === spot.id;

            return (
              <button
                key={spot.id}
                type="button"
                className={isSelected ? "safe-map-pin active" : "safe-map-pin"}
                style={{
                  "--pin-left": `${18 + (index * 12) % 62}%`,
                  "--pin-top": `${20 + (index * 17) % 56}%`
                }}
                onClick={() => setSelectedSpot(spot)}
                aria-label={spot.name}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="safe-meetup-filters">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? "active" : ""}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="safe-meetup-spots">
        <h2>Recommended Safe Spots</h2>

        <div className="safe-meetup-spots-list">
          {filteredSpots.map((spot) => {
            const Icon = spot.icon || MapPin;
            const isSelected = selectedSpot?.id === spot.id;

            return (
              <button
                key={spot.id}
                type="button"
                className={isSelected ? "safe-spot-card active" : "safe-spot-card"}
                onClick={() => setSelectedSpot(spot)}
              >
                <div className="safe-spot-icon">
                  <Icon size={22} />
                </div>

                <div>
                  <strong>{spot.name}</strong>
                  <span>{spot.address}</span>

                  <div className="safe-spot-score">
                    Safety Score: {spot.score}/100
                  </div>

                  <ul>
                    {spot.tags.slice(0, 4).map((tag) => (
                      <li key={tag}>✓ {tag}</li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedSpot && (
        <section className="safe-meetup-bottom-sheet">
          <div className="safe-meetup-sheet-handle" />

          <h2>Meeting Point Selected</h2>

          <div className="safe-meetup-selected-card">
            <div className="safe-meetup-selected-icon">
              <MapPin size={22} />
            </div>

            <div>
              <strong>{selectedSpot.name}</strong>
              <span>{selectedSpot.address}</span>
              <p>
                {selectedSpot.distanceFromSeller || "Seller distance"} from seller ·{" "}
                {selectedSpot.distanceFromBuyer || "Buyer distance"} from buyer
              </p>
              <em>Safety Score: {selectedSpot.score}/100</em>
            </div>
          </div>

          {isAlternativeToSellerSpot && (
            <div className="safe-meetup-warning">
              <ShieldCheck size={18} />
              <p>
                This is different from the seller’s preferred location. A request
                will be sent to the seller after purchase, but you can still continue buying.
              </p>
            </div>
          )}

          <div className="safe-meetup-time-section">
            <strong>Suggested Meeting Times</strong>

            <div className="safe-meetup-times">
              {meetingTimes.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={selectedTime === time ? "active" : ""}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="safe-meetup-confirm-button"
            onClick={saveBuyerMeetupPoint}
            disabled={saving || !buyerIsInSector}
          >
            {saving
              ? "Saving..."
              : isAlternativeToSellerSpot
              ? "Suggest this location"
              : "Confirm Meeting Point"}
          </button>
        </section>
      )}
    </main>
  );
}