import {
  Camera,
  Info,
  MapPin,
  Plus,
  Send,
  ShieldCheck,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const STORAGE_KEY = "tindahan_demo_conversations";

function formatPrice(value) {
  const price = Number(value || 0);

  if (!price) return "Price not available";

  return `₱${price.toLocaleString("en-PH")}`;
}

function getInitialConversations() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

function buildConversationFromParams(searchParams) {
  const listingId = searchParams.get("listingId");

  if (!listingId) return null;

  const sellerName = searchParams.get("seller") || "Seller";
  const title = searchParams.get("title") || "Item";
  const price = searchParams.get("price") || "0";
  const photo = searchParams.get("photo") || "";

  return {
    id: `listing-${listingId}`,
    listingId,
    sellerName,
    sellerLocation: "Philippines",
    lastSeen: "Recently active",
    listing: {
      id: listingId,
      title,
      price,
      photo
    },
    messages: [
      {
        id: `intro-${Date.now()}`,
        sender: "seller",
        text: `Hello, I am ${sellerName}.`,
        createdAt: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  };
}

export default function Messages() {
  const [searchParams] = useSearchParams();

  const incomingConversation = useMemo(
    () => buildConversationFromParams(searchParams),
    [searchParams]
  );

  const [conversations, setConversations] = useState(() =>
    getInitialConversations()
  );
  const [activeConversationId, setActiveConversationId] = useState("");
  const [message, setMessage] = useState("");
  const [showSafety, setShowSafety] = useState(true);

  useEffect(() => {
    if (!incomingConversation) {
      const existing = getInitialConversations();

      if (existing.length > 0) {
        setConversations(existing);
        setActiveConversationId(existing[0].id);
      }

      return;
    }

    setConversations((current) => {
      const alreadyExists = current.some(
        (conversation) => conversation.id === incomingConversation.id
      );

      let nextConversations;

      if (alreadyExists) {
        nextConversations = current.map((conversation) =>
          conversation.id === incomingConversation.id
            ? {
                ...conversation,
                ...incomingConversation,
                messages:
                  conversation.messages?.length > 0
                    ? conversation.messages
                    : incomingConversation.messages,
                updatedAt: new Date().toISOString()
              }
            : conversation
        );
      } else {
        nextConversations = [incomingConversation, ...current];
      }

      saveConversations(nextConversations);
      return nextConversations;
    });

    setActiveConversationId(incomingConversation.id);
  }, [incomingConversation]);

  const activeConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) => conversation.id === activeConversationId
      ) || conversations[0] || null
    );
  }, [conversations, activeConversationId]);

  function handleSendMessage(event) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || !activeConversation) return;

    const newMessage = {
      id: `message-${Date.now()}`,
      sender: "me",
      text: cleanMessage,
      createdAt: new Date().toISOString()
    };

    const nextConversations = conversations.map((conversation) => {
      if (conversation.id !== activeConversation.id) return conversation;

      return {
        ...conversation,
        messages: [...(conversation.messages || []), newMessage],
        updatedAt: new Date().toISOString()
      };
    });

    setConversations(nextConversations);
    saveConversations(nextConversations);
    setMessage("");
  }

  return (
    <main className="messages-page">
      <div className="messages-shell">
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
                    {conversation.sellerName?.slice(0, 1)?.toUpperCase()}
                  </div>

                  <div>
                    <strong>{conversation.sellerName}</strong>
                    <p>{conversation.listing?.title || "Conversation"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="messages-main">
          {!activeConversation ? (
            <div className="messages-empty-main">
              <h2>Select a conversation</h2>
              <p>Your messages will appear here.</p>
            </div>
          ) : (
            <>
              <header className="messages-topbar">
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
                  <small>Includes Buyer Protection</small>
                </div>

                <div className="messages-listing-actions">
                  <button type="button" className="messages-outline-button">
                    Make an offer
                  </button>

                  <button type="button" className="messages-buy-button">
                    Buy
                  </button>
                </div>
              </div>

              <div className="messages-thread">
                <div className="messages-seller-card">
                  <div className="messages-avatar">
                    {activeConversation.sellerName?.slice(0, 1)?.toUpperCase()}
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

                {(activeConversation.messages || []).map((item) => (
                  <div
                    key={item.id}
                    className={`message-bubble-row ${
                      item.sender === "me" ? "me" : ""
                    }`}
                  >
                    <div className="message-bubble">
                      <p>{item.text}</p>
                    </div>
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

              <form className="messages-composer" onSubmit={handleSendMessage}>
                <button type="button" aria-label="Add attachment">
                  <Plus size={21} />
                </button>

                <button type="button" aria-label="Add photo">
                  <Camera size={21} />
                </button>

                <input
                  type="text"
                  placeholder="Send a message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />

                <button type="submit" aria-label="Send message">
                  <Send size={21} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}