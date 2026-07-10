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

    return mapOrderRow(orderRow, events);
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

  return mapOrderRow(orderRow, events);
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

  return sendSystemMessage({
    conversationId: conversation.id,
    senderId: order.sellerId || order.buyerId,
    type,
    text,
    payload: {
      orderId: order.id
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
  meetup
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
        ? "Safe Meet-Up request sent"
        : "Order paid",
    description:
      deliveryMethod === "meetup"
        ? "Waiting for the seller to confirm the meeting."
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
  } else {
    await sendOrderConversationUpdate(
      order,
      "meetup_order",
      `Safe Meet-Up request confirmed for ${
        order.meetup?.spot?.name || "the selected location"
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

export async function markParcelDroppedOff(orderId, carrier = "J&T Express") {
  const updatedOrder = await updateOrder(orderId, {
    seller_shipping_choice: "dropoff",
    carrier,
    status: "dropped_off"
  });

  await addOrderTrackingEvent(orderId, {
    title: `Parcel dropped off at ${carrier}`,
    description: "The parcel has been handed over to the delivery partner.",
    completed: true
  });

  await sendOrderConversationUpdate(
    updatedOrder,
    "parcel_dropped_off",
    `The seller dropped off your parcel at ${carrier}. Tracking is now available.`
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