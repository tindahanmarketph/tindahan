import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ListingCard from "./ListingCard";
import { supabase } from "../lib/supabase";

async function fetchMemberListings(listing) {
  if (!listing) return [];

  const ownerId =
    listing.seller_id ||
    listing.user_id ||
    listing.profile_id ||
    listing.profiles?.id ||
    listing.seller?.id;

  if (!ownerId) return [];

  const ownerColumns = ["seller_id", "user_id", "profile_id"];

  for (const column of ownerColumns) {
    const { data, error } = await supabase
      .from("listings")
      .select(`
        *,
        profiles (
          id,
          username,
          avatar_url,
          rating,
          is_verified
        )
      `)
      .eq(column, ownerId)
      .neq("id", listing.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error) {
      return data || [];
    }
  }

  return [];
}

async function fetchSimilarListings(listing) {
  if (!listing) return [];

  let query = supabase
    .from("listings")
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url,
        rating,
        is_verified
      )
    `)
    .neq("id", listing.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(12);

  if (listing.child_category) {
    query = query.eq("child_category", listing.child_category);
  } else if (listing.subcategory) {
    query = query.eq("subcategory", listing.subcategory);
  } else if (listing.category) {
    query = query.eq("category", listing.category);
  }

  const { data, error } = await query;

  if (!error && data?.length) {
    return data;
  }

  if (listing.category) {
    const fallback = await supabase
      .from("listings")
      .select(`
        *,
        profiles (
          id,
          username,
          avatar_url,
          rating,
          is_verified
        )
      `)
      .neq("id", listing.id)
      .eq("status", "active")
      .eq("category", listing.category)
      .order("created_at", { ascending: false })
      .limit(12);

    if (!fallback.error) {
      return fallback.data || [];
    }
  }

  return [];
}

function SectionSkeleton() {
  return (
    <div className="listing-reco-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="listing-reco-skeleton" key={index}>
          <div className="listing-reco-skeleton-image" />
          <div className="listing-reco-skeleton-line" />
          <div className="listing-reco-skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

function BundleBox({ memberListings }) {
  if (!memberListings.length) return null;

  return (
    <div className="member-bundle-box">
      <div>
        <strong>Buy a bundle</strong>
        <p>Get a discount when you buy several items from this member.</p>
      </div>

      <Link to="/sell" className="member-bundle-button">
        Create a bundle
      </Link>
    </div>
  );
}

function ListingSection({ title, subtitle, children }) {
  return (
    <section className="listing-reco-section">
      <div className="listing-reco-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      {children}
    </section>
  );
}

export default function ListingRecommendations({ listing }) {
  const [activeTab, setActiveTab] = useState("member");
  const [memberListings, setMemberListings] = useState([]);
  const [similarListings, setSimilarListings] = useState([]);
  const [loadingMember, setLoadingMember] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  const sellerName = useMemo(() => {
    return (
      listing?.profiles?.username ||
      listing?.seller?.username ||
      listing?.username ||
      "this member"
    );
  }, [listing]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      if (!listing?.id) return;

      setLoadingMember(true);
      setLoadingSimilar(true);

      const [memberData, similarData] = await Promise.all([
        fetchMemberListings(listing),
        fetchSimilarListings(listing)
      ]);

      if (cancelled) return;

      setMemberListings(memberData);
      setSimilarListings(similarData);
      setLoadingMember(false);
      setLoadingSimilar(false);
    }

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [listing]);

  if (!listing?.id) return null;

  const hasMemberListings = memberListings.length > 0;
  const hasSimilarListings = similarListings.length > 0;

  if (!loadingMember && !loadingSimilar && !hasMemberListings && !hasSimilarListings) {
    return null;
  }

  return (
    <div className="listing-recommendations">
      <div className="listing-reco-mobile-tabs">
        <button
          type="button"
          className={activeTab === "member" ? "active" : ""}
          onClick={() => setActiveTab("member")}
        >
          Member closet
        </button>

        <button
          type="button"
          className={activeTab === "similar" ? "active" : ""}
          onClick={() => setActiveTab("similar")}
        >
          Similar items
        </button>
      </div>

      <div
        className={`listing-reco-panel ${
          activeTab === "member" ? "mobile-active" : ""
        }`}
      >
        <ListingSection
          title="Member closet"
          subtitle={`More items listed by ${sellerName}`}
        >
          {loadingMember ? (
            <SectionSkeleton />
          ) : hasMemberListings ? (
            <>
              <BundleBox memberListings={memberListings} />

              <div className="listing-reco-grid">
                {memberListings.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            </>
          ) : (
            <div className="listing-reco-empty">
              This member has no other active items for now.
            </div>
          )}
        </ListingSection>
      </div>

      <div
        className={`listing-reco-panel ${
          activeTab === "similar" ? "mobile-active" : ""
        }`}
      >
        <ListingSection
          title="Similar items"
          subtitle="You may also like these listings"
        >
          {loadingSimilar ? (
            <SectionSkeleton />
          ) : hasSimilarListings ? (
            <div className="listing-reco-grid">
              {similarListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="listing-reco-empty">
              No similar items found for now.
            </div>
          )}
        </ListingSection>
      </div>
    </div>
  );
}