import {
  Bike,
  Car,
  Check,
  ChevronLeft,
  Clock,
  Coffee,
  Footprints,
  Landmark,
  MapPin,
  Navigation,
  Route,
  ShieldCheck,
  ShoppingBag,
  Store,
  TramFront,
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
    lat: 14.5859,
    lng: 121.0569,
    distanceFromSeller: "1.2 km",
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
    lat: 14.5509,
    lng: 121.0515,
    distanceFromSeller: "1.7 km",
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
    lat: 14.5192,
    lng: 120.9907,
    distanceFromSeller: "3.1 km",
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
    lat: 14.5624,
    lng: 121.0299,
    distanceFromSeller: "2.4 km",
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
    lat: 14.5869,
    lng: 121.0614,
    distanceFromSeller: "1.4 km",
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

function normalizeSpot(rawSpot) {
  if (!rawSpot) return null;

  return {
    id: rawSpot.id || "seller-preferred-meetup-point",
    name: rawSpot.name || "Seller preferred Meet-Up point",
    address: rawSpot.address || "Meet-Up address unavailable",
    type: rawSpot.type || "Safe Meet-Up point",
    score: Number(rawSpot.score || 90),
    lat: Number(rawSpot.lat || 14.5192),
    lng: Number(rawSpot.lng || 120.9907),
    distanceFromSeller:
      rawSpot.distanceFromSeller ||
      rawSpot.distance_from_seller ||
      "Seller area",
    tags: rawSpot.tags || ["Public location", "Seller preferred", "Safe place"],
    sector: rawSpot.sector || "metro_manila",
    icon: rawSpot.icon || MapPin
  };
}

function getBuyerPseudoCoordinates(address) {
  const cleanAddress = String(address || "").trim().toLowerCase();

  if (!cleanAddress) {
    return null;
  }

  let hash = 0;

  for (let index = 0; index < cleanAddress.length; index += 1) {
    hash = cleanAddress.charCodeAt(index) + ((hash << 5) - hash);
  }

  const normalizedA = Math.abs(hash % 1000) / 1000;
  const normalizedB = Math.abs((hash >> 4) % 1000) / 1000;

  return {
    lat: 14.48 + normalizedA * 0.16,
    lng: 120.96 + normalizedB * 0.16
  };
}

function getDistanceKm(pointA, pointB) {
  if (!pointA || !pointB) return null;

  const earthRadius = 6371;
  const lat1 = (pointA.lat * Math.PI) / 180;
  const lat2 = (pointB.lat * Math.PI) / 180;
  const deltaLat = ((pointB.lat - pointA.lat) * Math.PI) / 180;
  const deltaLng = ((pointB.lng - pointA.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.max(0.6, earthRadius * c);
}

function formatDistance(distanceKm) {
  if (!distanceKm) return "Enter your address";

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

function getTravelOptions(distanceKm) {
  const distance = Number(distanceKm || 0);

  if (!distance) {
    return [
      {
        id: "jeep",
        label: "Jeep",
        icon: TramFront,
        time: "—",
        description: "Enter your address to estimate the route."
      },
      {
        id: "tricycle",
        label: "Tricycle",
        icon: Bike,
        time: "—",
        description: "Best for short local trips."
      },
      {
        id: "car",
        label: "Car",
        icon: Car,
        time: "—",
        description: "Fastest option depending on traffic."
      },
      {
        id: "walk",
        label: "Walk",
        icon: Footprints,
        time: "—",
        description: "Available when the point is close enough."
      }
    ];
  }

  const jeepMinutes = Math.max(10, Math.round(distance * 9 + 8));
  const tricycleMinutes = Math.max(7, Math.round(distance * 7 + 5));
  const carMinutes = Math.max(6, Math.round(distance * 5 + 6));
  const walkMinutes = Math.max(8, Math.round(distance * 13));

  return [
    {
      id: "jeep",
      label: "Jeep",
      icon: TramFront,
      time: `${jeepMinutes} min`,
      description: "Budget-friendly option. May include short walking time."
    },
    {
      id: "tricycle",
      label: "Tricycle",
      icon: Bike,
      time: `${tricycleMinutes} min`,
      description: "Useful for local streets and short-distance access."
    },
    {
      id: "car",
      label: "Car",
      icon: Car,
      time: `${carMinutes} min`,
      description: "Fastest route estimate, traffic may vary."
    },
    {
      id: "walk",
      label: "Walk",
      icon: Footprints,
      time: `${walkMinutes} min`,
      description:
        distance > 4
          ? "Possible but not recommended for this distance."
          : "Simple route if you are nearby."
    }
  ];
}

function getMapPosition(point, fallback = { left: 50, top: 50 }) {
  if (!point) return fallback;

  const left = Math.min(88, Math.max(12, ((point.lng - 120.94) / 0.2) * 100));
  const top = Math.min(82, Math.max(14, 100 - ((point.lat - 14.45) / 0.22) * 100));

  return {
    left,
    top
  };
}

export default function SafeMeetUp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const returnTo = searchParams.get("returnTo") || "product";

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Recommended");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedTime, setSelectedTime] = useState("3:00 PM");
  const [saving, setSaving] = useState(false);
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerCoords, setBuyerCoords] = useState(null);
  const [activeTransport, setActiveTransport] = useState("jeep");

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

      const sellerSpot = normalizeSpot(data?.seller_meetup_spot);

      setListing(data || null);

      try {
        const savedBuyerPlan = JSON.parse(
          localStorage.getItem(getMeetupStorageKey(id)) || "null"
        );

        if (savedBuyerPlan?.buyerAddress) {
          setBuyerAddress(savedBuyerPlan.buyerAddress);
          setBuyerCoords(
            savedBuyerPlan.buyerCoords ||
              getBuyerPseudoCoordinates(savedBuyerPlan.buyerAddress)
          );
        }

        if (savedBuyerPlan?.transport) {
          setActiveTransport(savedBuyerPlan.transport);
        }

        if (savedBuyerPlan?.spot) {
          setSelectedSpot(normalizeSpot(savedBuyerPlan.spot));
          setSelectedTime(savedBuyerPlan.time || "3:00 PM");
        } else if (sellerSpot) {
          setSelectedSpot(sellerSpot);
          setSelectedTime(sellerSpot.time || "3:00 PM");
        } else {
          setSelectedSpot(safeSpots[0]);
        }
      } catch {
        setSelectedSpot(sellerSpot || safeSpots[0]);
      }

      setLoading(false);
    }

    loadListing();

    return () => {
      mounted = false;
    };
  }, [id]);

  const sellerPreferredSpot = useMemo(() => {
    return normalizeSpot(listing?.seller_meetup_spot);
  }, [listing?.seller_meetup_spot]);

  const displayedSelectedSpot = useMemo(() => {
    return normalizeSpot(selectedSpot);
  }, [selectedSpot]);

  const buyerPoint = useMemo(() => {
    return buyerCoords || getBuyerPseudoCoordinates(buyerAddress);
  }, [buyerCoords, buyerAddress]);

  const selectedDistanceKm = useMemo(() => {
    return getDistanceKm(buyerPoint, displayedSelectedSpot);
  }, [buyerPoint, displayedSelectedSpot]);

  const travelOptions = useMemo(() => {
    return getTravelOptions(selectedDistanceKm);
  }, [selectedDistanceKm]);

  const selectedTransportOption = useMemo(() => {
    return (
      travelOptions.find((option) => option.id === activeTransport) ||
      travelOptions[0]
    );
  }, [travelOptions, activeTransport]);

  const filteredSpots = useMemo(() => {
    const allSpots = sellerPreferredSpot
      ? [
          sellerPreferredSpot,
          ...safeSpots.filter((spot) => spot.id !== sellerPreferredSpot.id)
        ]
      : safeSpots;

    if (activeFilter === "Recommended") {
      return [...allSpots].sort((a, b) => b.score - a.score);
    }

    if (activeFilter === "Nearby") {
      return [...allSpots].sort((a, b) => {
        const distanceA = getDistanceKm(buyerPoint, a) || 999;
        const distanceB = getDistanceKm(buyerPoint, b) || 999;

        return distanceA - distanceB;
      });
    }

    return allSpots.filter((spot) => spot.type === activeFilter);
  }, [activeFilter, buyerPoint, sellerPreferredSpot]);

  const isAlternativeToSellerSpot =
    Boolean(sellerPreferredSpot && displayedSelectedSpot) &&
    displayedSelectedSpot.id !== sellerPreferredSpot.id;

  const buyerMapPosition = getMapPosition(buyerPoint, { left: 24, top: 68 });
  const meetupMapPosition = getMapPosition(displayedSelectedSpot, {
    left: 72,
    top: 34
  });

  function handleBack() {
    if (returnTo === "checkout") {
      navigate(`/checkout/${id}?delivery=meetup`);
      return;
    }

    navigate(`/item/${id}`);
  }

  function handleAddressSubmit(event) {
    event.preventDefault();

    const cleanAddress = buyerAddress.trim();

    if (!cleanAddress) {
      alert("Please enter your address first.");
      return;
    }

    setBuyerCoords(getBuyerPseudoCoordinates(cleanAddress));
  }

  function saveBuyerMeetupPoint() {
    if (!displayedSelectedSpot || saving) return;

    if (!buyerAddress.trim()) {
      alert("Please enter your address to check the route first.");
      return;
    }

    setSaving(true);

    const plan = {
      spot: displayedSelectedSpot,
      sellerSpot: sellerPreferredSpot || null,
      time: selectedTime,
      date: getTodayLabel(),
      buyerAddress: buyerAddress.trim(),
      buyerCoords: buyerPoint,
      distanceKm: selectedDistanceKm,
      distanceLabel: formatDistance(selectedDistanceKm),
      transport: activeTransport,
      transportLabel: selectedTransportOption?.label || "Jeep",
      transportTime: selectedTransportOption?.time || "",
      buyerSuggestedAlternative: isAlternativeToSellerSpot,
      status: isAlternativeToSellerSpot
        ? "pending_seller_review"
        : "accepted_seller_point",
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
      <main className="safe-meetup-page safe-meetup-route-page">
        <header className="safe-meetup-header safe-meetup-route-header">
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
      <main className="safe-meetup-page safe-meetup-route-page">
        <header className="safe-meetup-header safe-meetup-route-header">
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
    <main className="safe-meetup-page safe-meetup-route-page">
      <header className="safe-meetup-header safe-meetup-route-header">
        <button type="button" onClick={handleBack} aria-label="Go back">
          <ChevronLeft size={28} />
        </button>

        <h1>Safe Meet-Up</h1>

        <span />
      </header>

      <section className="safe-meetup-route-container">
        <section className="safe-meetup-intro safe-meetup-route-intro">
          <div className="safe-meetup-intro-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <strong>Check your route before choosing this Meet-Up point.</strong>
            <p>
              Enter your address to estimate the distance and compare jeep,
              tricycle, car and walking options before continuing to checkout.
            </p>
          </div>
        </section>

        {sellerPreferredSpot && (
          <section className="safe-meetup-seller-point safe-meetup-seller-point-safe">
            <span>Seller preferred Meet-Up point</span>
            <strong>{sellerPreferredSpot.name}</strong>
            <p>{sellerPreferredSpot.address}</p>

            <div>
              <em>Safety Score {sellerPreferredSpot.score}/100</em>
              <em>{sellerPreferredSpot.type}</em>
            </div>
          </section>
        )}

        <section className="safe-meetup-map-card">
          <div className="safe-meetup-map-heading">
            <div>
              <strong>Route overview</strong>
              <p>
                {buyerAddress.trim()
                  ? `${formatDistance(selectedDistanceKm)} to ${displayedSelectedSpot?.name}`
                  : "Enter your address to show the route."}
              </p>
            </div>

            <span>
              <Route size={16} />
              {selectedTransportOption?.time || "—"}
            </span>
          </div>

          <div className="safe-meetup-route-map">
            <div className="safe-map-grid" />

            {buyerPoint && displayedSelectedSpot && (
              <svg className="safe-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line
                  x1={buyerMapPosition.left}
                  y1={buyerMapPosition.top}
                  x2={meetupMapPosition.left}
                  y2={meetupMapPosition.top}
                />
              </svg>
            )}

            <div
              className={buyerPoint ? "safe-map-buyer-marker active" : "safe-map-buyer-marker"}
              style={{
                left: `${buyerMapPosition.left}%`,
                top: `${buyerMapPosition.top}%`
              }}
            >
              <Navigation size={15} />
              <span>You</span>
            </div>

            <button
              type="button"
              className="safe-map-meetup-marker"
              style={{
                left: `${meetupMapPosition.left}%`,
                top: `${meetupMapPosition.top}%`
              }}
              aria-label={displayedSelectedSpot?.name}
            >
              <MapPin size={18} />
              <span>Meet-Up</span>
            </button>
          </div>

          <p className="safe-meetup-map-note">
            The map area allows pinch zoom. Enter your address to trace the
            distance between your home and the Meet-Up point.
          </p>
        </section>

        <section className="safe-meetup-filters safe-meetup-route-filters">
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

        <section className="safe-meetup-spots safe-meetup-route-spots">
          <div className="safe-meetup-section-title">
            <strong>Available Meet-Up points</strong>
            <p>Select the seller point or compare nearby safe locations.</p>
          </div>

          <div className="safe-meetup-spots-list">
            {filteredSpots.map((spot) => {
              const normalizedSpot = normalizeSpot(spot);
              const Icon = normalizedSpot.icon || MapPin;
              const isSelected = displayedSelectedSpot?.id === normalizedSpot.id;
              const spotDistance = getDistanceKm(buyerPoint, normalizedSpot);

              return (
                <button
                  key={normalizedSpot.id}
                  type="button"
                  className={isSelected ? "safe-spot-card active" : "safe-spot-card"}
                  onClick={() => setSelectedSpot(normalizedSpot)}
                >
                  <div className="safe-spot-icon">
                    <Icon size={22} />
                  </div>

                  <div>
                    <strong>{normalizedSpot.name}</strong>
                    <span>{normalizedSpot.address}</span>

                    <div className="safe-spot-score">
                      Safety Score: {normalizedSpot.score}/100
                    </div>

                    <div className="safe-spot-distance">
                      {buyerAddress.trim()
                        ? `${formatDistance(spotDistance)} from your address`
                        : "Enter address to calculate distance"}
                    </div>

                    <ul>
                      {normalizedSpot.tags.slice(0, 4).map((tag) => (
                        <li key={tag}>✓ {tag}</li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {displayedSelectedSpot && (
          <section className="safe-meetup-bottom-sheet safe-meetup-route-summary">
            <div className="safe-meetup-sheet-handle" />

            <h2>Meet-Up option selected</h2>

            <div className="safe-meetup-selected-card">
              <div className="safe-meetup-selected-icon">
                <MapPin size={22} />
              </div>

              <div>
                <strong>{displayedSelectedSpot.name}</strong>
                <span>{displayedSelectedSpot.address}</span>
                <p>
                  {buyerAddress.trim()
                    ? `${formatDistance(selectedDistanceKm)} from your address`
                    : "Enter your address to estimate distance"}
                </p>
                <em>Safety Score: {displayedSelectedSpot.score}/100</em>
              </div>
            </div>

            <form className="safe-meetup-inline-address" onSubmit={handleAddressSubmit}>
              <label>
                <span>Your address</span>

                <input
                  type="text"
                  value={buyerAddress}
                  onChange={(event) => setBuyerAddress(event.target.value)}
                  placeholder="Enter your barangay, street or city"
                />
              </label>

              <button type="submit">
                <Navigation size={17} />
                Show route
              </button>
            </form>

            <div className="safe-meetup-summary-transport-grid">
              {travelOptions.map((option) => {
                const Icon = option.icon;
                const isActive = activeTransport === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={
                      isActive
                        ? "safe-meetup-summary-transport active"
                        : "safe-meetup-summary-transport"
                    }
                    onClick={() => setActiveTransport(option.id)}
                  >
                    <Icon size={20} />
                    <strong>{option.label}</strong>
                    <span>{option.time}</span>
                  </button>
                );
              })}
            </div>

            <div className="safe-meetup-route-choice">
              <Clock size={18} />

              <div>
                <strong>
                  {selectedTransportOption?.label} · {selectedTransportOption?.time}
                </strong>
                <p>{selectedTransportOption?.description}</p>
              </div>
            </div>

            {isAlternativeToSellerSpot && (
              <div className="safe-meetup-warning">
                <ShieldCheck size={18} />
                <p>
                  This is different from the seller’s preferred location. A request
                  will be sent to the seller after purchase.
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
              disabled={saving || !buyerAddress.trim()}
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Check size={18} />
                  Continue with this Meet-Up point
                </>
              )}
            </button>
          </section>
        )}
      </section>
    </main>
  );
}