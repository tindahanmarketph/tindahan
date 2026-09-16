async function fetchUserListings(profileId, isOwnProfile = false) {
  const columnsToTry = [
    "seller_id",
    "user_id",
    "profile_id"
  ];

  const allowedStatuses = isOwnProfile
    ? [
        "active",
        "available",
        "reserved",
        "sold"
      ]
    : [
        "active",
        "available",
        "reserved"
      ];

  for (const column of columnsToTry) {
    const { data, error } =
      await supabase
        .from("listings")
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url,
            rating,
            is_verified,
            holiday_mode
          )
        `)
        .eq(
          column,
          profileId
        )
        .in(
          "status",
          allowedStatuses
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (!error) {
      const listings =
        data || [];

      /*
       * Owner:
       * sees available + reserved + sold.
       */
      if (isOwnProfile) {
        return listings;
      }

      /*
       * Public visitor:
       * never sees sold items.
       */
      return listings.filter(
        (listing) =>
          !listing.profiles?.holiday_mode &&
          String(
            listing.status || "active"
          ).toLowerCase() !== "sold"
      );
    }

    const fallback =
      await supabase
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
        .eq(
          column,
          profileId
        )
        .in(
          "status",
          allowedStatuses
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (!fallback.error) {
      const listings =
        fallback.data || [];

      if (isOwnProfile) {
        return listings;
      }

      return listings.filter(
        (listing) =>
          String(
            listing.status || "active"
          ).toLowerCase() !== "sold"
      );
    }
  }

  return [];
}