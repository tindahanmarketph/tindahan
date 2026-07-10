import { supabase } from "./supabase";

export function formatRealtimePrice(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function createTrackingNumber() {
  const timestamp = String(Date.now()).slice(-9);
  const random = Math.floor(100000 + Math.random() * 900000);

  return `TH-JT-${timestamp}${random}`;
}

export function addDays(dateValue, days) {
  const date = new Date(dateValue);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function formatRealtimeDate(dateValue) {
  if (!dateValue) return "";

  return new Date(dateValue).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatRealtimeDateTime(dateValue) {
  if (!dateValue) return "";

  return new Date(dateValue).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function mapConversationRow(row) {
  if (!row) return null;

  const snapshot = row.listing_snapshot || {};

  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    sellerName: snapshot.sellerName || "Seller",
    sellerLocation: snapshot.sellerLocation || "Philippines",
    lastSeen: snapshot.lastSeen || "Recently active",
    listing: {
      id: row.listing_id,
      title: snapshot.title || "Item",
      price: snapshot.price || 0,
      photo: snapshot.photo || "",
      sellerId: row.seller_id
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: []
  };
}

function mapMessageRow(row, currentUserId) {
  if (!row) return null;

  const payload = row.payload || {};

  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    sender: row.sender_id === currentUserId ? "me" : payload.senderRole || "other",
    text: row.body || "",
    type: row.message_type || "text",
    photos: payload.photos || [],
    offer: payload.offer || null,
    orderId: payload.orderId || null,
    payload,
    createdAt: row.created_at
  };
}

function mapOfferRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    conversationId: row.conversation_id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    itemPrice: Number(row.item_price || 0),
    offerPrice: Number(row.offer_price || 0),
    buyerProtection: Number(row.buyer_protection || 0),
    protectedTotal: Number(row.protected_total || 0),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapOrderRow(row, trackingEvents = []) {
  if (!row) return null;

  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingPhoto: row.listing_photo || "",
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    sellerUsername: row.seller_username || "Seller",
    originalItemPrice: Number(row.original_item_price || 0),
    acceptedOfferPrice: row.accepted_offer_price
      ? Number(row.accepted_offer_price)
      : null,
    itemPrice: Number(row.item_price || 0),
    buyerProtection: Number(row.buyer_protection || 0),
    shippingFee: Number(row.shipping_fee || 0),
    total: Number(row.total || 0),
    deliveryMethod: row.delivery_method,
    paymentMethod: row.payment_method,
    address: row.address || {},
    meetup: row.meetup || null,
    carrier: row.carrier || "J&T Express",
    trackingNumber: row.tracking_number,
    shippingLabelDownloaded: Boolean(row.shipping_label_downloaded),
    sellerShippingChoice: row.seller_shipping_choice || "",
    pickupScheduledAt: row.pickup_scheduled_at,
    maxShippingDate: row.max_shipping_date,
    estimatedDeliveryStart: row.estimated_delivery_start,
    estimatedDeliveryEnd: row.estimated_delivery_end,
    deliveryInstructions: row.delivery_instructions || "",
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    trackingEvents
  };
}

export async function getOrCreateConversation({
  listing,
  seller,
  buyer,
  firstPhoto
}) {
  if (!listing?.id) {
    throw new Error("Missing listing.");
  }

  if (!buyer?.id) {
    throw new Error("You must be logged in.");
  }

  const sellerId = listing.seller_id || seller?.id;

  if (!sellerId) {
    throw new Error("Missing seller.");
  }

  if (String(sellerId) === String(buyer.id)) {
    throw new Error("You cannot message yourself on your own listing.");
  }

  const listingSnapshot = {
    title: listing.title || "Item",
    price: Number(listing.price || 0),
    photo: firstPhoto || listing.photos?.[0] || "",
    sellerName: seller?.username || "Seller",
    sellerLocation: listing.location || "Philippines",
    lastSeen: "Recently active"
  };

  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("*")
    .eq("listing_id", listing.id)
    .eq("buyer_id", buyer.id)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return mapConversationRow(existing);
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      listing_id: listing.id,
      buyer_id: buyer.id,
      seller_id: sellerId,
      listing_snapshot: listingSnapshot
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapConversationRow(data);
}

export async function getOrCreateConversationFromListingId({
  listingId,
  buyer
}) {
  if (!listingId) {
    throw new Error("Missing listing ID.");
  }

  if (!buyer?.id) {
    throw new Error("You must be logged in.");
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    throw listingError;
  }

  if (!listing) {
    throw new Error("Listing unavailable.");
  }

  let seller = null;

  if (listing.seller_id) {
    const { data: sellerData } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", listing.seller_id)
      .maybeSingle();

    seller = sellerData || null;
  }

  return getOrCreateConversation({
    listing,
    seller,
    buyer,
    firstPhoto: listing.photos?.[0] || ""
  });
}

export async function fetchConversationsForUser(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(mapConversationRow).filter(Boolean);
}

export async function fetchMessagesForConversation(conversationId, currentUserId) {
  if (!conversationId) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .map((row) => mapMessageRow(row, currentUserId))
    .filter(Boolean);
}

export async function sendTextMessage({
  conversationId,
  senderId,
  text,
  photos = []
}) {
  if (!conversationId) {
    throw new Error("Missing conversation.");
  }

  if (!senderId) {
    throw new Error("Missing sender.");
  }

  const cleanText = String(text || "").trim();

  if (!cleanText && photos.length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      message_type: "text",
      body: cleanText,
      payload: {
        photos
      }
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return mapMessageRow(data, senderId);
}

export async function sendSystemMessage({
  conversationId,
  senderId,
  type,
  text,
  payload = {}
}) {
  if (!conversationId || !senderId) return null;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      message_type: type || "system",
      body: text || "",
      payload
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return mapMessageRow(data, senderId);
}

export async function createOfferMessage({
  conversation,
  listing,
  buyerId,
  sellerId,
  senderId,
  senderRole,
  itemPrice,
  offerPrice
}) {
  if (!conversation?.id) {
    throw new Error("Missing conversation.");
  }

  const buyerProtection = Number(offerPrice || 0) * 0.08;
  const protectedTotal = Number(offerPrice || 0) + buyerProtection;

  const { data: offerRow, error: offerError } = await supabase
    .from("offers")
    .insert({
      conversation_id: conversation.id,
      listing_id: listing.id,
      buyer_id: buyerId,
      seller_id: sellerId,
      sender_id: senderId,
      sender_role: senderRole,
      item_price: itemPrice,
      offer_price: offerPrice,
      buyer_protection: buyerProtection,
      protected_total: protectedTotal,
      status: "pending"
    })
    .select("*")
    .single();

  if (offerError) {
    throw offerError;
  }

  const offer = mapOfferRow(offerRow);

  const text =
    senderRole === "seller_counter_offer"
      ? `I can offer this item for ₱${formatRealtimePrice(offerPrice)}.`
      : `I would like to make an offer of ₱${formatRealtimePrice(
          offerPrice
        )} for this item.`;

  const { data: messageRow, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      sender_id: senderId,
      message_type: "offer",
      body: text,
      payload: {
        offer
      }
    })
    .select("*")
    .single();

  if (messageError) {
    throw messageError;
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversation.id);

  return mapMessageRow(messageRow, senderId);
}

export async function updateOfferStatus({
  conversationId,
  messageId,
  offer,
  nextStatus,
  currentUserId
}) {
  if (!offer?.id) {
    throw new Error("Missing offer.");
  }

  const { data: updatedOffer, error: offerError } = await supabase
    .from("offers")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", offer.id)
    .select("*")
    .single();

  if (offerError) {
    throw offerError;
  }

  const mappedOffer = mapOfferRow(updatedOffer);

  const { error: messageError } = await supabase
    .from("messages")
    .update({
      payload: {
        offer: mappedOffer
      }
    })
    .eq("id", messageId);

  if (messageError) {
    throw messageError;
  }

  await sendSystemMessage({
    conversationId,
    senderId: currentUserId,
    type: "offer_status",
    text:
      nextStatus === "accepted"
        ? `Offer accepted at ₱${formatRealtimePrice(mappedOffer.offerPrice)}.`
        : `Offer declined at ₱${formatRealtimePrice(mappedOffer.offerPrice)}.`,
    payload: {
      offer: mappedOffer
    }
  });

  return mappedOffer;
}

export function subscribeToConversationMessages({
  conversationId,
  onInsert,
  onUpdate
}) {
  if (!conversationId) return null;

  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        onInsert?.(payload.new);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        onUpdate?.(payload.new);
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToUserConversations({ userId, onChange }) {
  if (!userId) return null;

  const channel = supabase
    .channel(`conversations-user-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "conversations"
      },
      () => {
        onChange?.();
      }
    )
    .subscribe();

  return channel;
}

export async function removeRealtimeChannel(channel) {
  if (!channel) return;

  await supabase.removeChannel(channel);
}