import { supabase } from "./supabase";
import {
  DB_HARDENING,
  SHIPPING_DEADLINE_DAYS
} from "./featureFlags";
import { validateAddress } from "./addressBook";
import {
  addDays,
  createTrackingNumber,
  formatRealtimeDate,
  formatRealtimeDateTime,
  formatRealtimePrice,
  getOrCreateConversation,
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

async function sendOrderConversationUpdate(
  order,
  type,
  text,
  conversationOverride = null
) {
  if (!order?.listingId || !order?.buyerId || !order?.sellerId) {
    return null;
  }

  /*
   * IMPORTANT
   *
   * On ne recharge plus l'annonce depuis la table "listings".
   *
   * Une fois l'achat réalisé, l'annonce peut être immédiatement
   * considérée comme vendue/réservée et devenir inaccessible
   * pour l'acheteur à cause des règles RLS.
   *
   * C'est ce comportement qui provoquait :
   * "Listing unavailable."
   *
   * Les informations présentes dans la commande suffisent
   * pour retrouver ou recréer la conversation.
   */

  const conversation =
    conversationOverride ||
    (await getOrCreateConversation({
      listing: {
        id: order.listingId,
        seller_id: order.sellerId,
        title: order.listingTitle || "Item",
        price: Number(
          order.itemPrice ||
          order.originalItemPrice ||
          0
        ),
        photos: order.listingPhoto
          ? [order.listingPhoto]
          : [],
        location: "Philippines"
      },

      seller: {
        id: order.sellerId,
        username:
          order.sellerUsername ||
          "Seller"
      },

      buyer: {
        id: order.buyerId
      },

      firstPhoto:
        order.listingPhoto ||
        ""
    }));

  const currentUserId =
    await getCurrentUserId();

  const senderId =
    currentUserId ||
    order.buyerId ||
    order.sellerId;

  /*
   * On cherche si un message lié à cette commande existe déjà.
   *
   * S'il existe :
   * on le met à jour avec le nouveau statut.
   *
   * Sinon :
   * on crée le message de commande.
   */

  const {
    data: existingMessages,
    error: existingError
  } = await supabase
    .from("messages")
    .select("*")
    .eq(
      "conversation_id",
      conversation.id
    )
    .filter(
      "payload->>orderId",
      "eq",
      String(order.id)
    )
    .order(
      "created_at",
      {
        ascending: true
      }
    );

  if (existingError) {
    throw existingError;
  }

  const existingOrderMessage =
    existingMessages?.[0];

  /*
   * Un message de commande existe déjà.
   * On le transforme en message correspondant
   * au dernier statut connu.
   */

  if (existingOrderMessage) {
    const {
      data,
      error
    } = await supabase
      .from("messages")
      .update({
        sender_id:
          senderId,

        message_type:
          type,

        body:
          text,

        payload: {
          ...(
            existingOrderMessage.payload ||
            {}
          ),

          orderId:
            order.id,

          latestOrderStatus:
            order.status,

          updatedAt:
            new Date().toISOString()
        }
      })
      .eq(
        "id",
        existingOrderMessage.id
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    /*
     * On remonte également la conversation
     * en haut de la liste Messages.
     */

    const {
      error: conversationUpdateError
    } = await supabase
      .from("conversations")
      .update({
        updated_at:
          new Date().toISOString()
      })
      .eq(
        "id",
        conversation.id
      );

    if (conversationUpdateError) {
      throw conversationUpdateError;
    }

    return data;
  }

  /*
   * Aucun message de commande n'existe encore.
   * Création du message initial.
   */

  return sendSystemMessage({
    conversationId:
      conversation.id,

    senderId,

    type,

    text,

    payload: {
      orderId:
        order.id,

      latestOrderStatus:
        order.status,

      updatedAt:
        new Date().toISOString()
    }
  });
}

function normalizeCheckoutAddress(
  address,
  deliveryMethod
) {
  const normalizedAddress = {
    ...(address || {})
  };

  if (deliveryMethod !== "pickup") {
    return normalizedAddress;
  }

  const selectedPoint =
    address?.pickupPoint ||
    address?.pickup_point ||
    address?.relayPoint ||
    address?.relay_point ||
    address?.dropOffPoint ||
    address?.drop_off_point ||
    null;

  if (!selectedPoint) {
    return normalizedAddress;
  }

  normalizedAddress.pickupPoint =
    selectedPoint;

  normalizedAddress.pickup_point =
    selectedPoint;

  normalizedAddress.relayPoint =
    selectedPoint;

  normalizedAddress.relay_point =
    selectedPoint;

  normalizedAddress.dropOffPoint =
    selectedPoint;

  normalizedAddress.drop_off_point =
    selectedPoint;

  return normalizedAddress;
}

/*
 * ============================================================
 * CAHIER BÊTA — GARDE-FOUS COMMANDE (L1.1 / L1.2 / L1.3 / L2.2)
 * ============================================================
 */

/** Statuts qui « tiennent » une annonce (commande en cours). */
export const ACTIVE_ORDER_STATUSES = [
  "paid_waiting_seller",
  "label_downloaded",
  "courier_pickup_scheduled",
  "dropped_off",
  "in_transit",
  "ready_for_pickup",
  "delivery_scheduled",
  "meetup_request_sent",
  "refund_requested"
];

/** Statuts finaux : l'argent ne bouge plus. */
export const TERMINAL_ORDER_STATUSES = [
  "completed",
  "cancelled",
  "canceled",
  "expired",
  "refunded"
];

/** Statuts avant expédition : le vendeur peut encore être en retard. */
export const PRE_SHIPMENT_STATUSES = [
  "paid_waiting_seller",
  "meetup_request_sent"
];

export class OrderGuardError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "OrderGuardError";
    this.code = code;
  }
}

const UNAVAILABLE_MESSAGE =
  "This item is no longer available. Another buyer may have just purchased it.";

function isUniqueViolation(error) {
  return (
    error?.code === "23505" ||
    /duplicate key|unique constraint/i.test(error?.message || "")
  );
}

function mapRpcGuardMessage(reason) {
  switch (reason) {
    case "own_listing":
      return "You can't buy your own listing.";
    case "reserved":
    case "sold":
    case "unavailable":
    case "not_found":
      return UNAVAILABLE_MESSAGE;
    default:
      return UNAVAILABLE_MESSAGE;
  }
}

/**
 * Appelle la fonction SQL reserve_listing (verrou 15 min). Si la migration
 * n'est pas encore appliquée (fonction absente), on ignore sans bloquer l'app.
 */
export async function reserveListingForCheckout(listingId) {
  if (!DB_HARDENING || !listingId) return { ok: true, skipped: true };

  const { data, error } = await supabase.rpc("reserve_listing", {
    p_listing_id: listingId
  });

  if (error) {
    if (/function .* does not exist|could not find the function|PGRST202/i.test(
      `${error.message || ""} ${error.code || ""}`
    )) {
      return { ok: true, skipped: true };
    }
    throw error;
  }

  if (data && data.ok === false) {
    throw new OrderGuardError(data.reason || "unavailable", mapRpcGuardMessage(data.reason));
  }

  return { ok: true, data };
}

export async function releaseListingReservation(listingId) {
  if (!DB_HARDENING || !listingId) return;

  try {
    await supabase.rpc("release_listing", { p_listing_id: listingId });
  } catch {
    /* le verrou expirera tout seul au bout de 15 min */
  }
}

async function assertCheckoutAllowed({ listing, sellerId, buyer, idempotencyKey }) {
  /* L1.2 — pas d'achat de sa propre annonce */
  if (String(sellerId) === String(buyer.id)) {
    throw new OrderGuardError("own_listing", "You can't buy your own listing.");
  }

  /* Statut réel de l'annonce (pas celui du cache de la page) */
  const { data: fresh } = await supabase
    .from("listings")
    .select("id, status, seller_id")
    .eq("id", listing.id)
    .maybeSingle();

  if (!fresh) {
    throw new OrderGuardError("not_found", UNAVAILABLE_MESSAGE);
  }

  if (String(fresh.seller_id) === String(buyer.id)) {
    throw new OrderGuardError("own_listing", "You can't buy your own listing.");
  }

  const listingStatus = String(fresh.status || "active").toLowerCase();

  if (["sold", "completed", "hidden", "deleted", "paused"].includes(listingStatus)) {
    throw new OrderGuardError("unavailable", UNAVAILABLE_MESSAGE);
  }

  /* Commandes déjà actives sur cette annonce (visibles par ce compte) */
  const { data: activeRows } = await supabase
    .from("orders")
    .select("id, buyer_id, status, client_request_id")
    .eq("listing_id", listing.id)
    .in("status", ACTIVE_ORDER_STATUSES);

  const active = activeRows || [];
  const mine = active.find((row) => String(row.buyer_id) === String(buyer.id));

  /* L1.1 — idempotence : même acheteur, même annonce => on rouvre la commande */
  if (mine) {
    return { existingOrderId: mine.id };
  }

  if (active.length > 0) {
    throw new OrderGuardError("unavailable", UNAVAILABLE_MESSAGE);
  }

  if (listingStatus === "reserved") {
    /* Réservée : seul le verrou posé par cet acheteur est accepté.
       Sans migration, une annonce « reserved » reste indisponible. */
    if (!DB_HARDENING) {
      throw new OrderGuardError("reserved", UNAVAILABLE_MESSAGE);
    }
  }

  await reserveListingForCheckout(listing.id);

  return { existingOrderId: null, idempotencyKey };
}

function assertDeliveryContact(address, deliveryMethod) {
  if (deliveryMethod === "meetup") return;

  const errors = validateAddress(address, { requirePhone: true });

  if (deliveryMethod === "pickup") {
    /* Point relais : nom + mobile suffisent (l'adresse = le point choisi) */
    if (errors.fullName || errors.mobileNumber) {
      throw new OrderGuardError(
        "invalid_address",
        errors.fullName || errors.mobileNumber
      );
    }
    return;
  }

  const firstError = Object.values(errors)[0];

  if (firstError) {
    throw new OrderGuardError(
      "invalid_address",
      `Please complete your delivery address. ${firstError}`
    );
  }
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
  meetupChangeStatus,
  idempotencyKey
}) {
  if (!listing?.id) {
    throw new Error(
      "Missing listing."
    );
  }

  if (!buyer?.id) {
    throw new Error(
      "You must be logged in."
    );
  }

  const sellerId =
    listing.seller_id ||
    seller?.id;

  if (!sellerId) {
    throw new Error(
      "Missing seller."
    );
  }

  /* Cahier L1.1 / L1.2 / L2.2 : garde-fous avant toute écriture */
  assertDeliveryContact(address, deliveryMethod);

  const guard = await assertCheckoutAllowed({
    listing,
    sellerId,
    buyer,
    idempotencyKey
  });

  if (guard.existingOrderId) {
    const existing = await getOrderById(guard.existingOrderId);
    if (existing) return existing;
  }

  /*
   * IMPORTANT
   *
   * La conversation est créée/restaurée AVANT
   * la création de la commande.
   *
   * Ainsi, l'annonce est encore accessible et
   * on conserve exactement le fonctionnement
   * historique de TindaHan :
   *
   * achat
   * → conversation
   * → commande
   * → suivi
   * → message automatique.
   */

  const orderConversation =
    await getOrCreateConversation({
      listing,
      seller,
      buyer,
      firstPhoto
    });

  const normalizedAddress =
    normalizeCheckoutAddress(
      address,
      deliveryMethod
    );

  const now =
    new Date().toISOString();

  const maxShippingDate =
    addDays(
      now,
      SHIPPING_DEADLINE_DAYS
    );

  const trackingNumber =
    createTrackingNumber();

  const hasMeetupSuggestion =
    Boolean(
      deliveryMethod === "meetup" &&
      buyerSuggestedMeetupSpot
    );

  const status =
    deliveryMethod === "meetup"
      ? "meetup_request_sent"
      : "paid_waiting_seller";

  const pickupPoint =
    normalizedAddress.pickupPoint ||
    normalizedAddress.pickup_point ||
    normalizedAddress.relayPoint ||
    normalizedAddress.relay_point ||
    normalizedAddress.dropOffPoint ||
    normalizedAddress.drop_off_point ||
    null;

  const carrier =
    deliveryMethod === "meetup"
      ? "Safe Meet-Up"
      : pickupPoint?.carrier ||
        "J&T Express";

  /*
   * Création de la commande.
   */

  const {
    data: orderRow,
    error
  } = await supabase
    .from("orders")
    .insert({
      listing_id:
        listing.id,

      buyer_id:
        buyer.id,

      seller_id:
        sellerId,

      listing_title:
        listing.title ||
        "Item",

      listing_photo:
        firstPhoto ||
        "",

      seller_username:
        seller?.username ||
        "Seller",

      original_item_price:
        originalItemPrice,

      accepted_offer_price:
        acceptedOfferPrice ||
        null,

      item_price:
        itemPrice,

      buyer_protection:
        buyerProtection,

      shipping_fee:
        shippingFee,

      total,

      delivery_method:
        deliveryMethod,

      payment_method:
        paymentMethod,

      address:
        normalizedAddress,

      meetup:
        deliveryMethod === "meetup"
          ? meetup
          : null,

      seller_meetup_spot:
        sellerMeetupSpot ||
        listing.seller_meetup_spot ||
        null,

      buyer_suggested_meetup_spot:
        buyerSuggestedMeetupSpot ||
        null,

      meetup_change_status:
        meetupChangeStatus ||
        "none",

      carrier,

      tracking_number:
        trackingNumber,

      shipping_label_downloaded:
        false,

      seller_shipping_choice:
        "",

      max_shipping_date:
        maxShippingDate,

      estimated_delivery_start:
        addDays(
          now,
          9
        ),

      estimated_delivery_end:
        addDays(
          now,
          14
        ),

      status,

      ...(DB_HARDENING && idempotencyKey
        ? { client_request_id: idempotencyKey }
        : {})
    })
    .select("*")
    .single();

  if (error) {
    await releaseListingReservation(listing.id);

    if (isUniqueViolation(error)) {
      /* L'index unique « 1 commande active par annonce » a joué son rôle. */
      throw new OrderGuardError("unavailable", UNAVAILABLE_MESSAGE);
    }

    throw error;
  }

  /*
   * Premier événement du suivi.
   */

  await addOrderTrackingEvent(
    orderRow.id,
    {
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
          : pickupPoint?.name &&
            pickupPoint?.address
          ? `The seller has been notified and must ship the parcel within 7 days. Pick-up point selected: ${pickupPoint.name}, ${pickupPoint.address}.`
          : "The seller has been notified and must ship the parcel within 7 days.",

      completed:
        true
    }
  );

  /*
   * On recharge la commande avec son tracking.
   */

  const order =
    await getOrderById(
      orderRow.id
    );

  /*
   * Message automatique dans la conversation.
   *
   * On transmet directement "orderConversation".
   * Aucune nouvelle lecture de l'annonce n'est nécessaire.
   */

  if (
    deliveryMethod !== "meetup"
  ) {
    await sendOrderConversationUpdate(
      order,

      "order_sold",

      `Order confirmed. The seller has until ${formatOrderDate(
        maxShippingDate
      )} to ship the parcel.`,

      orderConversation
    );
  }

  else if (
    hasMeetupSuggestion
  ) {
    await sendOrderConversationUpdate(
      order,

      "meetup_change_request",

      `Order confirmed. The buyer suggested another Safe Meet-Up point: ${
        buyerSuggestedMeetupSpot?.name ||
        "selected location"
      }. The seller can accept or decline this location after purchase.`,

      orderConversation
    );
  }

  else {
    await sendOrderConversationUpdate(
      order,

      "meetup_order",

      `Safe Meet-Up confirmed for ${
        order.meetup?.spot?.name ||
        order.sellerMeetupSpot?.name ||
        "the selected location"
      }.`,

      orderConversation
    );
  }

  return order;
}

/*
 * ============================================================
 * SELLER — SHIPPING LABEL
 * ============================================================
 */

export async function markShippingLabelDownloaded(
  orderId
) {
  const updatedOrder =
    await updateOrder(
      orderId,
      {
        shipping_label_downloaded:
          true,

        status:
          "label_downloaded"
      }
    );

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        "Shipping label downloaded",

      description:
        "The seller downloaded the shipping label.",

      completed:
        true
    }
  );

  await sendOrderConversationUpdate(
    updatedOrder,

    "shipping_label_downloaded",

    "The seller downloaded the shipping label."
  );

  return getOrderById(
    orderId
  );
}

/*
 * ============================================================
 * SELLER — COURIER PICKUP
 * ============================================================
 */

export async function scheduleCourierPickup(
  orderId,
  pickupDetails = {}
) {
  const pickupDateValue =
    pickupDetails.pickupDate ||
    addDays(
      new Date().toISOString(),
      1
    );

  const pickupDate =
    new Date(
      pickupDateValue
    ).toISOString();

  const carrier =
    pickupDetails.carrier ||
    "J&T Express";

  const pickupSlot =
    pickupDetails.pickupSlot ||
    "09:00 - 12:00";

  const sellerAddress =
    pickupDetails.sellerAddress ||
    null;

  const updatedOrder =
    await updateOrder(
      orderId,
      {
        seller_shipping_choice:
          "courier_pickup",

        pickup_scheduled_at:
          pickupDate,

        carrier,

        status:
          "courier_pickup_scheduled"
      }
    );

  const sellerAddressText =
    sellerAddress
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

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        "Courier pick-up scheduled",

      description:
        `${carrier} will pick up the parcel on ${formatOrderDate(
          pickupDate
        )} between ${pickupSlot} at ${sellerAddressText}.`,

      completed:
        true
    }
  );

  await sendOrderConversationUpdate(
    updatedOrder,

    "courier_pickup_scheduled",

    `The seller scheduled a courier pick-up with ${carrier} on ${formatOrderDate(
      pickupDate
    )} between ${pickupSlot}.`
  );

  return getOrderById(
    orderId
  );
}

/*
 * ============================================================
 * SELLER — DROP-OFF
 * ============================================================
 */

export async function markParcelDroppedOff(
  orderId,
  carrier = "J&T Express",
  dropOffPoint = null
) {
  const pointName =
    dropOffPoint?.name ||
    carrier;

  const pointAddress =
    dropOffPoint?.address ||
    "";

  const currentOrder =
    await getOrderById(
      orderId
    );

  const currentAddress =
    currentOrder?.address ||
    {};

  const normalizedAddress =
    dropOffPoint
      ? {
          ...currentAddress,

          sellerDropOffPoint:
            dropOffPoint,

          seller_drop_off_point:
            dropOffPoint
        }
      : currentAddress;

  const updatedOrder =
    await updateOrder(
      orderId,
      {
        seller_shipping_choice:
          "dropoff",

        carrier,

        address:
          normalizedAddress,

        status:
          "dropped_off"
      }
    );

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        `Parcel dropped off at ${pointName}`,

      description:
        pointAddress
          ? `The parcel has been handed over to ${carrier} at ${pointAddress}.`
          : "The parcel has been handed over to the delivery partner.",

      completed:
        true
    }
  );

  await sendOrderConversationUpdate(
    updatedOrder,

    "parcel_dropped_off",

    pointAddress
      ? `Order shipped. The seller dropped off the parcel at ${pointName}.`
      : `Order shipped. The seller dropped off the parcel with ${carrier}.`
  );

  return getOrderById(
    orderId
  );
}

/*
 * ============================================================
 * PARCEL — IN TRANSIT
 * ============================================================
 */

export async function markParcelInTransit(
  orderId
) {
  const updatedOrder =
    await updateOrder(
      orderId,
      {
        status:
          "in_transit"
      }
    );

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        "Parcel in transit",

      description:
        "Your parcel is currently moving through the delivery network.",

      completed:
        true
    }
  );

  await sendOrderConversationUpdate(
    updatedOrder,

    "parcel_in_transit",

    "Order shipped. The parcel is currently in transit."
  );

  return getOrderById(
    orderId
  );
}

/*
 * ============================================================
 * PARCEL — READY FOR PICKUP
 * ============================================================
 */

export async function markParcelReadyForPickup(
  orderId
) {
  const currentOrder =
    await getOrderById(
      orderId
    );

  const pickupPoint =
    currentOrder?.address?.pickupPoint ||
    currentOrder?.address?.pickup_point ||
    currentOrder?.address?.relayPoint ||
    currentOrder?.address?.relay_point ||
    currentOrder?.address?.dropOffPoint ||
    currentOrder?.address?.drop_off_point ||
    null;

  const updatedOrder =
    await updateOrder(
      orderId,
      {
        status:
          "ready_for_pickup"
      }
    );

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        "Parcel ready for pick-up",

      description:
        pickupPoint?.name &&
        pickupPoint?.address
          ? `Your parcel is available at ${pickupPoint.name}, ${pickupPoint.address}.`
          : "Your parcel is available at the selected pick-up point.",

      completed:
        true
    }
  );

  await sendOrderConversationUpdate(
    updatedOrder,

    "parcel_ready_for_pickup",

    pickupPoint?.name &&
    pickupPoint?.address
      ? `Your parcel has arrived at ${pickupPoint.name}. Pick-up address: ${pickupPoint.address}. Check your order before confirming it.`
      : "Your parcel has arrived at the pick-up point. Check your order before confirming it."
  );

  return getOrderById(
    orderId
  );
}

/*
 * ============================================================
 * HOME DELIVERY — TOMORROW
 * ============================================================
 */

export async function notifyHomeDeliveryTomorrow(
  orderId
) {
  const updatedOrder =
    await updateOrder(
      orderId,
      {
        status:
          "delivery_scheduled"
      }
    );

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        "Delivery scheduled",

      description:
        "The courier will deliver the parcel tomorrow.",

      completed:
        true
    }
  );

  await sendOrderConversationUpdate(
    updatedOrder,

    "delivery_tomorrow",

    "Your parcel is on its way. You will be able to confirm the order or report a problem once it has been delivered."
  );

  return getOrderById(
    orderId
  );
}

/*
 * ============================================================
 * PARCEL — DELIVERED
 * ============================================================
 */

export async function markParcelDelivered(
  orderId
) {
  const updatedOrder =
    await updateOrder(
      orderId,
      {
        status:
          "delivered"
      }
    );

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        "Parcel delivered",

      description:
        "The parcel has been delivered to the buyer.",

      completed:
        true
    }
  );

  await sendOrderConversationUpdate(
    updatedOrder,

    "parcel_delivered",

    "Your parcel has been delivered. Check your order before confirming it."
  );

  return getOrderById(
    orderId
  );
}

/*
 * ============================================================
 * DELIVERY INSTRUCTIONS
 * ============================================================
 */

export async function updateDeliveryInstructions(
  orderId,
  instructions
) {
  return updateOrder(
    orderId,
    {
      delivery_instructions:
        instructions ||
        ""
    }
  );
}

/*
 * ============================================================
 * BUYER — COMPLETE ORDER
 * ============================================================
 */

export async function completeOrder(
  orderId
) {
  const updatedOrder =
    await updateOrder(
      orderId,
      {
        status:
          "completed",

        completed_at:
          new Date().toISOString()
      }
    );

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        "Item received",

      description:
        "The buyer confirmed that the item was received.",

      completed:
        true
    }
  );

  await sendOrderConversationUpdate(
    updatedOrder,

    "order_completed",

    "Order accepted. The payment can now be released to the seller."
  );

  return getOrderById(
    orderId
  );
}

/*
 * ============================================================
 * BUYER — REFUND / PROBLEM
 * ============================================================
 */

export async function requestOrderRefund(
  orderId,
  complaint = "Issue reported"
) {
  const isDetailedComplaint =
    complaint &&
    typeof complaint === "object" &&
    !Array.isArray(
      complaint
    );

  const reason =
    isDetailedComplaint
      ? complaint.reason ||
        "Issue reported"
      : complaint ||
        "Issue reported";

  const details =
    isDetailedComplaint
      ? complaint.details ||
        ""
      : "";

  const photosCount =
    isDetailedComplaint
      ? Number(
          complaint.photosCount ||
          0
        )
      : 0;

  const returnMethod =
    isDetailedComplaint
      ? complaint.returnMethod ||
        ""
      : "";

  const returnPoint =
    isDetailedComplaint
      ? complaint.returnPoint ||
        null
      : null;

  const returnLabel =
    returnMethod === "home_pickup"
      ? "home pickup"
      : returnPoint?.name
      ? `${
          returnPoint.carrier ||
          "relay point"
        } - ${returnPoint.name}`
      : "return method to be confirmed after review";

  const updatedOrder =
    await updateOrder(
      orderId,
      {
        status:
          "refund_requested"
      }
    );

  const cleanProblemDescription =
    details
      ? `The buyer reported a problem: ${reason}. ${details}`
      : `The buyer reported a problem: ${reason}. TindaHan will review the evidence.`;

  const cleanEvidenceDescription =
    photosCount > 0
      ? `${photosCount} photo${
          photosCount > 1
            ? "s"
            : ""
        } attached. Return method: ${returnLabel}.`
      : `No photo attached. Return method: ${returnLabel}.`;

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        "Problem reported",

      description:
        cleanProblemDescription,

      completed:
        true
    }
  );

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        "Evidence submitted",

      description:
        cleanEvidenceDescription,

      completed:
        true
    }
  );

  await sendOrderConversationUpdate(
    updatedOrder,

    "refund_requested",

    `The buyer reported a problem with the order: ${reason}. The payment remains protected while TindaHan reviews the case.`
  );

  return getOrderById(
    orderId
  );
}

/*
 * ============================================================
 * SAFE MEET-UP
 * ============================================================
 */

export async function updateMeetupChangeStatus(
  orderId,
  nextStatus
) {
  if (
    ![
      "accepted",
      "declined"
    ].includes(
      nextStatus
    )
  ) {
    throw new Error(
      "Invalid Meet-Up status."
    );
  }

  const updatedOrder =
    await updateOrder(
      orderId,
      {
        meetup_change_status:
          nextStatus
      }
    );

  await addOrderTrackingEvent(
    orderId,
    {
      title:
        nextStatus === "accepted"
          ? "Meet-Up change accepted"
          : "Meet-Up change declined",

      description:
        nextStatus === "accepted"
          ? "The seller accepted the buyer's suggested meeting point."
          : "The seller declined the buyer's suggested meeting point. The original seller meeting point remains available.",

      completed:
        true
    }
  );

  await sendOrderConversationUpdate(
    updatedOrder,

    "meetup_change_status",

    nextStatus === "accepted"
      ? "The seller accepted the suggested Safe Meet-Up point."
      : "The seller declined the suggested Safe Meet-Up point."
  );

  return getOrderById(
    orderId
  );
}


/*
 * ============================================================
 * CAHIER BÊTA — ANNULATION, EXPIRATION, DÉLAI (L1.3 / L2.3)
 * ============================================================
 */

export function getOrderDeadlineInfo(order, now = new Date()) {
  const raw = order?.maxShippingDate || order?.max_shipping_date;
  const deadline = raw ? new Date(raw) : null;

  if (!deadline || Number.isNaN(deadline.getTime())) {
    return { deadline: null, daysLeft: null, overdue: false };
  }

  const msLeft = deadline.getTime() - now.getTime();

  return {
    deadline,
    daysLeft: Math.ceil(msLeft / 86400000),
    overdue: msLeft < 0
  };
}

export function isOrderActive(order) {
  return ACTIVE_ORDER_STATUSES.includes(String(order?.status || ""));
}

export function canBuyerCancelOrder(order) {
  return PRE_SHIPMENT_STATUSES.includes(String(order?.status || "")) &&
    !order?.shippingLabelDownloaded;
}

async function relistListing(listingId) {
  if (!listingId) return;

  if (DB_HARDENING) {
    await releaseListingReservation(listingId);
    return;
  }

  /* Sans migration : tentative directe (réussit seulement si les règles RLS l'autorisent). */
  try {
    await supabase
      .from("listings")
      .update({ status: "active" })
      .eq("id", listingId)
      .eq("status", "reserved");
  } catch {
    /* ignoré */
  }
}

async function closeOrder(order, status, event) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", order.id)
    .in("status", ACTIVE_ORDER_STATUSES);

  if (error) throw error;

  try {
    await addOrderTrackingEvent(order.id, {
      title: event.title,
      description: event.description,
      completed: true
    });
  } catch {
    /* l'historique ne doit pas bloquer la clôture */
  }

  await relistListing(order.listingId);
}

/** Annulation par l'acheteur avant expédition => remboursement (simulé en bêta). */
export async function cancelOrderByBuyer(orderId, reason = "Cancelled by buyer") {
  const order = await getOrderById(orderId);

  if (!order) throw new Error("Order not found.");

  if (!canBuyerCancelOrder(order)) {
    throw new Error(
      "This order can no longer be cancelled because the seller already started shipping. You can request a refund instead."
    );
  }

  if (DB_HARDENING) {
    const { data, error } = await supabase.rpc("cancel_order", {
      p_order_id: orderId,
      p_reason: reason
    });

    if (!error && data?.ok === false) {
      throw new Error(
        data.reason === "too_late"
          ? "This order can no longer be cancelled because the seller already started shipping. You can request a refund instead."
          : "Unable to cancel this order."
      );
    }

    if (!error) {
      return getOrderById(orderId);
    }

    if (error && !/does not exist|PGRST202/i.test(`${error.message} ${error.code}`)) {
      throw error;
    }
  }

  await closeOrder(order, "cancelled", {
    title: "Order cancelled",
    description: `${reason}. The buyer is refunded in full (simulated during the beta).`
  });

  try {
    await sendOrderConversationUpdate(
      order,
      "order_cancelled",
      "This order was cancelled by the buyer and refunded in full."
    );
  } catch {
    /* message best-effort */
  }

  return getOrderById(orderId);
}

/**
 * Filet de sécurité côté navigateur : clôture les commandes dont le vendeur
 * n'a pas expédié avant la date limite (J+7). La vraie tâche planifiée est dans
 * la migration SQL (expire_overdue_orders + pg_cron) ; ceci couvre l'intervalle
 * avant son activation.
 */
export async function sweepOverdueOrders(orders) {
  const overdue = (orders || []).filter(
    (order) =>
      PRE_SHIPMENT_STATUSES.includes(String(order.status)) &&
      getOrderDeadlineInfo(order).overdue
  );

  const closed = [];

  for (const order of overdue) {
    try {
      await closeOrder(order, "expired", {
        title: "Order expired",
        description:
          "The seller did not ship before the deadline. The buyer is refunded in full (simulated during the beta) and the item is available again."
      });
      closed.push(order.id);
    } catch {
      /* RLS : le serveur le fera */
    }
  }

  return closed;
}

/** Libellé affichable et teinte pour chaque statut (cahier L1.3 / L5.2). */
export function getOrderStatusLabel(status) {
  const labels = {
    paid_waiting_seller: "Paid – waiting for seller",
    label_downloaded: "Label ready",
    courier_pickup_scheduled: "Pick-up scheduled",
    dropped_off: "Dropped off",
    in_transit: "In transit",
    ready_for_pickup: "Ready for pick-up",
    delivery_scheduled: "Delivery scheduled",
    meetup_request_sent: "Meet-up requested",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    expired: "Expired",
    refunded: "Refunded",
    refund_requested: "Refund requested"
  };

  return labels[String(status)] || "In progress";
}
