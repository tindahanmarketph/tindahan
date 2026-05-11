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
        id: createId("intro"),
        sender: "seller",
        text: `Hello, I am ${sellerName}.`,
        photos: [],
        createdAt: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  };
}

export default function Messages() {
  const [searchParams] = useSearchParams();
  const photoInputRef = useRef(null);

  const incomingConversation = useMemo(
    () => buildConversationFromParams(searchParams),
    [searchParams]
  );

  const [conversations, setConversations] = useState(() =>
    getInitialConversations()
  );
  const [activeConversationId, setActiveConversationId] = useState("");
  const [message, setMessage] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showBundleBox, setShowBundleBox] = useState(false);
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
      ) ||
      conversations[0] ||
      null
    );
  }, [conversations, activeConversationId]);

  function updateActiveConversation(newMessage) {
    if (!activeConversation) return;

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

  function handleStartBundle() {
    if (!activeConversation) return;

    const newMessage = {
      id: createId("message"),
      sender: "me",
      text: "I would like to create a bundle with several items from your closet.",
      photos: [],
      type: "bundle",
      createdAt: new Date().toISOString()
    };

    updateActiveConversation(newMessage);
    setShowBundleBox(false);
  }

  function handlePhotoButtonClick() {
    photoInputRef.current?.click();
  }

  function handleSendMessage() {
    const cleanMessage = message.trim();

    if (!activeConversation) return;
    if (!cleanMessage && selectedPhotos.length === 0) return;

    const newMessage = {
      id: createId("message"),
      sender: "me",
      text: cleanMessage,
      photos: selectedPhotos,
      createdAt: new Date().toISOString()
    };

    updateActiveConversation(newMessage);
    setMessage("");
    setSelectedPhotos([]);
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
          )}
        </section>
      </div>
    </main>
  );
}