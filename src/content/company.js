import { p, h3, ul, ol, note, table, section } from "./blocks";
import { CONTACT_EMAIL, SOCIAL, LEGAL_UPDATED } from "./site";

const MAIL = `[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`;

export const about = {
  title: "About TindaHan",
  kicker: "TindaHan",
  summary: "A second-hand marketplace made for the Philippines: simple, local and safe.",
  related: ["platform", "sustainability", "trust-and-safety"],
  sections: [
    section("story", "Our story",
      p("“Tindahan” is the Filipino word for a small neighbourhood store. TindaHan brings that spirit online: a friendly place where people sell what they no longer use and find good things at fair prices, from Aparri to Jolo."),
      p("We are building TindaHan for Filipinos, with local ways to pay and receive: **GCash and Maya** for payments, couriers such as **J&T Express, Ninja Van and LBC Express**, and **Safe Meet-Up** spots for people who prefer to meet in person.")),
    section("what", "What you can do",
      ul("**Sell for free.** 0% seller fees, always. Take photos, set a price in pesos and publish.",
         "**Buy with confidence.** Buyer Protection helps cover secure payment and issue handling.",
         "**Find unique things.** Fashion, gadgets, home, hobbies, local and cultural items and more, at sulit prices.",
         "**Choose how to receive.** Delivery to a drop-off point, or a safe meet-up.")),
    section("values", "What we care about",
      ul("**Trust:** clear rules, protection, and real people.", "**Simplicity:** a few taps to list, buy and track.", "**Fairness:** no seller fees, honest prices, no hidden costs.", "**Community:** a respectful marketplace where reusing is the normal thing to do.")),
    section("beta", "TindaHan is in beta",
      p("We are launching step by step. Some features are being switched on progressively, and we are listening to your feedback. Follow the launch on [Instagram](" + SOCIAL.instagram + ") and [Facebook](" + SOCIAL.facebook + ")."),
      p("Questions or ideas? Write to " + MAIL + "."))
  ]
};

export const platform = {
  title: "Our platform",
  kicker: "TindaHan",
  summary: "How TindaHan works for buyers, sellers and delivery.",
  related: ["buy", "buyer-protection", "item-verification"],
  sections: [
    section("sellers", "For sellers",
      ol("**List for free.** Add photos, describe the item, choose a category, set your price.", "**Sell and prepare.** When a buyer is interested, prepare the item carefully.", "**Ship or meet.** Download the shipping label and drop the parcel at a partner point, or meet at a Safe Meet-Up spot.", "**Get paid.** Your earnings go to your TindaHan wallet once the order is completed.")),
    section("buyers", "For buyers",
      ol("**Find it.** Search, filter by category, size, brand, condition and price.", "**Buy it.** Message the seller, make an offer, and pay through checkout.", "**Receive it.** Track your parcel or meet at a Safe Meet-Up spot, check the item, then confirm.")),
    section("tools", "Tools for members",
      table(["Tool", "What it does"], [
        ["Wallet", "Your balance from sales and refunds"],
        ["Bundle discounts", "Offer a discount when a buyer takes several items"],
        ["Holiday mode", "Pause your closet while you are away"],
        ["Badges", "Show buyers you are active and reliable"],
        ["Promotion tools", "Reach more buyers (coming soon)"],
        ["Personalisation", "Choose sizes, brands and members for your feed"]
      ])),
    section("partners", "Local partners",
      p("We work with local payment and delivery partners. Availability depends on the stage of the beta and on your area. See the [Help Center](/help-center) for the current status."))
  ]
};

export const sustainability = {
  title: "Sustainability",
  kicker: "TindaHan",
  summary: "Giving things a second life is good for your wallet and for the planet.",
  related: ["about", "buy"],
  sections: [
    section("why", "Why second-hand",
      p("Every item that is reused is one less item to make, ship and throw away. In the Philippines, where waste and plastic pollution are major concerns for our coasts and rivers, reusing is a simple action everyone can take."),
      ul("Sell what you no longer use instead of throwing it away.", "Buy pre-loved first, new second.", "Repair, resell and pass things on: from clothes to gadgets, tools and home items.")),
    section("tips", "Tips for a lighter footprint",
      ul("Reuse boxes and bubble wrap when you ship.", "Choose meet-ups when it is easy and safe, to avoid extra packaging.", "Describe items honestly so they are not returned.", "Donate items that are not sellable (see [Donations](/donations).)")),
    section("commit", "Our commitment",
      p("We are a young project, so we start small: make reuse easy, keep fees at zero for sellers, and be transparent about what we do. We will share concrete actions as TindaHan grows."))
  ]
};

export const press = {
  title: "Press",
  kicker: "TindaHan",
  summary: "Information for journalists and creators.",
  related: ["about", "advertising"],
  sections: [
    section("about", "TindaHan in short",
      p("TindaHan is a second-hand marketplace in the Philippines where people buy and sell directly with each other, with no seller fees, Buyer Protection and local payment and delivery options being rolled out. It is currently in beta.")),
    section("contact", "Press contact",
      p("For interviews, images and information, write to " + MAIL + " with the subject “Press”. We reply as soon as we can.")),
    section("assets", "Logos and brand",
      p("Please use the TindaHan logo as provided. Do not change its colours, distort it, or add effects. Ask us if you need files or a different format."),
      p("Follow us: [Instagram](" + SOCIAL.instagram + ") · [Facebook](" + SOCIAL.facebook + ")"))
  ]
};

export const advertising = {
  title: "Advertising",
  kicker: "TindaHan",
  summary: "TindaHan does not show ads today.",
  related: ["press", "about"],
  sections: [
    section("now", "Today",
      p("TindaHan does not show third-party advertising and does not sell your personal data. Our model is simple: **0% seller fees**, and an 8% Buyer Protection fee paid by buyers on secure purchases.")),
    section("partners", "Partnerships",
      p("If you are a brand, a local business or an organisation and you would like to work with us (for example on sustainability or community projects), write to " + MAIL + " with the subject “Partnership”."),
      note("If we introduce promoted listings or other advertising in the future, they will be clearly labelled, and your privacy choices will apply.", "info"))
  ]
};

export const accessibility = {
  title: "Accessibility",
  kicker: "TindaHan",
  summary: "TindaHan should be usable by everyone, on any phone.",
  related: ["about", "help-center"],
  sections: [
    section("commitment", "Our commitment",
      p("We want everyone to be able to use TindaHan, including people who use screen readers, keyboards, larger text, or older and low-cost phones. We work towards the Web Content Accessibility Guidelines (WCAG) 2.1 level AA.")),
    section("what", "What we do",
      ul("A **dark mode** and a light mode, with readable contrast. Choose in [Settings → Appearance](/settings/appearance).", "Clear text, large touch targets and labels on buttons and icons.", "Pages that work on slow connections and small screens.", "Text in simple English. We plan to add Filipino and other languages.")),
    section("limits", "Known limits",
      p("Some parts of TindaHan are still being improved, for example some images and animations. If you find something hard to use, tell us.")),
    section("contact", "Tell us",
      p("Write to " + MAIL + " with the page, your device and what happened. We will reply and work on a fix."))
  ]
};

export const mobileApps = {
  title: "Mobile apps",
  kicker: "Discover",
  summary: "Use TindaHan on your phone today, straight from your browser.",
  related: ["platform", "accessibility"],
  sections: [
    section("now", "TindaHan on your phone",
      p("TindaHan works in your phone browser, and you can add it to your home screen so it opens like an app. Native iPhone and Android apps are planned for later.")),
    section("android", "Android (Chrome)",
      ol("Open TindaHan in Chrome.", "Tap the **⋮** menu.", "Tap **Add to Home screen** or **Install app**.")),
    section("iphone", "iPhone (Safari)",
      ol("Open TindaHan in Safari.", "Tap the **Share** button.", "Tap **Add to Home Screen**.")),
    section("soon", "App Store and Google Play",
      p("We will announce the apps on [Instagram](" + SOCIAL.instagram + ") and [Facebook](" + SOCIAL.facebook + ") when they are ready."))
  ]
};

export const buy = {
  title: "How to buy on TindaHan",
  kicker: "Help",
  summary: "From finding an item to receiving it safely.",
  related: ["buyer-protection", "trust-and-safety", "platform"],
  sections: [
    section("steps", "Buy in 5 steps",
      ol("**Search or browse.** Use categories and filters: size, brand, condition, price.", "**Check the listing.** Look at the photos, description, condition and seller rating. Ask questions in messages.", "**Pay through TindaHan.** Choose GCash or Maya at checkout. You will see the item price, the Buyer Protection fee and delivery before you pay.", "**Receive.** Track your parcel, or meet at a Safe Meet-Up spot.", "**Confirm and review.** Check the item first. Then confirm and leave a review.")),
    section("safe", "Buy safely",
      ul("Pay only inside TindaHan. Never send money to “reserve” an item.", "Never share your OTP or PIN.", "Be careful with prices that look too good to be true.", "Use Safe Meet-Up spots and check the item before you confirm."),
      p("Read more in [Trust and safety](/trust-and-safety) and [Buyer Protection](/buyer-protection).")),
    section("help", "Need help?",
      p("Visit the [Help Center](/help-center) or write to " + MAIL + "."))
  ]
};

export const trustSafety = {
  title: "Trust and safety",
  kicker: "Trust and safety",
  summary: "How we help you buy and sell with confidence, and how you can protect yourself.",
  related: ["buyer-protection", "community-guidelines", "item-verification"],
  sections: [
    section("we", "What we do",
      ul("**Buyer Protection** on purchases paid through checkout.", "**Secure payments** with e-wallets, where available.", "**Safe Meet-Up spots** in public places.", "**Reviews and ratings** to build trust.", "**Reporting tools** and moderation to remove scams and abuse.")),
    section("scams", "Common scams in online selling",
      table(["Scam", "What to do"], [
        ["“Pay a reservation fee via GCash first”", "Do not pay outside TindaHan. Use checkout only."],
        ["Fake proof of payment screenshots", "Sellers: do not ship until the payment shows as paid in the app."],
        ["“I’m from TindaHan, send me your OTP”", "Never share OTPs or PINs. TindaHan never asks for them."],
        ["Links to other websites to “verify” your account or get paid", "Do not click. Report it to us."],
        ["Overpayment and “send back the difference”", "Refuse. It is a scam."],
        ["Prices far below market for branded items", "Ask for proof of authenticity. Be careful."]
      ])),
    section("meetup", "Meeting in person",
      ul("Use the **Safe Meet-Up** spots in the app: busy, public places.", "Go in daylight, tell a friend, and bring a charged phone.", "Check the item before you confirm. Test gadgets and try on clothes.", "Do not go to a private home or an isolated place.", "If you feel unsafe, leave.")),
    section("report", "Report",
      p("Use **Report** in the app or write to " + MAIL + ". In an emergency, call **911**."))
  ]
};

export const itemVerification = {
  title: "Item verification",
  kicker: "Trust and safety",
  summary: "How we help you check that an item is genuine and as described.",
  related: ["trust-and-safety", "buyer-protection"],
  sections: [
    section("status", "Status",
      note("Item verification for branded and high-value items is being prepared. Today, members check items with the tips below, and Buyer Protection covers counterfeits sold as genuine.", "info")),
    section("buyers", "Tips for buyers",
      ul("Ask for **clear photos** of labels, serial numbers, stitching, packaging and proof of purchase.", "Compare with the brand’s official product.", "Ask for a short video of the item, with today’s date written on a paper.", "Be careful with very low prices for luxury or limited items.", "Use a meet-up to inspect high-value items.")),
    section("sellers", "Tips for sellers",
      ul("Show the label, serial number, receipt or box when you have them.", "Be honest about condition and flaws.", "Never list replicas or counterfeits: they are banned (see [prohibited items](/community-guidelines#prohibited)).")),
    section("later", "What is coming",
      p("We plan to offer verification for selected categories, with a visible badge on verified listings. We will announce it in the app."))
  ]
};
