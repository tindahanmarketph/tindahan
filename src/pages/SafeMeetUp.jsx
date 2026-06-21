import {
  Banknote,
  Building2,
  ChevronLeft,
  Coffee,
  MapPin,
  Navigation,
  ShieldCheck,
  ShoppingBag,
  Store,
  Sun,
  Utensils,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const filters = ["Recommended", "Mall", "Coffee Shop", "Fast Food", "Bank", "Nearby"];

const safeSpots = [
  {
    id: "starbucks-sm-megamall",
    name: "Starbucks - SM Megamall",
    type: "Coffee Shop",
    icon: Coffee,
    score: 95,
    buyerDistance: "2.1 km",
    sellerDistance: "1.2 km",
    address: "SM Megamall, Mandaluyong City",
    tags: ["CCTV monitored", "High foot traffic", "Indoor location", "Well-lit area"],
    position: { top: "28%", left: "55%" }
  },
  {
    id: "sm-megamall",
    name: "SM Mall Meet-Up Area",
    type: "Mall",
    icon: ShoppingBag,
    score: 94,
    buyerDistance: "2.4 km",
    sellerDistance: "1.5 km",
    address: "SM Megamall, Ortigas Center",
    tags: ["Security guards nearby", "Indoor location", "High foot traffic", "Open late"],
    position: { top: "38%", left: "42%" }
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
    tags: ["Public location", "High foot traffic", "Well-lit area", "Easy to find"],
    position: { top: "50%", left: "62%" }
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
    tags: ["CCTV monitored", "Bank security", "Indoor location", "Bright area"],
    position: { top: "60%", left: "46%" }
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
    tags: ["Open 24/7", "Public location", "Well-lit area", "Easy access"],
    position: { top: "44%", left: "25%" }
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
    tags: ["Police nearby", "Highly visible", "Public area", "High security"],
    position: { top: "22%", left: "34%" }
  }
];

const suggestedTimes = ["10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"];

function getStorageKey(id) {
  return `tindahan_safe_meetup_${id}`;
}

function getNextSaturdayLabel() {
  return "Saturday, June 20";
}

export default function SafeMeetUp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("Recommended");
  const [selectedSpot, setSelectedSpot] = useState(safeSpots[0]);
  const [selectedTime, setSelectedTime] = useState("3:00 PM");
  const [step, setStep] = useState("select");
  const [buyerArrived, setBuyerArrived] = useState(false);
  const [sellerArrived, setSellerArrived] = useState(false);

  const visibleSpots = useMemo(() => {
    if (activeFilter === "Recommended") {
      return safeSpots.filter((spot) => spot.score >= 90);
    }

    if (activeFilter === "Nearby") {
      return safeSpots.filter((spot) => spot.type === "Nearby" || spot.buyerDistance.startsWith("1."));
    }

    return safeSpots.filter((spot) => spot.type === activeFilter);
  }, [activeFilter]);

  function selectSpot(spot) {
    setSelectedSpot(spot);
  }

  function continueToConfirm() {
    setStep("confirm");
  }

  function sendMeetupRequest() {
    const meetup = {
      listingId: id,
      spot: selectedSpot,
      date: getNextSaturdayLabel(),
      time: selectedTime,
      status: "request_sent",
      buyerArrived: false,
      sellerArrived: false,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(getStorageKey(id), JSON.stringify(meetup));
    setStep("status");
  }

  function confirmMeetingPoint() {
    const meetup = {
      listingId: id,
      spot: selectedSpot,
      date: getNextSaturdayLabel(),
      time: selectedTime,
      status: "selected",
      buyerArrived,
      sellerArrived,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(getStorageKey(id), JSON.stringify(meetup));
    navigate(`/checkout/${id}?delivery=meetup`);
  }

  function openDirections() {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        selectedSpot.name + " " + selectedSpot.address
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (step === "confirm") {
    return (
      <main className="safe-meetup-page">
        <header className="safe-meetup-header">
          <button type="button" onClick={() => setStep("select")} aria-label="Go back">
            <ChevronLeft size={27} />
          </button>
          <h1>Safe Meet-Up Request</h1>
          <span />
        </header>

        <section className="safe-confirm-card">
          <div className="safe-confirm-icon">
            <ShieldCheck size={42} />
          </div>

          <h2>{selectedSpot.name}</h2>
          <p>{selectedSpot.address}</p>

          <div className="safe-confirm-details">
            <div>
              <span>Date</span>
              <strong>{getNextSaturdayLabel()}</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{selectedTime}</strong>
            </div>
            <div>
              <span>Safety Score</span>
              <strong>{selectedSpot.score}/100</strong>
            </div>
          </div>

          <div className="safe-guidelines-card">
            <h3>🛡️ TindaHan Safe Meet-Up Guidelines</h3>
            <p>✔ Meet in public places</p>
            <p>✔ Meet during daylight hours</p>
            <p>✔ Inspect the item before paying</p>
            <p>✔ Never share OTPs or banking passwords</p>
            <p>✔ Report suspicious activity</p>
          </div>
        </section>

        <section className="safe-fixed-cta">
          <button type="button" onClick={sendMeetupRequest}>
            Send Meet-Up Request
          </button>
        </section>
      </main>
    );
  }

  if (step === "status") {
    return (
      <main className="safe-meetup-page">
        <header className="safe-meetup-header">
          <button type="button" onClick={() => setStep("confirm")} aria-label="Go back">
            <ChevronLeft size={27} />
          </button>
          <h1>Meet-Up Confirmed</h1>
          <span />
        </header>

        <section className="safe-status-card">
          <div className="safe-confirm-icon">
            <ShieldCheck size={42} />
          </div>

          <h2>Meet-Up Confirmed</h2>
          <p>{selectedSpot.name}</p>

          <div className="safe-confirm-details">
            <div>
              <span>Location</span>
              <strong>{selectedSpot.address}</strong>
            </div>
            <div>
              <span>Date & Time</span>
              <strong>
                {getNextSaturdayLabel()} · {selectedTime}
              </strong>
            </div>
          </div>

          <button type="button" className="safe-directions-button" onClick={openDirections}>
            <Navigation size={18} />
            Open Directions
          </button>

          <div className="safe-arrival-card">
            <h3>I'm Here</h3>
            <p>Both buyer and seller can confirm once they arrive.</p>

            <button
              type="button"
              className={buyerArrived ? "arrived" : ""}
              onClick={() => setBuyerArrived(true)}
            >
              {buyerArrived ? "🟢 Buyer arrived" : "I am here as buyer"}
            </button>

            <button
              type="button"
              className={sellerArrived ? "arrived" : ""}
              onClick={() => setSellerArrived(true)}
            >
              {sellerArrived ? "🟢 Seller arrived" : "I am here as seller"}
            </button>
          </div>

          {buyerArrived && sellerArrived && (
            <div className="safe-completed-card">
              <h3>Was the transaction completed?</h3>
              <button type="button" onClick={confirmMeetingPoint}>
                ✅ Yes, Item Received
              </button>
              <button type="button" className="secondary">
                ❌ No
              </button>
            </div>
          )}
        </section>

        <section className="safe-fixed-cta">
          <button type="button" onClick={confirmMeetingPoint}>
            Confirm Meeting Point
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="safe-meetup-page">
      <header className="safe-meetup-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>🛡️ Safe Meet-Up</h1>
        <button type="button" onClick={() => navigate(`/checkout/${id}`)} aria-label="Close">
          <X size={24} />
        </button>
      </header>

      <section className="safe-meetup-intro">
        <h2>Choose a public location where you and the seller can meet safely.</h2>
        <p>
          TindaHan recommends verified, public and high-traffic locations to help
          protect both buyer and seller.
        </p>
      </section>

      <section className="safe-filter-row">
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

      <section className="safe-map-card">
        <div className="safe-map-background">
          <span className="safe-user-dot">You</span>

          {visibleSpots.map((spot) => {
            const Icon = spot.icon;
            const isActive = selectedSpot.id === spot.id;

            return (
              <button
                key={spot.id}
                type="button"
                className={isActive ? "safe-map-pin active" : "safe-map-pin"}
                style={{
                  top: spot.position.top,
                  left: spot.position.left
                }}
                onClick={() => selectSpot(spot)}
                aria-label={spot.name}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="safe-spot-list">
        <h2>🟢 Recommended Safe Spots</h2>

        {visibleSpots.map((spot) => {
          const Icon = spot.icon;
          const isActive = selectedSpot.id === spot.id;

          return (
            <button
              key={spot.id}
              type="button"
              className={isActive ? "safe-spot-card active" : "safe-spot-card"}
              onClick={() => selectSpot(spot)}
            >
              <div className="safe-spot-icon">
                <Icon size={23} />
              </div>

              <div>
                <strong>{spot.name}</strong>
                <span>{spot.type}</span>
                <p>Safety Score: {spot.score}/100</p>
              </div>

              <em>⭐⭐⭐⭐⭐</em>
            </button>
          );
        })}
      </section>

      {selectedSpot && (
        <section className="safe-bottom-sheet">
          <div className="safe-sheet-handle" />

          <h2>Meeting Point Selected</h2>

          <div className="safe-selected-title">
            <MapPin size={20} />
            <div>
              <strong>{selectedSpot.name}</strong>
              <span>{selectedSpot.address}</span>
            </div>
          </div>

          <div className="safe-distance-grid">
            <div>
              <span>Seller</span>
              <strong>{selectedSpot.sellerDistance}</strong>
            </div>
            <div>
              <span>Buyer</span>
              <strong>{selectedSpot.buyerDistance}</strong>
            </div>
            <div>
              <span>Safety Score</span>
              <strong>{selectedSpot.score}/100</strong>
            </div>
          </div>

          <div className="safe-tags">
            {selectedSpot.tags.map((tag) => (
              <span key={tag}>✓ {tag}</span>
            ))}
          </div>

          <div className="safe-times">
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

          <button type="button" className="safe-sheet-continue" onClick={continueToConfirm}>
            Continue
          </button>
        </section>
      )}
    </main>
  );
}