import {
  Camera,
  Info,
  MapPin,
  Plus,
  Send,
  ShieldCheck,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const LOCAL_CONVERSATIONS_KEY = "tindahan_conversations";
const LOCAL_MESSAGES_KEY = "tindahan_messages";

function readLocalJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getFirstPhoto(listing) {
  if (!listing?.photos || !Array.isArray(listing.photos)) return "";
  return listing.photos.find(Boolean) || "";
}

function formatPrice(value) {
  const price = Number(value || 0);
  return `₱${price.toLocaleString("en-PH")}`;
}

function formatConversationTime(value) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes} min`;
  if (diffHours < 24) return `${diffHours} h`;

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric"
  });
}

function buildConversationId(userId, sellerId, listingId) {
  return [userId || "guest", sellerId || "seller", listingId || "listing"].join(
    "_"
  );
}

async function tryCreateSupabaseConversation({
  conversationId,
  buyerId,
  sellerId,
  listingId
}) {
  if (!buyerId || !sellerId || !listingId) return false;

  try {
    const { error } = await supabase.from("conversations").upsert(
      {
        id: conversationId,
        buyer_id: buyerId,
        seller_id: sellerId,
        listing_id: listingId,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("Supabase conversation skipped:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Supabase conversation unavailable:", error);
    return false;
  }
}

async function tryInsertSupabaseMessage(message) {
  try {
    const { error } = await supabase.from("messages").insert({
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      body: message.body,
      created_at: message.created_at
    });

    if (error) {
      console.warn("Supabase message skipped:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Supabase messages unavailable:", error);
    return false;
  }
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  const sellerIdFromUrl = searchParams.get("seller");
  const listingIdFromUrl = searchParams.get("listing");

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [noticeVisible, setNoticeVisible] = useState(true);

  useEffect(() => {
    async function loadMessagesPage() {
      setLoading(true);

      const localConversations = readLocalJson(LOCAL_CONVERSATIONS_KEY, []);
      const localMessages = readLocalJson(LOCAL_MESSAGES_KEY, []);

      let nextConversations = Array.isArray(localConversations)
        ? localConversations
        : [];

      let nextMessages = Array.isArray(localMessages) ? localMessages : [];

      if (user?.id && sellerIdFromUrl && listingIdFromUrl) {
        let listingData = null;
        let sellerData = null;

        try {
          const { data: listingResult, error: listingError } = await supabase
            .from("listings")
            .select("*")
            .eq("id", listingIdFromUrl)
            .maybeSingle();

          if (!listingError) listingData = listingResult || null;
        } catch (error) {
          console.warn("Listing fetch skipped:", error);
        }

        try {
          const { data: sellerResult, error: sellerError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sellerIdFromUrl)
            .maybeSingle();

          if (!sellerError) sellerData = sellerResult || null;
        } catch (error) {
          console.warn("Seller fetch skipped:", error);
        }

        const conversationId = buildConversationId(
          user.id,
          sellerIdFromUrl,
          listingIdFromUrl
        );

        const existingConversation = nextConversations.find(
          (conversation) => conversation.id === conversationId
        );

        const conversationPayload = {
          id: conversationId,
          buyer_id: user.id,
          seller_id: sellerIdFromUrl,
          listing_id: listingIdFromUrl,
          seller: sellerData || existingConversation?.seller || null,
          listing: listingData || existingConversation?.listing || null,
          last_message:
            existingConversation?.last_message ||
            "Conversation started about this item.",
          updated_at: new Date().toISOString()
        };

        if (existingConversation) {
          nextConversations = nextConversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  ...conversationPayload,
                  last_message:
                    conversation.last_message ||
                    conversationPayload.last_message,
                  updated_at: conversation.updated_at || new Date().toISOString()
                }
              : conversation
          );
        } else {
          nextConversations = [conversationPayload, ...nextConversations];

          nextMessages = [
            ...nextMessages,
            {
              id: `welcome-${conversationId}`,
              conversation_id: conversationId,
              sender_id: sellerIdFromUrl,
              body: `Bonjour, je suis ${
                sellerData?.username || "le vendeur"
              }.`,
              type: "seller-intro",
              created_at: new Date().toISOString()
            }
          ];
        }

        writeLocalJson(LOCAL_CONVERSATIONS_KEY, nextConversations);
        writeLocalJson(LOCAL_MESSAGES_KEY, nextMessages);

        await tryCreateSupabaseConversation({
          conversationId,
          buyerId: user.id,
          sellerId: sellerIdFromUrl,
          listingId: listingIdFromUrl
        });

        setActiveConversationId(conversationId);
      } else if (nextConversations.length > 0) {
        setActiveConversationId(nextConversations[0].id);
      }

      setConversations(nextConversations);
      setMessages(nextMessages);
      setLoading(false);
    }

    loadMessagesPage();
  }, [user, sellerIdFromUrl, listingIdFromUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversationId, messages]);

  const activeConversation = useMemo(() => {
    return conversations.find(
      (conversation) => conversation.id === activeConversationId
    );
  }, [conversations, activeConversationId]);

  const activeMessages = useMemo(() => {
    return messages.filter(
      (message) => message.conversation_id === activeConversationId
    );
  }, [messages, activeConversationId]);

  function handleSendMessage(e) {
    e.preventDefault();

    const cleanMessage = messageText.trim();

    if (!cleanMessage || !activeConversation || !user?.id) return;

    const now = new Date().toISOString();

    const newMessage = {
      id: `local-${Date.now()}`,
      conversation_id: activeConversation.id,
      sender_id: user.id,
      body: cleanMessage,
      type: "text",
      created_at: now
    };

    const nextMessages = [...messages, newMessage];

    const nextConversations = conversations
      .map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              last_message: cleanMessage,
              updated_at: now
            }
          : conversation
      )
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    setMessages(nextMessages);
    setConversations(nextConversations);
    setMessageText("");

    writeLocalJson(LOCAL_MESSAGES_KEY, nextMessages);
    writeLocalJson(LOCAL_CONVERSATIONS_KEY, nextConversations);

    tryInsertSupabaseMessage(newMessage);
  }

  if (loading) {
    return (
      <main className="messages-page">
        <div className="messages-shell">
          <div className="messages-empty-full">
            <h1>Loading messages...</h1>
            <p>Please wait a moment.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="messages-page">
      <div className="messages-shell">
        <section className="messages-layout">
          <aside className="messages-sidebar">
            <div className="messages-sidebar-title">
              <h1>Messages</h1>
            </div>

            {conversations.length > 0 ? (
              <div className="messages-conversation-list">
                {conversations.map((conversation) => {
                  const seller = conversation.seller;
                  const listing = conversation.listing;
                  const photo = getFirstPhoto(listing);

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      className={`messages-conversation-item ${
                        conversation.id === activeConversationId ? "active" : ""
                      }`}
                      onClick={() => setActiveConversationId(conversation.id)}
                    >
                      <div className="messages-mini-avatar">
                        {seller?.avatar_url ? (
                          <img src={seller.avatar_url} alt={seller.username} />
                        ) : (
                          seller?.username?.slice(0, 1)?.toUpperCase() || "M"
                        )}
                      </div>

                      <div className="messages-conversation-main">
                        <div className="messages-conversation-top">
                          <strong>{seller?.username || "Seller"}</strong>
                          <span>
                            {formatConversationTime(conversation.updated_at)}
                          </span>
                        </div>

                        <p>{conversation.last_message}</p>

                        {listing && (
                          <div className="messages-conversation-product">
                            {photo && <img src={photo} alt={listing.title} />}
                            <span>{listing.title}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="messages-empty-sidebar">
                <p>No conversations yet.</p>
              </div>
            )}
          </aside>

          <section className="messages-chat">
            {activeConversation ? (
              <>
                <header className="messages-chat-header">
                  <strong>
                    {activeConversation.seller?.username || "Seller"}
                  </strong>

                  <button type="button" aria-label="Conversation information">
                    <Info size={20} />
                  </button>
                </header>

                {activeConversation.listing && (
                  <div className="messages-product-bar">
                    <Link
                      to={`/item/${activeConversation.listing.id}`}
                      className="messages-product-info"
                    >
                      <div className="messages-product-image">
                        {getFirstPhoto(activeConversation.listing) ? (
                          <img
                            src={getFirstPhoto(activeConversation.listing)}
                            alt={activeConversation.listing.title}
                          />
                        ) : (
                          <span>No photo</span>
                        )}
                      </div>

                      <div>
                        <strong>{activeConversation.listing.title}</strong>
                        <span>
                          {formatPrice(activeConversation.listing.price)}
                        </span>
                        <small>
                          {formatPrice(
                            Number(activeConversation.listing.price || 0) * 1.08
                          )}{" "}
                          incl. Buyer Protection
                        </small>
                      </div>
                    </Link>

                    <div className="messages-product-actions">
                      <button type="button" className="messages-outline-button">
                        Make an offer
                      </button>

                      <button type="button" className="messages-buy-button">
                        Buy
                      </button>
                    </div>
                  </div>
                )}

                <div className="messages-thread">
                  {activeConversation.seller && (
                    <div className="messages-seller-card">
                      <div className="messages-mini-avatar">
                        {activeConversation.seller.avatar_url ? (
                          <img
                            src={activeConversation.seller.avatar_url}
                            alt={activeConversation.seller.username}
                          />
                        ) : (
                          activeConversation.seller.username
                            ?.slice(0, 1)
                            ?.toUpperCase() || "S"
                        )}
                      </div>

                      <div>
                        <strong>
                          Bonjour, je suis{" "}
                          {activeConversation.seller.username || "le vendeur"}
                        </strong>

                        <p>
                          <MapPin size={16} />
                          {activeConversation.seller.location ||
                            activeConversation.seller.country ||
                            "Philippines"}
                        </p>

                        <p>
                          <Info size={16} />
                          Online recently
                        </p>
                      </div>
                    </div>
                  )}

                  {activeMessages.map((message) => {
                    const isMe = message.sender_id === user?.id;

                    return (
                      <div
                        key={message.id}
                        className={`messages-bubble-row ${isMe ? "me" : ""}`}
                      >
                        <div className={`messages-bubble ${isMe ? "me" : ""}`}>
                          <p>{message.body}</p>
                          <span>{formatConversationTime(message.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {noticeVisible && (
                  <div className="messages-safety-notice">
                    <ShieldCheck size={17} />
                    <p>
                      For your safety, do not share personal details, external
                      links or QR codes.
                    </p>

                    <button
                      type="button"
                      aria-label="Close safety notice"
                      onClick={() => setNoticeVisible(false)}
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}

                <form className="messages-input-bar" onSubmit={handleSendMessage}>
                  <button type="button" aria-label="Add attachment">
                    <Plus size={21} />
                  </button>

                  <button type="button" aria-label="Add photo">
                    <Camera size={21} />
                  </button>

                  <input
                    type="text"
                    placeholder="Send a message"
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                  />

                  <button
                    type="submit"
                    aria-label="Send message"
                    disabled={!messageText.trim()}
                  >
                    <Send size={21} />
                  </button>
                </form>
              </>
            ) : (
              <div className="messages-empty-full">
                <h1>Your messages</h1>
                <p>
                  Open an item and click “Chat with seller” to start a
                  conversation.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}