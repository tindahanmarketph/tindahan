import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/*
 * Gestion d'une annonce depuis le profil (cahier L3.1) :
 * Edit · modifier le prix · Pause/Resume · Mark as sold · Boost · Delete.
 */
export default function OwnerListingActions({ listing, userId, onChange }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [price, setPrice] = useState(String(Math.round(Number(listing.price) || 0)));
  const [error, setError] = useState("");

  const status = String(listing.status || "active").toLowerCase();
  const isSold = ["sold", "completed"].includes(status);
  const isReserved = status === "reserved";
  const isPaused = ["hidden", "paused"].includes(status);

  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const setStatus = (next) =>
    run(async () => {
      const { error: updateError } = await supabase
        .from("listings")
        .update({ status: next })
        .eq("id", listing.id)
        .eq("seller_id", userId);
      if (updateError) throw updateError;
      onChange?.({ ...listing, status: next });
    });

  const savePrice = () =>
    run(async () => {
      const value = Math.round(Number(price));
      if (!Number.isFinite(value) || value < 1) throw new Error("Enter a price of at least ₱1.");
      const { error: updateError } = await supabase
        .from("listings")
        .update({ price: value })
        .eq("id", listing.id)
        .eq("seller_id", userId);
      if (updateError) throw updateError;
      setEditingPrice(false);
      onChange?.({ ...listing, price: value });
    });

  const remove = () =>
    run(async () => {
      if (isReserved) {
        throw new Error("A buyer is checking out or has ordered this item. It can't be deleted right now.");
      }
      if (!window.confirm("Delete this listing? This cannot be undone.")) return;
      const { error: deleteError } = await supabase
        .from("listings")
        .delete()
        .eq("id", listing.id)
        .eq("seller_id", userId);
      if (deleteError) throw deleteError;
      onChange?.(null, listing.id);
    });

  return (
    <div className="owner-card-actions" data-testid="owner-card-actions">
      {isPaused && <span className="owner-card-badge">Paused · hidden from buyers</span>}
      {isReserved && <span className="owner-card-badge">Reserved · order in progress</span>}

      {editingPrice ? (
        <div className="owner-card-price">
          <input
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
            aria-label="New price"
            data-testid="owner-price-input"
          />
          <button type="button" disabled={busy} onClick={savePrice} data-testid="owner-price-save">Save</button>
          <button type="button" disabled={busy} onClick={() => setEditingPrice(false)}>Cancel</button>
        </div>
      ) : (
        <div className="owner-card-buttons">
          {!isSold && <button type="button" onClick={() => navigate(`/edit/${listing.id}`)}>Edit</button>}
          {!isSold && <button type="button" disabled={busy} onClick={() => setEditingPrice(true)}>Price</button>}
          {!isSold && !isReserved && (
            <button type="button" disabled={busy} onClick={() => setStatus(isPaused ? "active" : "hidden")} data-testid="owner-pause">
              {isPaused ? "Resume" : "Pause"}
            </button>
          )}
          {!isSold && !isReserved && (
            <button type="button" disabled={busy} onClick={() => setStatus("sold")}>Mark as sold</button>
          )}
          {!isSold && !isPaused && <button type="button" onClick={() => navigate("/promotion-tools")}>Boost</button>}
          {!isReserved && (
            <button type="button" className="danger" disabled={busy} onClick={remove} data-testid="owner-delete">Delete</button>
          )}
        </div>
      )}

      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
