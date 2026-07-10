const ORDERS_KEY = "tindahan_orders";
const CONVERSATIONS_KEY = "tindahan_demo_conversations";

export function formatTindaHanPrice(value) {
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

export function formatOrderDate(dateValue) {
  if (!dateValue) return "";

  return new Date(dateValue).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatOrderDateTime(dateValue) {
  if (!dateValue) return "";

  return new Date(dateValue).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function getStoredOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrderById(orderId) {
  return getStoredOrders().find((order) => order.id === orderId) || null;
}

export function getOrderByListingId(listingId) {
  return (
    getStoredOrders().find(
      (order) => String(order.listingId) === String(listingId)
    ) || null
  );
}

export function updateOrder(orderId, updater) {
  const orders = getStoredOrders();

  const nextOrders = orders.map((order) => {
    if (order.id !== orderId) return order;

    const updatedOrder =
      typeof updater === "function" ? updater(order) : { ...order, ...updater };

    return {
      ...updatedOrder,
      updatedAt: new Date().toISOString()
    };
  });

  saveOrders(nextOrders);

  return nextOrders.find((order) => order.id === orderId) || null;
}

export function addTrackingEvent(orderId, event) {
  return updateOrder(orderId, (order) => ({
    ...order,
    trackingEvents: [
      {
        id: `tracking-${Date.now()}`,
        date: new Date().toISOString(),
        completed: true,
        ...event
      },
      ...(order.trackingEvents || [])
    ]
  }));
}

function getConversations() {
  try {
    return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveConversations(conversations) {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

function createConversationMessage(type, text, extra = {}) {
  return {
    id: `message-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender: "system",
    type,
    text,
    photos: [],
    createdAt: new Date().toISOString(),
    ...extra
  };
}

export function addOrderMessageToConversation(order, message) {
  if (!order?.listingId) return;

  const conversationId = `listing-${order.listingId}`;
  const conversations = getConversations();

  const existingConversation = conversations.find(
    (conversation) => conversation.id === conversationId
  );

  let nextConversations;

  if (existingConversation) {
    nextConversations = conversations.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            sellerId: conversation.sellerId || order.sellerId || "",
            sellerName:
              conversation.sellerName || order.sellerUsername || "Seller",
            listing: {
              ...(conversation.listing || {}),
              id: order.listingId,
              title: order.listingTitle,
              price: order.itemPrice,
              photo: order.listingPhoto,
              sellerId: order.sellerId
            },
            messages: [...(conversation.messages || []), message],
            updatedAt: new Date().toISOString()
          }
        : conversation
    );
  } else {
    nextConversations = [
      {
        id: conversationId,
        listingId: order.listingId,
        sellerId: order.sellerId || "",
        sellerName: order.sellerUsername || "Seller",
        sellerLocation: "Philippines",
        lastSeen: "Recently active",
        listing: {
          id: order.listingId,
          title: order.listingTitle,
          price: order.itemPrice,
          photo: order.listingPhoto,
          sellerId: order.sellerId
        },
        messages: [message],
        updatedAt: new Date().toISOString()
      },
      ...conversations
    ];
  }

  saveConversations(nextConversations);
}

export function createOrderFromCheckout({
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
  const now = new Date().toISOString();
  const maxShippingDate = addDays(now, 7);
  const trackingNumber = createTrackingNumber();

  const order = {
    id: `order-${Date.now()}`,
    listingId: listing.id,
    listingTitle: listing.title,
    listingPhoto: firstPhoto || "",
    buyerId: buyer?.id || null,
    buyerEmail: buyer?.email || "",
    sellerId: listing.seller_id || null,
    sellerUsername: seller?.username || "Seller",
    originalItemPrice,
    acceptedOfferPrice: acceptedOfferPrice || null,
    itemPrice,
    buyerProtection,
    shippingFee,
    total,
    deliveryMethod,
    paymentMethod,
    address,
    meetup: deliveryMethod === "meetup" ? meetup : null,
    carrier: deliveryMethod === "meetup" ? "Safe Meet-Up" : "J&T Express",
    trackingNumber,
    shippingLabelDownloaded: false,
    sellerShippingChoice: "",
    pickupScheduledAt: null,
    maxShippingDate,
    estimatedDeliveryStart: addDays(now, 9),
    estimatedDeliveryEnd: addDays(now, 14),
    createdAt: now,
    updatedAt: now,
    status:
      deliveryMethod === "meetup" ? "meetup_request_sent" : "paid_waiting_seller",
    trackingEvents:
      deliveryMethod === "meetup"
        ? [
            {
              id: `tracking-${Date.now()}`,
              title: "Safe Meet-Up request sent",
              description: "Waiting for the seller to confirm the meeting.",
              date: now,
              completed: true
            }
          ]
        : [
            {
              id: `tracking-${Date.now()}`,
              title: "Order paid",
              description:
                "The seller has been notified and must ship the parcel within 7 days.",
              date: now,
              completed: true
            }
          ]
  };

  const existingOrders = getStoredOrders();
  saveOrders([order, ...existingOrders]);

  if (deliveryMethod !== "meetup") {
    addOrderMessageToConversation(
      order,
      createConversationMessage(
        "order_sold",
        `Order confirmed. The seller has until ${formatOrderDate(
          maxShippingDate
        )} to ship the parcel.`,
        { orderId: order.id }
      )
    );
  } else {
    addOrderMessageToConversation(
      order,
      createConversationMessage(
        "meetup_order",
        `Safe Meet-Up request confirmed for ${order.meetup?.spot?.name || "the selected location"}.`,
        { orderId: order.id }
      )
    );
  }

  return order;
}

export function markShippingLabelDownloaded(orderId) {
  const order = updateOrder(orderId, {
    shippingLabelDownloaded: true,
    status: "label_downloaded"
  });

  if (order) {
    addTrackingEvent(order.id, {
      title: "Shipping label downloaded",
      description: "The seller downloaded the shipping label.",
      completed: true
    });

    addOrderMessageToConversation(
      order,
      createConversationMessage(
        "shipping_label_downloaded",
        "The seller downloaded the shipping label.",
        { orderId: order.id }
      )
    );
  }

  return order;
}

export function scheduleCourierPickup(orderId) {
  const pickupDate = addDays(new Date().toISOString(), 1);

  const order = updateOrder(orderId, {
    sellerShippingChoice: "courier_pickup",
    pickupScheduledAt: pickupDate,
    status: "courier_pickup_scheduled"
  });

  if (order) {
    addTrackingEvent(order.id, {
      title: "Courier pick-up scheduled",
      description:
        "A J&T Express courier will pick up the parcel from the seller.",
      completed: true
    });

    addOrderMessageToConversation(
      order,
      createConversationMessage(
        "courier_pickup_scheduled",
        `The seller scheduled a courier pick-up. The parcel should be collected on ${formatOrderDate(
          pickupDate
        )}.`,
        { orderId: order.id }
      )
    );
  }

  return order;
}

export function markParcelDroppedOff(orderId, carrier = "J&T Express") {
  const order = updateOrder(orderId, {
    sellerShippingChoice: "dropoff",
    carrier,
    status: "dropped_off"
  });

  if (order) {
    addTrackingEvent(order.id, {
      title: `Parcel dropped off at ${carrier}`,
      description: "The parcel has been handed over to the delivery partner.",
      completed: true
    });

    addOrderMessageToConversation(
      order,
      createConversationMessage(
        "parcel_dropped_off",
        `The seller dropped off your parcel at ${carrier}. Tracking is now available.`,
        { orderId: order.id }
      )
    );
  }

  return order;
}

export function markParcelInTransit(orderId) {
  const order = updateOrder(orderId, {
    status: "in_transit"
  });

  if (order) {
    addTrackingEvent(order.id, {
      title: "Parcel in transit",
      description: "Your parcel is currently moving through the delivery network.",
      completed: true
    });

    addOrderMessageToConversation(
      order,
      createConversationMessage(
        "parcel_in_transit",
        "Your parcel is now in transit.",
        { orderId: order.id }
      )
    );
  }

  return order;
}

export function markParcelReadyForPickup(orderId) {
  const order = updateOrder(orderId, {
    status: "ready_for_pickup"
  });

  if (order) {
    addTrackingEvent(order.id, {
      title: "Parcel ready for pick-up",
      description: "Your parcel is available at the selected pick-up point.",
      completed: true
    });

    addOrderMessageToConversation(
      order,
      createConversationMessage(
        "parcel_ready_for_pickup",
        "Your parcel is ready for pick-up at J&T Express.",
        { orderId: order.id }
      )
    );
  }

  return order;
}

export function notifyHomeDeliveryTomorrow(orderId) {
  const order = updateOrder(orderId, {
    status: "delivery_scheduled"
  });

  if (order) {
    addTrackingEvent(order.id, {
      title: "Delivery scheduled",
      description: "The courier will deliver the parcel tomorrow.",
      completed: true
    });

    addOrderMessageToConversation(
      order,
      createConversationMessage(
        "delivery_tomorrow",
        "Your parcel will arrive tomorrow between 10:00 AM and 2:00 PM. You can add delivery instructions or reschedule the delivery.",
        { orderId: order.id }
      )
    );
  }

  return order;
}

export function completeOrder(orderId) {
  const order = updateOrder(orderId, {
    status: "completed",
    completedAt: new Date().toISOString()
  });

  if (order) {
    addTrackingEvent(order.id, {
      title: "Item received",
      description: "The buyer confirmed that the item was received.",
      completed: true
    });

    addOrderMessageToConversation(
      order,
      createConversationMessage(
        "order_completed",
        "The buyer confirmed the item was received. The transaction is now completed.",
        { orderId: order.id }
      )
    );
  }

  return order;
}