import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const guideItems = [
  "Who pays for shipping?",
  "What can you sell on TindaHan?",
  "How to sell items faster?",
  "How to list an item?",
  "What is a boost?",
  "How to ship an item?",
  "How to set the right price?",
  "How to choose the right parcel size?",
  "How does the wallet work?"
];

export default function TindaHanGuide() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage tindahan-guide-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>TindaHan Guide</h1>

        <span />
      </header>

      <section className="tindahan-guide-list">
        {guideItems.map((item) => (
          <button key={item} type="button" className="tindahan-guide-row">
            <span>{item}</span>
            <ChevronRight size={23} />
          </button>
        ))}
      </section>
    </main>
  );
}