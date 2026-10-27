import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

/* Tailles et marques choisies (enregistrées sur l'appareil, par compte). */

const EMPTY = { sizes: {}, groups: {}, brands: [] };
const storageKey = (userId) => `tindahan_personalisation_${userId || "guest"}`;

export function readPersonalisation(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function usePersonalisation() {
  const { user } = useAuth();
  const userId = user?.id;
  const [data, setData] = useState(() => readPersonalisation(userId));

  useEffect(() => {
    setData(readPersonalisation(userId));
  }, [userId]);

  const update = useCallback(
    (producer) => {
      setData((current) => {
        const next = producer(current);

        try {
          localStorage.setItem(storageKey(userId), JSON.stringify(next));
        } catch {
          /* ignore */
        }

        return next;
      });
    },
    [userId]
  );

  return [data, update];
}
