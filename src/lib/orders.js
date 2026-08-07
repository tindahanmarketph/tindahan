import { supabase } from "./supabase";
import {
  addDays,
  createTrackingNumber,
  formatRealtimeDate,
  formatRealtimeDateTime,
  formatRealtimePrice,
  getOrCreateConversationFromListingId,
  mapOrderRow,
  sendSystemMessage
} from "./tindahanRealtime";

export function formatTindaHanPrice(value) {
  return formatRealtimePrice(value);
}

export function formatOrderDate(dateValue) {
  return formatRealtimeDate(dateValue);
}

export function formatOrderDateTime(dateValue) {
  return formatRealtimeDateTime(dateValue);
}

function mapOrderWithMeetupFields(orderRow, events = []) {
  const mappedOrder = mapOrderRow(orderRow, events);

  return {
    ...mappedOrder,
    sellerMeetupSpot: orderRow.seller_meetup_spot || null,
    buyerSuggestedMeetupSpot: orderRow.buyer_suggested_meetup_spot || null,
    meetupChangeStatus: orderRow.meetup_change_status || "none"
  };
}

async function getCurrentUserId() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

async function addOrderTrackingEvent(orderId, event) {
  const { data, error } = await supabase
    .from("order_tracking_events")
    .insert({
      order_id: orderId,
      title: event.title,
      description: event.description || "",
      completed: event.completed ?? true
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getStoredOrders(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const orderIds = (data || []).map((order) => order.id);

  let trackingEvents = [];

  if (orderIds.length > 0) {
    const { data: eventsData, error: eventsError } = await supabase
      .from("order_tracking_events")
      .select("*")
      .in("order_id", orderIds)
      .order("created_at", { ascending: false });

    if (eventsError) {
      throw eventsError;
    }

    trackingEvents = eventsData || [];
  }

  return (data || []).map((orderRow) => {
    const events = trackingEvents
      .filter((event) => event.order_id === orderRow.id)
      .map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        completed: event.completed,
        date: event.created_at
      }));

    return mapOrderWithMeetupFields(orderRow, events);
  });
}

export async function getOrderById(orderId) {
  if (!orderId) return null;

  const { data: orderRow, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!orderRow) return null;

  const { data: eventsData, error: eventsError } = await supabase
    .from("order_tracking_events")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (eventsError) {
    throw eventsError;
  }

  const events = (eventsData || []).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    completed: event.completed,
    date: event.created_at
  }));

  return mapOrderWithMeetupFields(orderRow, events);
}

export async function getOrderByListingId(listingId, userId) {
  if (!listingId || !userId) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("listing_id", listingId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  return getOrderById(data.id);
}

async function updateOrder(orderId, updates) {
  const { data, error } = await supabase
    .from("orders")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return getOrderById(data.id);
}

async function sendOrderConversationUpdate(order, type, text) {
  if (!order?.listingId || !order?.buyerId) return null;

  const conversation = await getOrCreateConversationFromListingId({
    listingId: order.listingId,
    buyer: {
      id: order.buyerId
    }
  });

  const currentUserId = await getCurrentUserId();
  const senderId = currentUserId || order.buyerId || order.sellerId;

  const { data: existingMessages, error: existingError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversation.id)
    .filter("payload->>orderId", "eq", String(order.id))
    .order("created_at", { ascending: true });

  if (existingError) {
    throw existingError;
  }

  const existingOrderMessage = existingMessages?.[0];

  if (existingOrderMessage) {
    const { data, error } = await supabase
      .from("messages")
      .update({
        sender_id: senderId,
        message_type: type,
        body: text,
        payload: {
          ...(existingOrderMessage.payload || {}),
          orderId: order.id,
          latestOrderStatus: order.status,
          updatedAt: new Date().toISOString()
        }
      })
      .eq("id", existingOrderMessage.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation.id);

    return data;
  }

  return sendSystemMessage({
    conversationId: conversation.id,
    senderId,
    type,
    text,
    payload: {
      orderId: order.id,
      latestOrderStatus: order.status,
      updatedAt: new Date().toISOString()
    }
  });
}

export async function createOrderFromCheckout({
  listing,
  seller,
  buyer,
  firstPhoto,
  originalItemPrice,
  acceptedOfferPrice,
  itemPrice,
  buyerProtection,
  shippingFee,
  total,
  deliveryMethod,
  paymentMethod,
  address,
  meetup,
  sellerMeetupSpot,
  buyerSuggestedMeetupSpot,
  meetupChangeStatus
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

  const now = new Date().toISOString();
  const maxShippingDate = addDays(now, 7);
  const trackingNumber = createTrackingNumber();

  const hasMeetupSuggestion = Boolean(
    deliveryMethod === "meetup" && buyerSuggestedMeetupSpot
  );

  const status =
    deliveryMethod === "meetup" ? "meetup_request_sent" : "paid_waiting_seller";

  const carrier = deliveryMethod === "meetup" ? "Safe Meet-Up" : "J&T Express";

  const { data: orderRow, error } = await supabase
    .from("orders")
    .insert({
      listing_id: listing.id,
      buyer_id: buyer.id,
      seller_id: sellerId,
      listing_title: listing.title || "Item",
      listing_photo: firstPhoto || "",
      seller_username: seller?.username || "Seller",
      original_item_price: originalItemPrice,
      accepted_offer_price: acceptedOfferPrice || null,
      item_price: itemPrice,
      buyer_protection: buyerProtection,
      shipping_fee: shippingFee,
      total,
      delivery_method: deliveryMethod,
      payment_method: paymentMethod,
      address,
      meetup: deliveryMethod === "meetup" ? meetup : null,
      seller_meetup_spot: sellerMeetupSpot || listing.seller_meetup_spot || null,
      buyer_suggested_meetup_spot: buyerSuggestedMeetupSpot || null,
      meetup_change_status: meetupChangeStatus || "none",
      carrier,
      tracking_number: trackingNumber,
      shipping_label_downloaded: false,
      seller_shipping_choice: "",
      max_shipping_date: maxShippingDate,
      estimated_delivery_start: addDays(now, 9),
      estimated_delivery_end: addDays(now, 14),
      status
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await addOrderTrackingEvent(orderRow.id, {
    title:
      deliveryMethod === "meetup"
        ? hasMeetupSuggestion
          ? "Safe Meet-Up alternative suggested"
          : "Safe Meet-Up request sent"
        : "Order paid",
    description:
      deliveryMethod === "meetup"
        ? hasMeetupSuggestion
          ? "The buyer suggested another Safe Meet-Up point. The seller can accept or decline it after purchase."
          : "The buyer accepted the seller's preferred meeting point."
        : "The seller has been notified and must ship the parcel within 7 days.",
    completed: true
  });

  const order = await getOrderById(orderRow.id);

  if (deliveryMethod !== "meetup") {
    await sendOrderConversationUpdate(
      order,
      "order_sold",
      `Order confirmed. The seller has until ${formatOrderDate(
        maxShippingDate
      )} to ship the parcel.`
    );
  } else if (hasMeetupSuggestion) {
    await sendOrderConversationUpdate(
      order,
      "meetup_change_request",
      `Order confirmed. The buyer suggested another Safe Meet-Up point: ${
        buyerSuggestedMeetupSpot?.name || "selected location"
      }. The seller can accept or decline this location after purchase.`
    );
  } else {
    await sendOrderConversationUpdate(
      order,
      "meetup_order",
      `Safe Meet-Up confirmed for ${
        order.meetup?.spot?.name ||
        order.sellerMeetupSpot?.name ||
        "the selected location"
      }.`
    );
  }

  return order;
}

export async function markShippingLabelDownloaded(orderId) {
  const updatedOrder = await updateOrder(orderId, {
    shipping_label_downloaded: true,
    status: "label_downloaded"
  });

  await addOrderTrackingEvent(orderId, {
    title: "Shipping label downloaded",
    description: "The seller downloaded the shipping label.",
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "shipping_label_downloaded",
    "The seller downloaded the shipping label."
  );

  return getOrderById(orderId);
}

export async function scheduleCourierPickup(orderId) {
  const pickupDate = addDays(new Date().toISOString(), 1);

  const updatedOrder = await updateOrder(orderId, {
    seller_shipping_choice: "courier_pickup",
    pickup_scheduled_at: pickupDate,
    status: "courier_pickup_scheduled"
  });

  await addOrderTrackingEvent(orderId, {
    title: "Courier pick-up scheduled",
    description:
      "A J&T Express courier will pick up the parcel from the seller.",
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "courier_pickup_scheduled",
    `The seller scheduled a courier pick-up. The parcel should be collected on ${formatOrderDate(
      pickupDate
    )}.`
  );

  return getOrderById(orderId);
}

export async function markParcelDroppedOff(
  orderId,
  carrier = "J&T Express",
  dropOffPoint = null
) {
  const pointName = dropOffPoint?.name || carrier;
  const pointAddress = dropOffPoint?.address || "";

  const updatedOrder = await updateOrder(orderId, {
    seller_shipping_choice: "dropoff",
    carrier,
    status: "dropped_off"
  });

  await addOrderTrackingEvent(orderId, {
    title: `Parcel dropped off at ${pointName}`,
    description: pointAddress
      ? `The parcel has been handed over to ${carrier} at ${pointAddress}.`
      : "The parcel has been handed over to the delivery partner.",
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "parcel_dropped_off",
    pointAddress
      ? `The seller dropped off your parcel at ${pointName}. Tracking is now available.`
      : `The seller dropped off your parcel at ${carrier}. Tracking is now available.`
  );

  return getOrderById(orderId);
}

export async function markParcelInTransit(orderId) {
  const updatedOrder = await updateOrder(orderId, {
    status: "in_transit"
  });

  await addOrderTrackingEvent(orderId, {
    title: "Parcel in transit",
    description: "Your parcel is currently moving through the delivery network.",
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "parcel_in_transit",
    "Your parcel is now in transit."
  );

  return getOrderById(orderId);
}

export async function markParcelReadyForPickup(orderId) {
  const updatedOrder = await updateOrder(orderId, {
    status: "ready_for_pickup"
  });

  await addOrderTrackingEvent(orderId, {
    title: "Parcel ready for pick-up",
    description: "Your parcel is available at the selected pick-up point.",
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "parcel_ready_for_pickup",
    "Your parcel is ready for pick-up at J&T Express."
  );

  return getOrderById(orderId);
}

export async function notifyHomeDeliveryTomorrow(orderId) {
  const updatedOrder = await updateOrder(orderId, {
    status: "delivery_scheduled"
  });

  await addOrderTrackingEvent(orderId, {
    title: "Delivery scheduled",
    description: "The courier will deliver the parcel tomorrow.",
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "delivery_tomorrow",
    "Your parcel will arrive tomorrow between 10:00 AM and 2:00 PM. You can add delivery instructions or reschedule the delivery."
  );

  return getOrderById(orderId);
}

export async function updateDeliveryInstructions(orderId, instructions) {
  return updateOrder(orderId, {
    delivery_instructions: instructions || ""
  });
}

export async function completeOrder(orderId) {
  const updatedOrder = await updateOrder(orderId, {
    status: "completed",
    completed_at: new Date().toISOString()
  });

  await addOrderTrackingEvent(orderId, {
    title: "Item received",
    description: "The buyer confirmed that the item was received.",
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "order_completed",
    "The buyer confirmed the item was received. The transaction is now completed."
  );

  return getOrderById(orderId);
}

export async function updateMeetupChangeStatus(orderId, nextStatus) {
  if (!["accepted", "declined"].includes(nextStatus)) {
    throw new Error("Invalid Meet-Up status.");
  }

  const updatedOrder = await updateOrder(orderId, {
    meetup_change_status: nextStatus
  });

  await addOrderTrackingEvent(orderId, {
    title:
      nextStatus === "accepted"
        ? "Meet-Up change accepted"
        : "Meet-Up change declined",
    description:
      nextStatus === "accepted"
        ? "The seller accepted the buyer's suggested meeting point."
        : "The seller declined the buyer's suggested meeting point. The original seller meeting point remains available.",
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "meetup_change_status",
    nextStatus === "accepted"
      ? "The seller accepted the suggested Safe Meet-Up point."
      : "The seller declined the suggested Safe Meet-Up point."
  );

  return getOrderById(orderId);
}