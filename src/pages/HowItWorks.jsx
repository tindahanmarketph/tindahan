import { Link } from "react-router-dom";
import { Lock, PackageCheck } from "lucide-react";

const imagePath = (fileName) =>
  `${import.meta.env.BASE_URL}how-it-works/${fileName}`;

export default function HowItWorks() {
  const sellSteps = [
    {
      image: imagePath("sell-2.jpg"),
      alt: "Taking a photo of an item",
      title: "1. List for free",
      text:
        "Take photos, describe your item, choose a category, set your price and publish your listing for free."
    },
    {
      image: imagePath("sell-3.jpg"),
      alt: "Preparing an item for delivery",
      title: "2. Sell and prepare",
      text:
        "Once a buyer is interested, prepare the item carefully and get it ready for delivery."
    },
    {
      image: imagePath("sell-4.jpg"),
      alt: "Buyer confirming an order",
      title: "3. Get paid",
      text:
        "TindaHan is being built with buyer protection and future local payments through GCash and Maya."
    }
  ];

  const buySteps = [
    {
      image: imagePath("buy-1.jpg"),
      alt: "Finding an item on TindaHan",
      title: "1. Find it",
      text:
        "Browse second-hand treasures from sellers across the Philippines and discover unique items at fair prices."
    },
    {
      image: imagePath("buy-2.jpg"),
      alt: "Buying an item safely",
      title: "2. Buy it",
      text:
        "Choose the item you love, contact the seller, and get ready for secure local payment options in the future."
    },
    {
      image: imagePath("buy-3.jpg"),
      alt: "Receiving a parcel",
      title: "3. Receive it",
      text:
        "Your item will be delivered through local shipping options such as J&T Express once delivery is activated."
    }
  ];

  return (
    <main className="how-page">
      <section className="how-hero">
        <div className="how-hero-container">
          <div className="how-hero-text">
            <h1>
              TindaHan, the marketplace that makes second-hand feel exciting
            </h1>

            <p>
              Join a growing community across the Philippines. Sell what you no
              longer use, discover unique finds, and shop second-hand with peace
              of mind.
            </p>

            <div className="how-hero-actions">
              <Link to="/sell" className="how-primary-button">
                Start selling
              </Link>

              <Link to="/" className="how-secondary-button">
                Start shopping
              </Link>
            </div>
          </div>

          <div className="how-hero-image-wrap">
            <img
              src={imagePath("hero.jpg")}
              alt="Woman preparing a second-hand item"
            />
          </div>
        </div>
      </section>

      <section className="how-block">
        <div className="how-container">
          <h2>Sell in 3 simple steps</h2>

          <div className="how-cards">
            {sellSteps.map((step) => (
              <article className="how-card" key={step.title}>
                <img
                  className="how-card-image"
                  src={step.image}
                  alt={step.alt}
                />

                <h3>{step.title}</h3>
                <p>{step.text}</p>

                <Link to="/sell">Learn more</Link>
              </article>
            ))}
          </div>

          <div className="how-action-center">
            <Link to="/sell" className="how-outline-button">
              Start selling
            </Link>
          </div>
        </div>
      </section>

      <section className="how-block how-block-muted">
        <div className="how-container">
          <h2>Buy safely</h2>

          <div className="how-cards">
            {buySteps.map((step) => (
              <article className="how-card" key={step.title}>
                <img
                  className="how-card-image"
                  src={step.image}
                  alt={step.alt}
                />

                <h3>{step.title}</h3>
                <p>{step.text}</p>

                <Link to="/">Learn more</Link>
              </article>
            ))}
          </div>

          <div className="how-action-center">
            <Link to="/" className="how-outline-button">
              Start shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="how-safety">
        <div className="how-container">
          <h2>Your safety matters</h2>

          <div className="how-safety-grid">
            <article className="how-safety-item">
              <div className="how-safety-icon">
                <Lock size={30} />
              </div>

              <div>
                <h3>Buyer Shield</h3>

                <p>
                  Buyers will pay a protection fee on future secure transactions.
                  This will help cover payment support and issue handling.
                </p>

                <Link to="/">Learn more</Link>
              </div>
            </article>

            <article className="how-safety-item">
              <div className="how-safety-icon">
                <PackageCheck size={30} />
              </div>

              <div>
                <h3>Local delivery</h3>

                <p>
                  TindaHan is designed for the Philippines, with local delivery
                  options such as J&T Express planned for the next phases.
                </p>

                <Link to="/">Learn more</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="how-final">
        <div className="how-final-inner">
          <h2>Ready?</h2>

          <div className="how-final-actions">
            <Link to="/" className="how-final-outline">
              Start shopping
            </Link>

            <Link to="/sell" className="how-final-solid">
              Start selling
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}