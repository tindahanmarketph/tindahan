import {
  Bell,
  Camera,
  Check,
  ChevronLeft,
  Download,
  Info,
  MapPin,
  PackageCheck,
  Plus,
  Send,
  ShieldCheck,
  Truck,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchConversationsForUser,
  fetchMessagesForConversation,
  formatRealtimeDate,
  formatRealtimePrice,
  getOrCreateConversationFromListingId,
  removeRealtimeChannel,
  sendTextMessage,
  subscribeToConversationMessages,
  subscribeToUserConversations,
  updateOfferStatus
} from "../lib/tindahanRealtime";
import {
  formatOrderDate,
  formatTindaHanPrice,
  getOrderById
} from "../lib/orders";

function formatPrice(value) {
  const price = Number(value || 0);

  if (!price) return "Price not available";

  return `₱${price.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatConversationDate(dateValue) {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 1000 / 60 / 60 / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  return `${diffWeeks} weeks ago`;
}

function createId(prefix = "id") {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        id: createId("photo"),
        name: file.name,
        type: file.type,
        dataUrl: reader.result
      });
    };

    reader.onerror = () => {
      reject(new Error("Unable to read photo."));
    };

    reader.readAsDataURL(file);
  });
}

function getLastMessage(conversation) {
  const messages = conversation?.messages || [];
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) return conversation?.listing?.title || "Conversation";

  if (lastMessage.type === "offer") {
    const offer = lastMessage.offer;

    if (offer?.status === "accepted") {
      return `Offer accepted · ${formatPrice(offer.offerPrice)}`;
    }

    if (offer?.status === "declined") {
      return `Offer declined · ${formatPrice(offer.offerPrice)}`;
    }

    if (offer?.senderRole === "seller_counter_offer") {
      return `Seller counter-offer · ${formatPrice(offer.offerPrice)}`;
    }

    return `Offer sent · ${formatPrice(offer.offerPrice)}`;
  }

  if (lastMessage.orderId || lastMessage.payload?.orderId) {
    return "Order update";
  }

  if (lastMessage.text) return lastMessage.text;
  if (lastMessage.photos?.length > 0) return "Photo";

  return conversation?.listing?.title || "Conversation";
}

function getAcceptedOffer(conversation) {
  const messages = conversation?.messages || [];

  const acceptedOfferMessage = [...messages]
    .reverse()
    .find(
      (message) =>
        message.type === "offer" && message.offer?.status === "accepted"
    );

  return acceptedOfferMessage?.offer || null;
}

function getLatestPendingCounterOffer(conversation) {
  const messages = conversation?.messages || [];

  const counterOfferMessage = [...messages]
    .reverse()
    .find(
      (message) =>
        message.type === "offer" &&
        message.offer?.senderRole === "seller_counter_offer" &&
        message.offer?.status === "pending"
    );

  return counterOfferMessage?.offer || null;
}

function getBestCheckoutOffer(conversation) {
  return getAcceptedOffer(conversation) || getLatestPendingCounterOffer(conversation);
}

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const photoInputRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showBundleBox, setShowBundleBox] = useState(false);
  const [showSafety, setShowSafety] = useState(true);
  const [activeTab, setActiveTab] = useState("messages");
  const [mobilePanel, setMobilePanel] = useState("inbox");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadConversations({ keepActive = true } = {}) {
    if (!user?.id) return;

    setLoadingConversations(true);
    setErrorMessage("");

    try {
      const nextConversations = await fetchConversationsForUser(user.id);

      setConversations((current) => {
        const currentById = current.reduce((acc, conversation) => {
          acc[conversation.id] = conversation;
          return acc;
        }, {});

        return nextConversations.map((conversation) => ({
          ...conversation,
          messages: currentById[conversation.id]?.messages || []
        }));
      });

      if (!keepActive || !activeConversationId) {
        setActiveConversationId(nextConversations[0]?.id || "");
      }
    } catch (error) {
      console.error("Conversations loading error:", error);
      setErrorMessage(error.message || "Unable to load conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }

  async function loadMessages(conversationId) {
    if (!conversationId || !user?.id) return;

    setLoadingMessages(true);

    try {
      const nextMessages = await fetchMessagesForConversation(
        conversationId,
        user.id
      );

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: nextMessages
              }
            : conversation
        )
      );
    } catch (error) {
      console.error("Messages loading error:", error);
      setErrorMessage(error.message || "Unable to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    if (!user?.id) return;

    loadConversations({ keepActive: false });

    const channel = subscribeToUserConversations({
      userId: user.id,
      onChange: () => loadConversations({ keepActive: true })
    });

    return () => {
      removeRealtimeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    const listingId = searchParams.get("listingId");

    if (!listingId || !user?.id) return;

    async function openConversationFromUrl() {
      try {
        const conversation = await getOrCreateConversationFromListingId({
          listingId,
          buyer: user
        });

        await loadConversations({ keepActive: true });

        setActiveConversationId(conversation.id);
        setActiveTab("messages");
        setMobilePanel("chat");
      } catch (error) {
        console.error("Open conversation error:", error);
        alert(error.message || "Unable to open conversation.");
      }
    }

    openConversationFromUrl();
  }, [searchParams, user?.id]);

  useEffect(() => {
    if (!activeConversationId || !user?.id) return;

    loadMessages(activeConversationId);

    const channel = subscribeToConversationMessages({
      conversationId: activeConversationId,
      onInsert: () => loadMessages(activeConversationId),
      onUpdate: () => loadMessages(activeConversationId)
    });

    return () => {
      removeRealtimeChannel(channel);
    };
  }, [activeConversationId, user?.id]);

  const activeConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) => conversation.id === activeConversationId
      ) ||
      conversations[0] ||
      null
    );
  }, [conversations, activeConversationId]);

  const messagesCount = conversations.length;

  const isCurrentUserSeller = useMemo(() => {
    const sellerId =
      activeConversation?.sellerId ||
      activeConversation?.listing?.sellerId ||
      activeConversation?.seller_id;

    return Boolean(user?.id && sellerId && String(user.id) === String(sellerId));
  }, [activeConversation, user?.id]);

  const acceptedOffer = useMemo(
    () => getAcceptedOffer(activeConversation),
    [activeConversation]
  );

  const checkoutOffer = useMemo(
    () => getBestCheckoutOffer(activeConversation),
    [activeConversation]
  );

  function openConversation(conversationId) {
    setActiveConversationId(conversationId);
    setMobilePanel("chat");
    setActiveTab("messages");
  }

  function backToInbox() {
    setMobilePanel("inbox");
    setShowBundleBox(false);
    setSelectedPhotos([]);
  }

  async function handleOfferStatus(messageId, offer, nextStatus) {
    if (!activeConversation?.id || !user?.id) return;

    try {
      await updateOfferStatus({
        conversationId: activeConversation.id,
        messageId,
        offer,
        nextStatus,
        currentUserId: user.id
      });

      await loadMessages(activeConversation.id);
      await loadConversations({ keepActive: true });
    } catch (error) {
      console.error("Offer status update error:", error);
      alert(error.message || "Unable to update this offer.");
    }
  }

  function handleBuyClick(offer = null) {
    const listingId = activeConversation?.listing?.id || activeConversation?.listingId;

    if (!listingId) {
      alert("Unable to open checkout for this item.");
      return;
    }

    const selectedOffer = offer || checkoutOffer;

    if (selectedOffer?.offerPrice) {
      navigate(`/checkout/${listingId}?offerPrice=${selectedOffer.offerPrice}`);
      return;
    }

    navigate(`/checkout/${listingId}`);
  }

  function handleMakeOfferClick() {
    const listingId = activeConversation?.listing?.id || activeConversation?.listingId;

    if (!listingId) {
      alert("Unable to make an offer for this item.");
      return;
    }

    navigate(`/offer/${listingId}`);
  }

  function handleCounterOfferClick() {
    const listingId = activeConversation?.listing?.id || activeConversation?.listingId;

    if (!listingId || !activeConversation?.id) {
      alert("Unable to make a counter-offer for this item.");
      return;
    }

    const params = new URLSearchParams();
    params.set("mode", "counter");
    params.set("conversationId", activeConversation.id);

    navigate(`/offer/${listingId}?${params.toString()}`);
  }

  async function handlePhotoChange(event) {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      event.target.value = "";
      return;
    }

    try {
      const photos = await Promise.all(imageFiles.map(fileToDataUrl));
      setSelectedPhotos((current) => [...current, ...photos]);
    } catch (error) {
      console.error("Photo loading error:", error);
      alert("Unable to load this photo.");
    } finally {
      event.target.value = "";
    }
  }

  function removeSelectedPhoto(photoId) {
    setSelectedPhotos((current) =>
      current.filter((photo) => photo.id !== photoId)
    );
  }

  function handleCreateBundleClick() {
    setShowBundleBox(true);
  }

  async function handleStartBundle() {
    if (!activeConversation?.id || !user?.id) return;

    try {
      await sendTextMessage({
        conversationId: activeConversation.id,
        senderId: user.id,
        text: "I would like to create a bundle with several items from your closet.",
        photos: []
      });

      setShowBundleBox(false);
      await loadMessages(activeConversation.id);
      await loadConversations({ keepActive: true });
    } catch (error) {
      console.error("Bundle message error:", error);
      alert(error.message || "Unable to send bundle request.");
    }
  }

  function handlePhotoButtonClick() {
    photoInputRef.current?.click();
  }

  async function handleSendMessage() {
    const cleanMessage = message.trim();

    if (!activeConversation?.id || !user?.id) return;
    if (!cleanMessage && selectedPhotos.length === 0) return;

    try {
      await sendTextMessage({
        conversationId: activeConversation.id,
        senderId: user.id,
        text: cleanMessage,
        photos: selectedPhotos
      });

      setMessage("");
      setSelectedPhotos([]);
      await loadMessages(activeConversation.id);
      await loadConversations({ keepActive: true });
    } catch (error) {
      console.error("Send message error:", error);
      alert(error.message || "Unable to send message.");
    }
  }

  function renderConversationList() {
    if (loadingConversations) {
      return (
        <div className="messages-mobile-empty-small">
          <p>Loading messages...</p>
          <span>Please wait a moment.</span>
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="messages-mobile-empty-small">
          <p>No conversations yet.</p>
          <span>Open an item and click “Chat with seller”.</span>
        </div>
      );
    }

    return (
      <div className="messages-mobile-list">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className="messages-mobile-row"
            onClick={() => openConversation(conversation.id)}
          >
            <div className="messages-mobile-avatar">
              {conversation.sellerName?.slice(0, 1)?.toUpperCase() || "T"}
            </div>

            <div className="messages-mobile-main">
              <div className="messages-mobile-row-top">
                <strong>{conversation.sellerName}</strong>
                <span>{formatConversationDate(conversation.updatedAt)}</span>
              </div>

              <p>{getLastMessage(conversation)}</p>

              {conversation.listing?.photo && (
                <img
                  src={conversation.listing.photo}
                  alt={conversation.listing.title}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }

  function renderNotificationsEmpty() {
    return (
      <section className="messages-notifications-empty">
        <div className="messages-notifications-icon">
          <Bell size={64} />
        </div>

        <h2>No notifications yet</h2>
      </section>
    );
  }

  function renderOfferCard(item) {
    const offer = item.offer;
    if (!offer) return null;

    const isPending = offer.status === "pending" || offer.status === "sent";
    const isAccepted = offer.status === "accepted";
    const isDeclined = offer.status === "declined";

    const isBuyerOffer = offer.senderRole === "buyer_offer";
    const isSellerCounterOffer = offer.senderRole === "seller_counter_offer";

    const shouldSellerAct =
      isCurrentUserSeller && isBuyerOffer && isPending;

    const shouldBuyerAct =
      !isCurrentUserSeller && (isAccepted || isSellerCounterOffer);

    return (
      <div
        className={
          item.sender === "me"
            ? "offer-message-card own-offer"
            : "offer-message-card"
        }
      >
        <div className="offer-message-heading">
          <span>
            {isBuyerOffer
              ? isCurrentUserSeller
                ? "Buyer made an offer"
                : "You made an offer"
              : isCurrentUserSeller
              ? "You sent a counter-offer"
              : "Seller made a counter-offer"}
          </span>

          {isAccepted && <strong className="accepted">Accepted</strong>}
          {isDeclined && <strong className="declined">Declined</strong>}
          {isPending && <strong className="pending">Pending</strong>}
        </div>

        <div className="offer-message-price-row">
          <strong>₱{formatRealtimePrice(offer.offerPrice)}</strong>

          {offer.itemPrice && Number(offer.itemPrice) !== Number(offer.offerPrice) && (
            <span>₱{formatRealtimePrice(offer.itemPrice)}</span>
          )}
        </div>

        {offer.protectedTotal && (
          <p className="offer-message-protected">
            ₱{formatRealtimePrice(offer.protectedTotal)} incl. Buyer Protection
          </p>
        )}

        {shouldSellerAct && (
          <div className="offer-message-actions">
            <button
              type="button"
              className="offer-accept-button"
              onClick={() => handleOfferStatus(item.id, offer, "accepted")}
            >
              <Check size={16} />
              Accept
            </button>

            <button
              type="button"
              className="offer-decline-button"
              onClick={() => handleOfferStatus(item.id, offer, "declined")}
            >
              Decline
            </button>

            <button
              type="button"
              className="offer-counter-button"
              onClick={handleCounterOfferClick}
            >
              Make counter-offer
            </button>
          </div>
        )}

        {shouldBuyerAct && (
          <div className="offer-message-actions buyer-actions">
            <button
              type="button"
              className="offer-counter-button"
              onClick={handleMakeOfferClick}
            >
              Make another offer
            </button>

            <button
              type="button"
              className="offer-accept-button"
              onClick={() => handleBuyClick(offer)}
            >
              Buy at ₱{formatRealtimePrice(offer.offerPrice)}
            </button>
          </div>
        )}

        {!isCurrentUserSeller && isBuyerOffer && isPending && (
          <div className="offer-message-actions buyer-actions">
            <button
              type="button"
              className="offer-counter-button"
              onClick={handleMakeOfferClick}
            >
              Change my offer
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderOrderCard(item) {
    const [order, setOrder] = useState(null);

    useEffect(() => {
      let mounted = true;

      async function loadOrder() {
        try {
          const loadedOrder = await getOrderById(item.orderId || item.payload?.orderId);

          if (mounted) {
            setOrder(loadedOrder);
          }
        } catch (error) {
          console.warn("Order message loading skipped:", error.message);
        }
      }

      loadOrder();

      return () => {
        mounted = false;
      };
    }, [item.orderId, item.payload?.orderId]);

    if (!order) {
      return (
        <div className="message-bubble">
          <p>{item.text}</p>
        </div>
      );
    }

    const isSellerOrder = Boolean(
      user?.id && order.sellerId && String(user.id) === String(order.sellerId)
    );

    return (
      <div className="conversation-order-card">
        <div className="conversation-order-icon">
          <PackageCheck size={24} />
        </div>

        <div className="conversation-order-content">
          <strong>
            {isSellerOrder ? "Your item has been sold" : "Order confirmed"}
          </strong>

          <p>{item.text}</p>

          <div className="conversation-order-product">
            {order.listingPhoto && (
              <img src={order.listingPhoto} alt={order.listingTitle} />
            )}

            <div>
              <span>{order.listingTitle}</span>
              <small>₱{formatTindaHanPrice(order.total)}</small>
            </div>
          </div>

          {isSellerOrder && order.deliveryMethod !== "meetup" && (
            <div className="conversation-order-deadline">
              Ship before {formatOrderDate(order.maxShippingDate)}
            </div>
          )}

          <div className="conversation-order-actions">
            {isSellerOrder && order.deliveryMethod !== "meetup" && (
              <button
                type="button"
                className="parcel-outline-button"
                onClick={() => navigate(`/shipping-label/${order.id}`)}
              >
                <Download size={15} />
                Shipping label
              </button>
            )}

            <button
              type="button"
              className="parcel-primary-button"
              onClick={() => navigate(`/tracking/${order.id}`)}
            >
              <Truck size={15} />
              Track parcel
            </button>
          </div>
        </div>
      </div>
    );
  }

  function MessageOrderCard({ item }) {
    return renderOrderCard(item);
  }

  function renderChatPanel({ mobile = false } = {}) {
    if (!activeConversation) {
      return (
        <div className="messages-empty-main">
          <h2>Select a conversation</h2>
          <p>Your messages will appear here.</p>
        </div>
      );
    }

    return (
      <>
        <header className={mobile ? "messages-mobile-chat-header" : "messages-topbar"}>
          {mobile && (
            <button type="button" onClick={backToInbox} aria-label="Back to messages">
              <ChevronLeft size={27} />
            </button>
          )}

          <strong>{activeConversation.sellerName}</strong>

          <button type="button" aria-label="Conversation information">
            <Info size={21} />
          </button>
        </header>

        <div className="messages-listing-summary">
          <Link
            to={`/item/${activeConversation.listing?.id}`}
            className="messages-listing-photo"
          >
            {activeConversation.listing?.photo ? (
              <img
                src={activeConversation.listing.photo}
                alt={activeConversation.listing.title}
              />
            ) : (
              <span>No photo</span>
            )}
          </Link>

          <div className="messages-listing-info">
            <strong>{activeConversation.listing?.title}</strong>
            <span>{formatPrice(activeConversation.listing?.price)}</span>

            {acceptedOffer ? (
              <small>Accepted offer: {formatPrice(acceptedOffer.offerPrice)}</small>
            ) : (
              <small>Includes Buyer Protection</small>
            )}
          </div>

          <div className="messages-listing-actions">
            {!isCurrentUserSeller && (
              <button
                type="button"
                className="messages-outline-button"
                onClick={handleMakeOfferClick}
              >
                Make an offer
              </button>
            )}

            {!isCurrentUserSeller && (
              <button
                type="button"
                className="messages-buy-button"
                onClick={() => handleBuyClick()}
              >
                Buy
              </button>
            )}

            {isCurrentUserSeller && (
              <button
                type="button"
                className="messages-outline-button seller-counter-main"
                onClick={handleCounterOfferClick}
              >
                Make counter-offer
              </button>
            )}
          </div>
        </div>

        <div className="messages-thread">
          <div className="messages-seller-card">
            <div className="messages-avatar">
              {activeConversation.sellerName?.slice(0, 1)?.toUpperCase() || "T"}
            </div>

            <div className="messages-seller-bubble">
              <strong>Hello, I am {activeConversation.sellerName}</strong>

              <p>
                <MapPin size={16} />
                {activeConversation.sellerLocation}
              </p>

              <p>{activeConversation.lastSeen}</p>
            </div>
          </div>

          {loadingMessages && (
            <div className="messages-mobile-empty-small">
              <p>Loading conversation...</p>
            </div>
          )}

          {(activeConversation.messages || []).map((item) => (
            <div
              key={item.id}
              className={`message-bubble-row ${
                item.sender === "me" ? "me" : ""
              } ${item.type !== "text" && item.type !== "offer" ? "system" : ""}`}
            >
              {item.type === "offer" ? (
                renderOfferCard(item)
              ) : item.orderId || item.payload?.orderId ? (
                <MessageOrderCard item={item} />
              ) : (
                <div className="message-bubble">
                  {item.text && <p>{item.text}</p>}

                  {item.photos?.length > 0 && (
                    <div className="message-photo-grid">
                      {item.photos.map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.dataUrl}
                          alt={photo.name || "Message attachment"}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {showSafety && (
          <div className="messages-safety-bar">
            <ShieldCheck size={18} />

            <p>
              For your safety, do not share personal data, external links
              or QR codes.
            </p>

            <button
              type="button"
              aria-label="Close safety message"
              onClick={() => setShowSafety(false)}
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="chat-composer-wrapper">
          {showBundleBox && (
            <div className="chat-bundle-box">
              <div>
                <strong>Create a bundle</strong>
                <p>
                  Select several items from this seller and send them as a
                  bundle request.
                </p>
              </div>

              <button
                type="button"
                className="chat-bundle-action"
                onClick={handleStartBundle}
              >
                Start
              </button>

              <button
                type="button"
                className="chat-bundle-close"
                onClick={() => setShowBundleBox(false)}
                aria-label="Close bundle box"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {selectedPhotos.length > 0 && (
            <div className="chat-photo-preview-row">
              {selectedPhotos.map((photo) => (
                <div className="chat-photo-preview" key={photo.id}>
                  <img src={photo.dataUrl} alt={photo.name || ""} />

                  <button
                    type="button"
                    onClick={() => removeSelectedPhoto(photo.id)}
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="chat-composer">
            <button
              type="button"
              className="chat-composer-icon"
              onClick={handleCreateBundleClick}
              aria-label="Create a bundle"
            >
              <Plus size={22} />
            </button>

            <button
              type="button"
              className="chat-composer-icon"
              onClick={handlePhotoButtonClick}
              aria-label="Add photo"
            >
              <Camera size={21} />
            </button>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="chat-hidden-file-input"
              onChange={handlePhotoChange}
            />

            <input
              type="text"
              className="chat-message-input"
              placeholder="Send a message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <button
              type="button"
              className="chat-send-button"
              onClick={handleSendMessage}
              disabled={!message.trim() && selectedPhotos.length === 0}
              aria-label="Send message"
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <main className="messages-page messages-tabbed-page">
      <section
        className={
          mobilePanel === "chat"
            ? "messages-mobile-view chat-open"
            : "messages-mobile-view"
        }
      >
        {mobilePanel === "inbox" ? (
          <>
            <header className="messages-mobile-header">
              <h1>Messages</h1>
            </header>

            <div className="messages-mobile-tabs">
              <button
                type="button"
                className={activeTab === "messages" ? "active" : ""}
                onClick={() => setActiveTab("messages")}
              >
                Messages {messagesCount}
              </button>

              <button
                type="button"
                className={activeTab === "notifications" ? "active" : ""}
                onClick={() => setActiveTab("notifications")}
              >
                Notifications
              </button>
            </div>

            {errorMessage && (
              <div className="messages-mobile-empty-small">
                <p>{errorMessage}</p>
              </div>
            )}

            {activeTab === "messages"
              ? renderConversationList()
              : renderNotificationsEmpty()}
          </>
        ) : (
          renderChatPanel({ mobile: true })
        )}
      </section>

      <div className="messages-shell messages-desktop-shell">
        <aside className="messages-sidebar">
          <div className="messages-sidebar-header">
            <h1>Messages</h1>
          </div>

          {conversations.length === 0 ? (
            <div className="messages-empty-sidebar">
              <p>No conversations yet.</p>
              <span>Open an item and click “Chat with seller”.</span>
            </div>
          ) : (
            <div className="messages-conversation-list">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`messages-conversation-item ${
                    conversation.id === activeConversation?.id ? "active" : ""
                  }`}
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  <div className="messages-avatar">
                    {conversation.sellerName?.slice(0, 1)?.toUpperCase() || "T"}
                  </div>

                  <div>
                    <strong>{conversation.sellerName}</strong>
                    <p>{getLastMessage(conversation)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="messages-main">
          {renderChatPanel()}
        </section>
      </div>
    </main>
  );
}