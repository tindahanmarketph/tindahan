import { p, h3, ul, ol, note, table, section } from "./blocks";
import {
  CONTACT_EMAIL, NPC_WEBSITE, NPC_EMAIL, DTI_HOTLINE, DTI_EMAIL, LEGAL_UPDATED
} from "./site";

const MAIL = `[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`;

/* ====================================================================== */
export const terms = {
  title: "Terms and Conditions",
  kicker: "Legal",
  updated: LEGAL_UPDATED,
  summary:
    "The rules for using TindaHan, written in plain English. By creating an account or using TindaHan you agree to them.",
  related: ["privacy", "cookies", "community-guidelines", "buyer-protection"],
  sections: [
    section("about", "1. About TindaHan and these Terms",
      p("TindaHan is an online marketplace where people in the Philippines buy and sell second-hand items directly with each other. These Terms and Conditions (the “Terms”) are an agreement between you and TindaHan, operated by Gian (“TindaHan”, “we”, “us”)."),
      p("By creating an account, listing an item, making an offer or buying, you confirm that you have read and accepted these Terms, our [Protection Center](/privacy), our [Cookie Policy](/cookies) and our [Community Guidelines](/community-guidelines)."),
      note("**TindaHan is in beta.** Some features, such as secure payments with GCash and Maya and delivery with courier partners like J&T Express, are being switched on step by step. When a feature is not available yet, the app says so. We may change, pause or remove beta features, and we will do our best to tell you first.", "info")),

    section("eligibility", "2. Who can use TindaHan",
      ul("You must be at least **18 years old** and able to enter into a binding contract under Philippine law.",
         "You must give accurate information when you sign up and keep it up to date (name, e-mail, phone number, address for deliveries).",
         "One person, one account. Do not create accounts to get around a suspension, a block or a limit.",
         "You are responsible for your password and for everything done with your account. Tell us at once at " + MAIL + " if you think someone else has used it.",
         "Never share your one-time passwords (OTP), GCash or Maya PIN with anyone, including people who say they work for TindaHan. We will never ask for them.")),

    section("how-it-works", "3. How TindaHan works",
      p("TindaHan provides the place and the tools: listings, messaging, offers, checkout, Buyer Protection, delivery labels and Safe Meet-Up spots. **The contract of sale is between the buyer and the seller.** TindaHan is not the seller, does not own the items, and does not inspect every item, although we help with item verification where it is offered."),
      p("Members are individuals, not employees or agents of TindaHan. What we do is facilitate the transaction, process payments through our partners, and give you a way to report problems and ask for help.")),

    section("selling", "4. Selling on TindaHan",
      ul("**Sell only what is yours** and what you are allowed to sell. Items in the [prohibited list](/community-guidelines#prohibited) cannot be listed.",
         "**Describe honestly.** Use clear, recent photos of the real item, state the condition (new with tags, new without tags, like new, very good, good, fair), and mention flaws, missing parts and size.",
         "**Prices are in Philippine pesos (₱)** and must be the real price of the item. Do not ask buyers to pay extra off the platform.",
         "**Keep the sale on TindaHan.** Do not ask buyers to pay or deliver outside the app. Off-platform deals are not covered by Buyer Protection.",
         "**Ship or hand over on time.** Prepare the item carefully. If you cannot complete a sale, cancel it as soon as possible. Use Holiday Mode when you are away (for example during Undas, Holy Week or Christmas).",
         "Selling on TindaHan costs **0% in seller fees**. Costs such as packaging, and any taxes that apply to you, are yours."),
      h3("If you sell as a business"),
      p("Individuals who sell their own used belongings are generally treated as private sellers. If you sell regularly to earn income, or you sell new items for resale, you are likely an online merchant. Philippine laws on consumer protection and internet transactions then apply to you, which may include business registration with the DTI or SEC, registration and tax obligations with the BIR, and clear disclosure of who you are. **You are responsible for your own permits, registrations and taxes.** TindaHan may ask for business details and may, if the law requires, report or withhold taxes in the future.")),

    section("buying", "5. Buying on TindaHan",
      ul("Messages, offers and likes are not a purchase. A purchase is made when you complete checkout, or when a seller accepts your offer and you pay.",
         "You must pay through TindaHan checkout where it is available. At checkout you will see the item price, the Buyer Protection fee, and delivery costs before you pay.",
         "Read the listing and the seller’s answers before buying. Ask questions first: sizes, defects, authenticity, what is included.",
         "Buyers can leave a rating and review once an order is completed.")),

    section("fees", "6. Fees and prices",
      table(["Fee", "Who pays", "Amount"], [
        ["Listing and selling", "Seller", "₱0. **0% seller fees**."],
        ["Buyer Protection", "Buyer", "**8% of the item price**, added at checkout. It covers payment support and issue handling. See [Buyer Protection](/buyer-protection)."],
        ["Delivery", "Usually the buyer", "Shown at checkout. Depends on the courier, parcel size and distance."],
        ["Payment provider charges", "Shown at checkout if any", "Charged by the e-wallet or bank, not by TindaHan."]
      ]),
      p("We may change our fees. We will tell you before a change applies, and it will not affect orders already placed.")),

    section("payments", "7. Payments, wallet and refunds",
      ul("Payments are made with **GCash** or **Maya** (and other methods when we add them) through licensed payment partners. TindaHan does not see or store your e-wallet PIN, OTP or password.",
         "Where Secure Payment is available, we hold the buyer’s payment until the order is delivered or handed over and the buyer confirms, or until the confirmation period ends. Then the seller is paid.",
         "Sellers’ earnings appear in the **TindaHan wallet**. When payouts to GCash, Maya or a bank account are available, you can transfer your balance from the wallet.",
         "Approved refunds are returned to the **buyer’s wallet** (or to the original payment method when that is possible).",
         "We may delay or hold a payment, a payout or a refund if we reasonably suspect fraud, an error or a breach of these Terms, or if the law requires it. We will tell you why when we can.")),

    section("delivery", "8. Delivery and meet-ups",
      ul("**Delivery.** Sellers use the shipping label generated in the app and drop the parcel at a partner point (for example J&T Express, Ninja Van or LBC Express) or arrange a pick-up where it is available. Track the parcel in your order page.",
         "**Packing.** Sellers must pack items so they arrive in the condition described. Use the correct parcel size.",
         "**Delays.** Deliveries between islands and during typhoons, floods or public holidays can take longer. This is not a reason to open a dispute until the estimated delivery date has passed.",
         "**Meet-ups.** Use the **Safe Meet-Up** spots offered in the app (busy, public places such as malls). Meet in daylight when you can, check the item before you confirm, and never go to a private place alone for a sale.",
         "Risk of loss follows the delivery process shown in your order. If a parcel is lost or damaged in transit, contact us from your order page.")),

    section("issues", "9. Problems with an order",
      p("If your item does not arrive, is not as described, is damaged, or is not the item you bought, open **Refund request** from your order page **before you confirm that everything is fine**. Add photos and a clear explanation. Our [Buyer Protection](/buyer-protection) page explains what is covered, how we review the case, and the possible outcomes."),
      ul("Report problems **within 2 days after the order is marked as delivered or handed over**. After that, the order may be completed and the seller paid.",
         "Do not return an item before we or the seller confirm how. Do not post or sell items under review.",
         "We decide based on the evidence from both sides: listing, photos, messages, tracking and order history. Our decision does not remove rights you have under the law."),
      note("This 2-day period and the review steps are our current beta rules. We will announce any change in the app.", "info")),

    section("reviews", "10. Ratings, reviews and messages",
      p("Reviews must be honest and about the transaction. Do not use reviews or messages to insult, threaten, discriminate, share personal data of others, advertise, or pressure someone to leave the platform. We may remove content that breaks these Terms or the Community Guidelines, and we may read reported messages and use automated checks to protect members from scams.")),

    section("content", "11. Your content and intellectual property",
      ul("You keep ownership of the photos, descriptions and other content you post. You give TindaHan a non-exclusive, worldwide, royalty-free licence to host, display, adapt (for example resize or crop) and promote your listings on TindaHan and, if you allow it in your privacy settings, on social media or other websites, for as long as the listing is online and for a reasonable period after.",
         "Post only content you have the right to use. Do not post other people’s photos, or counterfeit or pirated goods. Philippine intellectual property law, including the Intellectual Property Code, protects trademarks, copyright and designs.",
         "If you believe a listing infringes your rights, write to " + MAIL + " with the listing link, proof of your rights and your contact details. We will review it and may remove the listing.",
         "The TindaHan name, logo, app and website belong to us. You may not copy or reuse them without permission.")),

    section("suspension", "12. Suspension and closing accounts",
      p("We may warn, limit, suspend or close an account, remove listings, or cancel orders, if you break these Terms or the law, put other members at risk, or if we must do so by law or an authority’s order. When we reasonably can, we explain the reason and how to appeal."),
      p("You can close your account at any time from your settings or by writing to us. Closing your account does not cancel orders in progress, which must be completed or settled first.")),

    section("liability", "13. Our responsibility",
      ul("We work hard to keep TindaHan available and safe, but we do not promise it will always be uninterrupted or free of errors, especially during beta.",
         "TindaHan is not responsible for what members list, say or do, or for the quality, safety, legality or authenticity of items, except where the law makes us responsible.",
         "To the extent allowed by law, TindaHan is not liable for indirect or consequential losses, or for loss caused by events outside our control (for example typhoons, power or network outages, or the failure of third-party services).",
         "Nothing in these Terms limits liability that cannot be limited under Philippine law (including fraud, wilful misconduct, gross negligence), or takes away rights you have as a consumer or a data subject.")),

    section("complaints", "14. Complaints and disputes",
      ol("**Talk to the other member** through TindaHan messages. Most issues are solved this way.",
         "**Contact us.** Write to " + MAIL + " or use the Help Center. We have an internal process to review complaints and will reply within a reasonable time.",
         "**Government help.** You can also contact the Department of Trade and Industry (DTI) Consumer Care: hotline **" + DTI_HOTLINE + "**, e-mail [" + DTI_EMAIL + "](mailto:" + DTI_EMAIL + "). For personal data concerns, contact the [National Privacy Commission](" + NPC_WEBSITE + ")."),
      p("These Terms are governed by the laws of the Republic of the Philippines. Disputes that cannot be solved amicably are subject to the competent courts of the Philippines.")),

    section("changes", "15. Changes to these Terms",
      p("We may update these Terms, for example when we add a feature or the law changes. We will show the date of the latest version at the top and will tell you about important changes before they apply. If you keep using TindaHan after the change, you accept the new Terms. If you do not agree, you can close your account.")),

    section("contact", "16. Contact",
      p(`Questions about these Terms? Write to ${MAIL}.`))
  ]
};

/* ====================================================================== */
export const privacy = {
  title: "Protection Center",
  kicker: "Legal",
  updated: LEGAL_UPDATED,
  summary:
    "How TindaHan collects, uses and protects your personal data, under the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).",
  related: ["cookies", "terms", "community-guidelines"],
  sections: [
    section("controller", "Who is responsible",
      p("TindaHan, operated by Gian, is the **personal information controller** for the data collected through the TindaHan website and app. We handle your data in line with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), its Implementing Rules and Regulations and the guidelines of the National Privacy Commission (NPC)."),
      p(`Contact for any privacy question or request: ${MAIL}.`)),

    section("collect", "What we collect and why",
      table(["Data", "Examples", "Why we use it", "Legal basis"], [
        ["Account", "Username, e-mail, password (stored securely by our authentication provider), phone number and its verification", "Create and secure your account, contact you about your orders", "Contract; legitimate interest (security)"],
        ["Profile", "Photo, bio, city, country, whether to show your city", "Show your profile to other members", "Contract; your choice"],
        ["Optional personal details", "Full name, gender, date of birth", "Check you are 18 or over, fill delivery details, personalise", "Your **consent**"],
        ["Listings", "Photos, titles, descriptions, prices, location", "Publish and promote your items", "Contract"],
        ["Messages and offers", "Messages, offers, photos you send", "Let buyers and sellers talk, prevent scams and abuse", "Contract; legitimate interest"],
        ["Orders and delivery", "Items, amounts, name, mobile number, address (street, barangay, city, province, region, postal code), tracking events, meet-up plans", "Process orders, create shipping labels, deliver, handle refunds", "Contract; legal obligation"],
        ["Payments", "Payment method used (GCash, Maya), transaction references, wallet balance and history", "Take payments, pay sellers, refund buyers, prevent fraud", "Contract; legal obligation"],
        ["Reviews and favourites", "Ratings, comments, saved items, followed members", "Build trust and personalise your feed", "Contract; your consent for personalisation"],
        ["Device and usage", "Browser, device type, IP address, security logs, error reports", "Keep TindaHan secure, fix errors, prevent abuse", "Legitimate interest"],
        ["Preferences", "Cookie choices, notification settings", "Remember your choices on your device", "Your choice (storage you ask for)"]
      ]),
      note("**Sensitive personal information.** Under the Data Privacy Act, your age and date of birth are sensitive personal information. We ask for it only to confirm you are an adult and only when you choose to give it. We do not ask for government IDs, health data or religious, political or similar information. If we ever need ID verification, we will ask you separately and explain why.", "info")),

    section("use", "How we use your data",
      ul("To run the marketplace: create your account, show your listings, connect buyers and sellers, process orders, payments, deliveries and refunds.",
         "To keep TindaHan safe: detect fraud, scams and abuse, enforce our Terms and protect members.",
         "To help you: answer questions and complaints, and send service messages (order updates, security alerts).",
         "To improve TindaHan: fix errors and understand which features work, using as little personal data as possible.",
         "To send news and offers **only if you agreed**. You can unsubscribe at any time from any message or from your settings.",
         "To follow the law when an authority or a court requires it."),
      p("We do not sell your personal data and we do not use it for purposes unrelated to TindaHan.")),

    section("share", "Who we share data with",
      p("Only the TindaHan team and the service providers that help us run the service can access your data, and only what they need. They act on our instructions under agreements that protect your data."),
      table(["Who", "What for", "Where"], [
        ["Other members", "Your username, photo, bio, ratings and listings are public. Your delivery name, mobile number and address are shared with the other party and the courier only for an order.", "Philippines and abroad"],
        ["Cloud services (database, authentication, file storage, hosting)", "Store your account, listings, messages and files and run the website", "Outside the Philippines"],
        ["Payment partners (e.g. GCash, Maya)", "Process payments and payouts. They follow their own privacy policies and BSP rules.", "Philippines"],
        ["Couriers (e.g. J&T Express, Ninja Van, LBC Express)", "Deliver parcels", "Philippines"],
        ["E-mail and support tools", "Send service messages and answer you", "Outside the Philippines"],
        ["Authorities", "Only when the law requires or a valid order is received", "Philippines"]
      ]),
      p("Some providers process data outside the Philippines. We use providers that apply appropriate safeguards and we remain responsible for your data.")),

    section("keep", "How long we keep your data",
      ul("**Account and profile:** while your account is open, then deleted or anonymised after closing, except what we must keep.",
         "**Orders, payments and refunds:** as long as needed for the transaction, for disputes and to meet legal, accounting and tax duties.",
         "**Messages:** while the conversation is needed for the order and for safety, then deleted or anonymised.",
         "**Security logs:** for a limited period needed to detect abuse.",
         "**Beta sign-ups:** until you withdraw consent or the beta and launch communications are over."),
      p("When we no longer need data, we delete it securely or anonymise it.")),

    section("security", "How we protect your data",
      p("We apply reasonable and appropriate organisational, physical and technical security measures: encrypted connections (HTTPS), access controls, separation of environments, and limited access for our team. No system is perfectly secure, so please also protect your password and never share OTPs."),
      p("If a personal data breach requires it, we will notify you and the National Privacy Commission **within 72 hours** of becoming aware of it.")),

    section("rights", "Your rights as a data subject",
      ul("**Be informed** about how your personal data is collected and used.",
         "**Withdraw your consent or object**, including to news e-mails. Every newsletter has an unsubscribe link.",
         "**Access** the personal data we hold about you.",
         "**Correct** data that is inaccurate or incomplete.",
         "**Request erasure or blocking** of your data, where warranted.",
         "**Receive your data** in a portable, electronic format.",
         "**Claim compensation** for damages caused by inaccurate, unlawfully obtained or unauthorised use of your data.",
         "**File a complaint** with the National Privacy Commission."),
      h3("How to use your rights"),
      ul("In the app: **Settings → Privacy settings → Your data** lets you download a copy of your data and ask for your account to be deleted.",
         `By e-mail: ${MAIL}. Tell us your username and what you want. We may need to confirm it is you. We reply within a reasonable time.`)),

    section("children", "Children",
      p("TindaHan is for adults only (18 and over). We do not knowingly collect data from minors. If you think a minor has an account, tell us and we will act.")),

    section("complaint", "Complaints",
      p(`If you are not satisfied, write to ${MAIL} first. You can also contact the National Privacy Commission: [privacy.gov.ph](${NPC_WEBSITE}) or [${NPC_EMAIL}](mailto:${NPC_EMAIL}).`)),

    section("changes", "Changes to this notice",
      p("We may update this notice and will tell you of any significant change before it applies. The date of the latest version is at the top of this page."))
  ]
};

/* ====================================================================== */
export const cookies = {
  title: "Cookie Policy",
  kicker: "Legal",
  updated: LEGAL_UPDATED,
  summary:
    "What TindaHan stores on your device, why, and how you can control it. Today we use only what is needed to run the service and the choices you make.",
  related: ["privacy", "terms"],
  sections: [
    section("what", "What is this about",
      p("Websites store small pieces of information on your phone or computer, using cookies or similar technologies such as local storage. This page explains what TindaHan stores. You can change your choices at any time in [Cookie settings](/cookie-settings)."),
      note("**Right now TindaHan does not use advertising cookies and does not use analytics or tracking tools.** If we add them in the future, they will stay off until you accept them.", "success")),

    section("table", "What we store",
      table(["Name", "Purpose", "How long", "Type"], [
        ["tindahan-auth-token", "Keeps you logged in (session issued by our authentication provider)", "Until you log out or the session expires", "Essential"],
        ["tindahan_cookie_consent_v1", "Remembers your cookie choices and when you made them", "Up to 12 months", "Essential"],
        ["tindahan_profile, tindahan_account_settings", "Keeps your profile form on your device while you edit it", "Until you log out or clear it", "Essential"],
        ["tindahan_messages_safety_hidden, tindahan_hidden_conversations_by_user", "Remember a safety notice you closed and conversations you hid", "Until you clear it", "Essential"],
        ["tindahan_safe_meetup_…", "Keeps your meet-up plan for an order", "Until you clear it", "Essential"],
        ["tindahan_new_signup, tindahan_mobile_launch_loader_seen", "Shows the welcome screen once and the start animation once per visit", "Until the welcome is done / the browser session ends", "Essential"]
      ]),
      p("We also load the **Inter** and **Bricolage Grotesque** fonts from Google Fonts. Your browser contacts Google to download them, which shares your IP address with Google.")),

    section("categories", "Your choices",
      ul("**Essential** storage is needed for TindaHan to work (log in, security, your orders). It cannot be turned off.",
         "**Preferences** (optional) remember things like recently viewed items and filters on your device.",
         "**Analytics** (optional, not used today) would help us understand how TindaHan is used.",
         "**Marketing** (optional, not used today) would be used to measure or show promotions."),
      p("Use [Cookie settings](/cookie-settings) to choose. You can also delete stored data from your browser settings, but you may be logged out and some features may not work.")),

    section("law", "Legal basis",
      p("Essential storage is used to provide the service you request. Optional storage is used only with your consent, which you can withdraw at any time. Personal data we process through these technologies is handled as explained in our [Protection Center](/privacy), under the Philippine Data Privacy Act of 2012.")),

    section("contact", "Questions",
      p(`Write to ${MAIL}.`))
  ]
};

/* ====================================================================== */
export const communityGuidelines = {
  title: "Community Guidelines and Prohibited Items",
  kicker: "Trust and safety",
  updated: LEGAL_UPDATED,
  summary:
    "How we keep TindaHan respectful, honest and safe, and what cannot be sold.",
  related: ["terms", "buyer-protection", "trust-and-safety"],
  sections: [
    section("behaviour", "How we treat each other",
      ul("**Be respectful.** No insults, threats, harassment, hate or discrimination.",
         "**Be honest.** Describe items truthfully. No fake photos, fake prices, fake reviews or fake payment proof.",
         "**Be fair.** Do not manipulate prices, create several accounts or pressure people.",
         "**Protect privacy.** Do not share other people’s personal data, photos or messages without permission.",
         "**Stay on TindaHan.** Do not ask people to pay, chat or deliver outside the app, and do not share bank or e-wallet details in chat.",
         "**No spam or ads** unrelated to an item for sale.")),

    section("prohibited", "Items you cannot sell",
      p("We remove listings and may suspend accounts for the items below. Some are banned by Philippine law, others are simply not allowed on TindaHan."),
      table(["Category", "Examples"], [
        ["Weapons", "Firearms, ammunition, explosives, parts and accessories, bladed weapons meant for harm, replicas that look real"],
        ["Illegal drugs and drug equipment", "Dangerous drugs, precursors, paraphernalia"],
        ["Tobacco, vapes and alcohol", "Cigarettes, e-cigarettes, vape devices and liquids, alcoholic drinks"],
        ["Medicines and health products", "Prescription or unregistered medicines, supplements and cosmetics not approved by the FDA, medical devices that need a licence, used contact lenses, opened or used personal care items"],
        ["Counterfeit, replica and pirated goods", "Fake branded items, “class A” or “rep” items, cloned goods, pirated games, films, music or software"],
        ["Stolen or illegally obtained items", "Anything without proof you can sell it, items from scams or theft, items under lien"],
        ["Wildlife and nature", "Live animals, endangered species and their parts, ivory, coral, protected plants"],
        ["Human-related", "Human remains or organs, used underwear, breast milk"],
        ["Adult content", "Sexual services or explicit material of any kind"],
        ["Personal documents and data", "IDs, government documents, SIM cards, bank or e-wallet accounts, login details, personal data lists"],
        ["Gift cards, vouchers, tickets and codes", "Items with a risk of fraud, unless TindaHan clearly allows it"],
        ["Services, jobs, loans, investments and lottery", "TindaHan is only for physical items"],
        ["Dangerous or recalled goods", "Recalled products, hazardous chemicals, unsafe children’s items"]
      ]),
      note("This list is not complete. If you are unsure, do not list the item and ask us at " + MAIL + ".", "warning")),

    section("report", "Report a problem",
      p("Use the **Report** option on a listing, profile or message, or write to " + MAIL + ". Include the link and screenshots. We review reports as soon as we can and may remove content, warn, limit or suspend accounts."),
      p("If someone is in danger, or you are the victim of a crime, contact the Philippine National Police (**911**) first.")),

    section("enforcement", "What happens if you break the rules",
      ol("We remove the content or cancel the order.", "We warn or limit your account.", "For serious or repeated breaches, we suspend or close the account, and we may report to the authorities.")),

    section("appeal", "Appeals",
      p("If you think we made a mistake, write to " + MAIL + " within 14 days with your username and what happened. A person will review it."))
  ]
};

/* ====================================================================== */
export const buyerProtection = {
  title: "Buyer Protection",
  kicker: "Trust and safety",
  updated: LEGAL_UPDATED,
  summary:
    "An 8% protection fee on purchases made through TindaHan checkout helps cover secure payment and issue handling.",
  related: ["terms", "trust-and-safety", "community-guidelines"],
  sections: [
    section("what", "What it is",
      p("Buyer Protection applies when you pay through TindaHan checkout. It covers payment support and issue handling, so you can buy from members you do not know with more confidence. It is a **mandatory fee of 8% of the item price**, shown before you pay. Sellers pay nothing to sell."),
      p("You can see the full price with protection on every listing, in the line “₱… incl.”. Tap the shield to see how it is calculated."),
      note("Buyer Protection is being rolled out with secure payments (GCash and Maya) and delivery. During beta, some orders may use simulated or limited flows. The app tells you when that is the case.", "info")),

    section("covered", "What is covered",
      ul("The item **did not arrive**.",
         "The item is **not as described** (wrong size, colour or condition, missing parts, hidden damage).",
         "The item is **damaged** or **not the one you bought**.",
         "The item is a **counterfeit** sold as genuine.")),

    section("not-covered", "What is not covered",
      ul("Payments made **outside** TindaHan, or items delivered or handed over outside the app.",
         "A change of mind, or an item that simply does not suit you, when it was described correctly.",
         "Normal wear that was shown in the photos and description.",
         "Problems reported **after the order was completed** or after the reporting period.",
         "Items you collected at a meet-up and accepted on the spot.")),

    section("how", "How to ask for a refund",
      ol("Open your order in **My sales and purchases**.",
         "Before you confirm the order, choose **Refund request** and select the reason.",
         "Add clear photos and a short explanation. Report within **2 days after delivery**.",
         "We review the evidence from both sides, and we may ask you or the seller for more.",
         "If your request is approved, the refund goes to your **wallet** (or to the original payment method when possible).")),

    section("tips", "Tips to stay protected",
      ul("Pay only through TindaHan checkout. Never send money to “reserve” an item.",
         "Check photos and ask questions before you buy.",
         "Film or photograph the parcel when you open it, especially for expensive items.",
         "For meet-ups, use Safe Meet-Up spots and check the item before you confirm.",
         "Do not share your OTP, PIN or card details with anyone."))
  ]
};
