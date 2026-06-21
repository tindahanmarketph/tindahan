import {
  Banknote,
  Building2,
  ChevronLeft,
  Coffee,
  MapPin,
  Navigation,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Sun,
  Utensils,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const filters = [
  "Recommended",
  "Mall",
  "Coffee Shop",
  "Fast Food",
  "Bank",
  "Nearby"
];

const safeSpots = [
  {
    id: "starbucks-sm-megamall",
    name: "Starbucks - SM Megamall",
    type: "Coffee Shop",
    icon: Coffee,
    score: 95,
    buyerDistance: "2.1 km",
    sellerDistance: "1.2 km",
    address: "SM Megamall, Mandaluyong City, Metro Manila",
    googleQuery: "Starbucks SM Megamall Mandaluyong",
    tags: ["CCTV monitored", "High foot traffic", "Indoor location", "Well-lit area"]
  },
  {
    id: "sm-megamall",
    name: "SM Mall Meet-Up Area",
    type: "Mall",
    icon: ShoppingBag,
    score: 94,
    buyerDistance: "2.4 km",
    sellerDistance: "1.5 km",
    address: "SM Megamall, Ortigas Center, Mandaluyong",
    googleQuery: "SM Megamall Mandaluyong",
    tags: ["Security guards nearby", "Indoor location", "High foot traffic", "Open late"]
  },
  {
    id: "jollibee-ortigas",
    name: "Jollibee - Ortigas Center",
    type: "Fast Food",
    icon: Utensils,
    score: 89,
    buyerDistance: "1.8 km",
    sellerDistance: "1.7 km",
    address: "Ortigas Center, Pasig City",
    googleQuery: "Jollibee Ortigas Center Pasig",
    tags: ["Public location", "High foot traffic", "Well-lit area", "Easy to find"]
  },
  {
    id: "bdo-megamall",
    name: "BDO - SM Megamall",
    type: "Bank",
    icon: Banknote,
    score: 91,
    buyerDistance: "2.2 km",
    sellerDistance: "1.4 km",
    address: "SM Megamall, Mandaluyong City",
    googleQuery: "BDO SM Megamall Mandaluyong",
    tags: ["CCTV monitored", "Bank security", "Indoor location", "Bright area"]
  },
  {
    id: "seven-eleven-shaw",
    name: "7-Eleven - Shaw Boulevard",
    type: "Nearby",
    icon: Store,
    score: 84,
    buyerDistance: "1.1 km",
    sellerDistance: "2.3 km",
    address: "Shaw Boulevard, Mandaluyong City",
    googleQuery: "7-Eleven Shaw Boulevard Mandaluyong",
    tags: ["Open 24/7", "Public location", "Well-lit area", "Easy access"]
  },
  {
    id: "police-desk-ortigas",
    name: "Police Assistance Desk - Ortigas",
    type: "Recommended",
    icon: Building2,
    score: 98,
    buyerDistance: "2.7 km",
    sellerDistance: "1.8 km",
    address: "Ortigas Center, Pasig City",
    googleQuery: "Police Assistance Desk Ortigas Center",
    tags: ["Police nearby", "Highly visible", "Public area", "High security"]
  }
];

const suggestedTimes = ["10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"];

function getStorageKey(id) {
  return `tindahan_safe_meetup_${id}`;
}

function getNextSaturdayLabel() {
  return "Saturday, June 20";
}

function buildGoogleMapUrl(spot) {
  const query = encodeURIComponent(spot?.googleQuery || "SM Megamall Mandaluyong");
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

export default function SafeMeetUp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("Recommended");
  const [selectedSpot, setSelectedSpot] = useState(safeSpots[0]);
  const [selectedTime, setSelectedTime] = useState("3:00 PM");

  const visibleSpots = useMemo(() => {
    if (activeFilter === "Recommended") {
      return safeSpots.filter((spot) => spot.score >= 90);
    }

    if (activeFilter === "Nearby") {
      return safeSpots.filter(
        (spot) => spot.type === "Nearby" || spot.buyerDistance.startsWith("1.")
      );
    }

    return safeSpots.filter((spot) => spot.type === activeFilter);
  }, [activeFilter]);

  function handleSelectSpot(spot) {
    setSelectedSpot(spot);
  }

  function handleConfirmMeetingPoint() {
    const meetup = {
      listingId: id,
      spot: selectedSpot,
      date: getNextSaturdayLabel(),
      time: selectedTime,
      status: "selected",
      buyerArrived: false,
      sellerArrived: false,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(getStorageKey(id), JSON.stringify(meetup));
    navigate(`/checkout/${id}?delivery=meetup`);
  }

  function openDirections() {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${selectedSpot.name} ${selectedSpot.address}`
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="safe-meetup-page safe-meetup-single-page">
      <header className="safe-meetup-header safe-single-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>
          <ShieldCheck size={20} />
          Safe Meet-Up
        </h1>

        <button
          type="button"
          onClick={() => navigate(`/checkout/${id}`)}
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </header>

      <section className="safe-single-intro">
        <h2>Choose a safe public place</h2>
        <p>
          Meet at a verified public location recommended by TindaHan to protect
          both buyer and seller.
        </p>
      </section>

      <section className="safe-single-map-section">
        <div className="safe-single-map-card">
          <iframe
            title={`Map for ${selectedSpot.name}`}
            src={buildGoogleMapUrl(selectedSpot)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <div className="safe-map-floating-score">
            <ShieldCheck size={17} />
            <span>Safety Score</span>
            <strong>{selectedSpot.score}/100</strong>
          </div>
        </div>
      </section>

      <section className="safe-single-filters">
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

      <section className="safe-single-content">
        <div className="safe-single-selected-card">
          <div className="safe-selected-header">
            <div>
              <span>Meeting Point Selected</span>
              <h2>{selectedSpot.name}</h2>
              <p>{selectedSpot.address}</p>
            </div>

            <button type="button" onClick={openDirections}>
              <Navigation size={17} />
            </button>
          </div>

          <div className="safe-single-score-row">
            <div>
              <span>Seller</span>
              <strong>{selectedSpot.sellerDistance}</strong>
            </div>
            <div>
              <span>Buyer</span>
              <strong>{selectedSpot.buyerDistance}</strong>
            </div>
            <div>
              <span>Safety</span>
              <strong>{selectedSpot.score}/100</strong>
            </div>
          </div>

          <div className="safe-single-tags">
            {selectedSpot.tags.map((tag) => (
              <span key={tag}>✓ {tag}</span>
            ))}
          </div>
        </div>

        <div className="safe-single-times-card">
          <h3>Suggested Meeting Times</h3>

          <div>
            {suggestedTimes.map((time) => (
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

        <section className="safe-single-spots-section">
          <h3>
            <span />
            Recommended Safe Spots
          </h3>

          <div className="safe-single-spots-list">
            {visibleSpots.map((spot) => {
              const Icon = spot.icon;
              const isActive = selectedSpot.id === spot.id;

              return (
                <button
                  key={spot.id}
                  type="button"
                  className={
                    isActive ? "safe-single-spot-card active" : "safe-single-spot-card"
                  }
                  onClick={() => handleSelectSpot(spot)}
                >
                  <div className="safe-single-spot-icon">
                    <Icon size={23} />
                  </div>

                  <div>
                    <strong>{spot.name}</strong>
                    <span>{spot.type}</span>
                    <p>Safety Score: {spot.score}/100</p>
                  </div>

                  <div className="safe-single-stars" aria-label="5 stars">
                    <Star size={13} fill="currentColor" />
                    <Star size={13} fill="currentColor" />
                    <Star size={13} fill="currentColor" />
                    <Star size={13} fill="currentColor" />
                    <Star size={13} fill="currentColor" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="safe-single-guidelines">
          <h3>
            <Sun size={18} />
            TindaHan Safe Meet-Up Guidelines
          </h3>

          <p>✔ Meet in public places</p>
          <p>✔ Meet during daylight hours</p>
          <p>✔ Inspect the item before paying</p>
          <p>✔ Never share OTPs or banking passwords</p>
          <p>✔ Report suspicious activity</p>
        </section>
      </section>

      <section className="safe-single-fixed-cta">
        <button type="button" onClick={handleConfirmMeetingPoint}>
          Confirm Meeting Point
        </button>
      </section>
    </main>
  );
}