import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

/*
 * Messages non lus (cahier L4.9 : la pastille ne doit plus être « parasite »).
 * Une conversation est non lue si son dernier message vient de l'autre personne
 * et date d'après la dernière ouverture sur cet appareil (localStorage).
 * Aucune colonne ni table supplémentaire n'est nécessaire.
 */

const seenKey = (uid) => `tindahan_conv_seen_${uid}`;
const EVENT = "tindahan:conv-seen";

function loadSeen(uid) {
  try {
    return JSON.parse(localStorage.getItem(seenKey(uid)) || "{}") || {};
  } catch {
    return {};
  }
}

export function markConversationSeen(uid, conversationId) {
  if (!uid || !conversationId) return;
  try {
    const seen = loadSeen(uid);
    seen[conversationId] = new Date().toISOString();
    localStorage.setItem(seenKey(uid), JSON.stringify(seen));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignoré */
  }
}

export function useUnreadMessages(userId) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }

    try {
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("id")
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (error || !conversations?.length) {
        setCount(0);
        return;
      }

      const ids = conversations.map((c) => c.id);
      const { data: messages } = await supabase
        .from("messages")
        .select("conversation_id, sender_id, created_at")
        .in("conversation_id", ids)
        .order("created_at", { ascending: false })
        .limit(200);

      const seen = loadSeen(userId);
      const latest = new Map();
      (messages || []).forEach((m) => {
        if (!latest.has(m.conversation_id)) latest.set(m.conversation_id, m);
      });

      let unread = 0;
      latest.forEach((m, conversationId) => {
        if (String(m.sender_id) === String(userId)) return;
        const seenAt = seen[conversationId];
        if (!seenAt || new Date(m.created_at) > new Date(seenAt)) unread += 1;
      });

      setCount(unread);
    } catch {
      setCount(0);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 45000);
    window.addEventListener(EVENT, refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener(EVENT, refresh);
    };
  }, [refresh]);

  return count;
}
