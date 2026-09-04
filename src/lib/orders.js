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

export async function scheduleCourierPickup(orderId, pickupDetails = {}) {
  const pickupDateValue =
    pickupDetails.pickupDate || addDays(new Date().toISOString(), 1);

  const pickupDate = new Date(pickupDateValue).toISOString();
  const carrier = pickupDetails.carrier || "J&T Express";
  const pickupSlot = pickupDetails.pickupSlot || "09:00 - 12:00";
  const sellerAddress = pickupDetails.sellerAddress || null;

  const updatedOrder = await updateOrder(orderId, {
    seller_shipping_choice: "courier_pickup",
    pickup_scheduled_at: pickupDate,
    carrier,
    status: "courier_pickup_scheduled"
  });

  const sellerAddressText = sellerAddress
    ? [
        sellerAddress.fullName,
        sellerAddress.mobileNumber,
        sellerAddress.street,
        sellerAddress.barangay,
        sellerAddress.city,
        sellerAddress.province,
        sellerAddress.region,
        sellerAddress.postalCode
      ]
        .filter(Boolean)
        .join(", ")
    : "the seller address";

  await addOrderTrackingEvent(orderId, {
    title: "Courier pick-up scheduled",
    description: `${carrier} will pick up the parcel on ${formatOrderDate(
      pickupDate
    )} between ${pickupSlot} at ${sellerAddressText}.`,
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "courier_pickup_scheduled",
    `The seller scheduled a courier pick-up with ${carrier} on ${formatOrderDate(
      pickupDate
    )} between ${pickupSlot}.`
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
      ? `Order shipped. The seller dropped off the parcel at ${pointName}.`
      : `Order shipped. The seller dropped off the parcel with ${carrier}.`
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
    "Order shipped. The parcel is currently in transit."
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
    "Your parcel has arrived at the pick-up point. Check your order before confirming it."
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
    "Your parcel is on its way. You will be able to confirm the order or report a problem once it has been delivered."
  );

  return getOrderById(orderId);
}

export async function markParcelDelivered(orderId) {
  const updatedOrder = await updateOrder(orderId, {
    status: "delivered"
  });

  await addOrderTrackingEvent(orderId, {
    title: "Parcel delivered",
    description: "The parcel has been delivered to the buyer.",
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "parcel_delivered",
    "Your parcel has been delivered. Check your order before confirming it."
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
    "Order accepted. The payment can now be released to the seller."
  );

  return getOrderById(orderId);
}

export async function requestOrderRefund(orderId, complaint = "Issue reported") {
  const isDetailedComplaint =
    complaint && typeof complaint === "object" && !Array.isArray(complaint);

  const reason = isDetailedComplaint
    ? complaint.reason || "Issue reported"
    : complaint || "Issue reported";

  const details = isDetailedComplaint ? complaint.details || "" : "";
  const photosCount = isDetailedComplaint ? Number(complaint.photosCount || 0) : 0;
  const returnMethod = isDetailedComplaint ? complaint.returnMethod || "" : "";
  const returnPoint = isDetailedComplaint ? complaint.returnPoint || null : null;

  const returnLabel =
    returnMethod === "home_pickup"
      ? "home pickup"
      : returnPoint?.name
      ? `${returnPoint.carrier || "relay point"} - ${returnPoint.name}`
      : "return method to be confirmed after review";

  const updatedOrder = await updateOrder(orderId, {
    status: "refund_requested"
  });

  const cleanProblemDescription = details
    ? `The buyer reported a problem: ${reason}. ${details}`
    : `The buyer reported a problem: ${reason}. TindaHan will review the evidence.`;

  const cleanEvidenceDescription =
    photosCount > 0
      ? `${photosCount} photo${photosCount > 1 ? "s" : ""} attached. Return method: ${returnLabel}.`
      : `No photo attached. Return method: ${returnLabel}.`;

  await addOrderTrackingEvent(orderId, {
    title: "Problem reported",
    description: cleanProblemDescription,
    completed: true
  });

  await addOrderTrackingEvent(orderId, {
    title: "Evidence submitted",
    description: cleanEvidenceDescription,
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "refund_requested",
    `The buyer reported a problem with the order: ${reason}. The payment remains protected while TindaHan reviews the case.`
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