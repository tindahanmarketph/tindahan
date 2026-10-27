import { p, ul, ol, note, table } from "./blocks";
import { CONTACT_EMAIL, DTI_HOTLINE } from "./site";

const MAIL = `[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`;

export const HELP_CATEGORIES = [
  { id: "start", title: "Getting started", icon: "Rocket", blurb: "Account, beta and the basics" },
  { id: "buying", title: "Buying", icon: "ShoppingBag", blurb: "Offers, checkout, fees" },
  { id: "selling", title: "Selling", icon: "Tag", blurb: "Listings, prices, photos" },
  { id: "shipping", title: "Delivery and meet-ups", icon: "Truck", blurb: "Couriers, labels, tracking" },
  { id: "payments", title: "Payments and wallet", icon: "Wallet", blurb: "GCash, Maya, refunds" },
  { id: "safety", title: "Safety and scams", icon: "ShieldCheck", blurb: "Stay protected" },
  { id: "account", title: "Account and privacy", icon: "UserRound", blurb: "Settings, privacy, data" }
];

export const HELP_ARTICLES = [
  /* ---------- Getting started ---------- */
  { slug: "what-is-tindahan", cat: "start", q: "What is TindaHan?", a: [
    p("TindaHan is a second-hand marketplace in the Philippines. People sell what they no longer use and buy pre-loved items directly from each other, at fair prices."),
    ul("**0% seller fees.** Listing and selling are free.", "**Buyer Protection** (8%) on purchases paid through checkout.", "**Local ways to pay and receive:** GCash, Maya, couriers and Safe Meet-Up spots.")] },
  { slug: "beta", cat: "start", q: "TindaHan is in beta. What does that mean?", a: [
    p("We are launching step by step. Some features, such as secure payments and delivery, are being switched on progressively and may be limited or simulated for now. The app tells you when a feature is not available yet."),
    p("Your feedback helps us. Write to " + MAIL + " or follow us on Instagram and Facebook.")] },
  { slug: "create-account", cat: "start", q: "How do I create an account?", a: [
    ol("Tap **Sign up** and enter your username, e-mail and password.", "Confirm your e-mail if we ask.", "Complete your profile: photo, bio and city.", "Add your mobile number and verify it in **Settings → Account settings**."),
    p("You must be at least 18 years old.")] },
  { slug: "verify-phone", cat: "start", q: "How do I verify my mobile number?", a: [
    p("Go to **Settings → Account settings**, enter your mobile number (for example 09XX XXX XXXX) and confirm with the code you receive. A verified number helps with deliveries and builds trust.")] },
  { slug: "beta-faq-trouble", cat: "start", q: "Something does not work. What should I do?", a: [
    ul("Refresh the page, or close and reopen the app.", "Check your internet connection.", "Update your browser.", "If it continues, write to " + MAIL + " with a screenshot and the page you were on.")] },

  /* ---------- Buying ---------- */
  { slug: "how-to-buy", cat: "buying", q: "How do I buy an item?", a: [
    ol("Open the listing and read the description and photos.", "Message the seller if you have questions.", "Tap **Buy now**, or **Make an offer**.", "Choose delivery or a Safe Meet-Up, then pay with GCash or Maya.", "Receive the item, check it and confirm.")] },
  { slug: "make-an-offer", cat: "buying", q: "How do offers work?", a: [
    p("Tap **Make an offer** on a listing and propose a price in pesos. The seller can accept, decline or answer with another price. If your offer is accepted, you can complete the purchase through checkout."),
    ul("Be fair: very low offers are often declined.", "The Buyer Protection fee is added to the accepted price.")] },
  { slug: "buyer-protection-fee", cat: "buying", q: "What is the Buyer Protection fee?", a: [
    p("It is **8% of the item price**, shown before you pay. It helps cover secure payment support and issue handling. Sellers pay no fees. See [Buyer Protection](/buyer-protection)."),
    p("Example: an item at ₱1,000 costs ₱1,080 with protection, before delivery.")] },
  { slug: "what-if-item-not-as-described", cat: "buying", q: "The item is not as described. What can I do?", a: [
    ol("Do not confirm the order.", "Open the order and choose **Refund request**.", "Select the reason, add photos and explain the problem within 2 days after delivery.", "We review the case. If it is approved, you are refunded to your wallet."),
    p("See [Buyer Protection](/buyer-protection) for what is covered.")] },
  { slug: "sizes-and-measurements", cat: "buying", q: "How do I check sizes?", a: [
    p("Sizes differ between brands and countries (S/M/L, US, UK, EU, Philippine size labels, or “free size”). Ask the seller for measurements in cm or inches, such as chest, waist and length, and compare with a similar item you own. Save your sizes in **Personalisation → Categories and sizes** to see better matches.")] },

  /* ---------- Selling ---------- */
  { slug: "what-can-i-sell", cat: "selling", q: "What can I sell on TindaHan?", a: [
    p("You can sell **pre-loved physical items that belong to you**: clothes, shoes, bags, gadgets, home items, kids’ items, hobbies, books, beauty items (sealed or unused), sports gear, local and cultural items and more."),
    p("You cannot sell weapons, drugs, tobacco and vapes, counterfeit goods, medicines, wildlife, stolen items and the other items listed in the [prohibited items](/community-guidelines#prohibited).")] },
  { slug: "list-an-item", cat: "selling", q: "How do I list an item?", a: [
    ol("Tap **Sell**.", "Add up to the maximum photos, in good light.", "Write a clear title and description: brand, size, condition, flaws.", "Choose the category, condition and price in pesos.", "Choose delivery options and publish."),
    p("Listing is free.")] },
  { slug: "good-photos", cat: "selling", q: "How do I take good photos?", a: [
    ul("Use **natural light** near a window, not the flash.", "Plain background: a bed sheet, a table or a wall.", "Show the front, back, label, size tag and any flaws.", "For clothes, lay them flat or hang them. For bags and shoes, show inside and soles.", "Clean the item first.")] },
  { slug: "set-the-right-price", cat: "selling", q: "How do I set the right price?", a: [
    ul("Look at **similar items** on TindaHan: same brand, size and condition.", "A common starting point for used items is **30% to 70% of the new price**, depending on condition and demand.", "Leave a little room for offers, for example 5% to 10%.", "Be clear about extras: box, receipt, accessories.", "Lower the price after a few weeks if there is no interest.")] },
  { slug: "sell-faster", cat: "selling", q: "How can I sell faster?", a: [
    ul("Use bright photos and honest descriptions.", "Reply to messages quickly. Buyers often choose the fastest seller.", "Price fairly and accept reasonable offers.", "Offer **bundle discounts** to sell several items at once.", "List more items: closets with more items get more visits.", "Ship within 24 hours to earn the Fast Shipping badge.")] },
  { slug: "what-is-a-boost", cat: "selling", q: "What is a boost?", a: [
    p("A boost promotes a listing so more buyers see it. Promotion tools are **coming soon** to TindaHan. When they are available, you will find them in **Promotion tools** in your profile, with clear prices and results before you pay.")] },
  { slug: "bundle-discounts", cat: "selling", q: "What are bundle discounts?", a: [
    p("Bundle discounts let buyers pay less when they buy several items from you, for example 5% off for 2 items and 10% for 3. They help you sell more and save on shipping. Set them in **Settings → Bundle discounts**.")] },
  { slug: "holiday-mode", cat: "selling", q: "What is Holiday mode?", a: [
    p("Holiday mode hides your items while you are away, for example during Holy Week, Undas, or a trip home to the province. Turn it on in **Holiday mode** in your profile, and turn it off when you are back.")] },
  { slug: "taxes", cat: "selling", q: "Do I have to pay taxes on what I sell?", a: [
    p("Selling your own used belongings occasionally is different from running an online business. If you sell regularly to earn income, you may need to register with the DTI or SEC and the BIR and pay taxes. You are responsible for your own tax obligations. For advice, ask a tax professional or the BIR."),
    p("TindaHan may ask for business details in the future if the law requires.")] },

  /* ---------- Delivery ---------- */
  { slug: "who-pays-shipping", cat: "shipping", q: "Who pays for shipping?", a: [
    p("Usually the **buyer** pays shipping. The cost is shown at checkout before you pay and depends on the courier, the parcel size and the distance. Sellers can choose to offer free shipping by including it in the price."),
    ul("Meet-ups have no shipping cost.", "Parcels between islands can cost more and take longer.")] },
  { slug: "ship-an-item", cat: "shipping", q: "How do I ship an item?", a: [
    ol("When you receive an order, open it in **My sales and purchases**.", "Pack the item well.", "Choose the courier and download the **shipping label**.", "Print it or write the details clearly on the parcel.", "Drop the parcel at the partner point (for example J&T Express, Ninja Van or LBC Express) or schedule a pick-up where it is available.", "Track it from your order page."),
    p("Ship within 24 hours to earn the Fast Shipping badge.")] },
  { slug: "parcel-size", cat: "shipping", q: "How do I choose the right parcel size?", a: [
    p("Pick the size that fits the **packed** item. Measure the length, width and height of the parcel, and weigh it. If you choose a size that is too small, the courier may refuse or charge more. If it is too big, you pay more than needed."),
    table(["Item", "Usually fits"], [["T-shirt, small accessories", "Small"], ["Jeans, shoes, small bag", "Medium"], ["Jacket, large bag, small appliance", "Large"]]),
    p("Always check the courier’s current size and weight limits.")] },
  { slug: "track-parcel", cat: "shipping", q: "How do I track my parcel?", a: [
    p("Open **My sales and purchases** and select the order. You will see events such as label created, dropped off, in transit, ready for pickup, out for delivery and delivered.")] },
  { slug: "typhoon-delays", cat: "shipping", q: "My parcel is late. Is it lost?", a: [
    p("Parcels can be delayed by typhoons, floods, holidays, or because the destination is on another island. Check the estimated delivery date in your order. If the parcel is much later than that date, contact us from the order page."),
    ul("Do not open a dispute before the estimated date has passed.", "Keep your tracking number.")] },
  { slug: "safe-meetup", cat: "shipping", q: "How do Safe Meet-Ups work?", a: [
    ol("Choose **Meet-up** at checkout and pick a Safe Meet-Up spot (a public, busy place such as a mall).", "The seller accepts or suggests another spot or time.", "Meet, check the item, and only then confirm."),
    ul("Go in daylight and tell a friend.", "Test gadgets and try on clothes.", "Never agree to a private place.")] },

  /* ---------- Payments ---------- */
  { slug: "pay-gcash-maya", cat: "payments", q: "How do I pay with GCash or Maya?", a: [
    p("At checkout, choose **GCash** or **Maya**, then follow the steps to approve the payment in your wallet app. We do not see your PIN or OTP. Your payment is held until the order is delivered or handed over and you confirm."),
    note("Payments are being rolled out with the beta. If a method is not available yet, the app tells you.", "info")] },
  { slug: "how-wallet-works", cat: "payments", q: "How does the wallet work?", a: [
    p("Your **TindaHan wallet** shows money from your sales and refunds."),
    ul("**Pending amount:** orders that are not completed yet.", "**Available balance:** money you can use to buy on TindaHan or transfer when payouts are available.", "**Refunds:** approved refunds are returned to your wallet."),
    p("Transfers to GCash, Maya or a bank account are being prepared.")] },
  { slug: "refund-time", cat: "payments", q: "When will I get my refund?", a: [
    p("When a refund is approved, it goes to your wallet. The time can vary, and we show the status in the order page. If you have not seen it after the stated time, write to us.")] },
  { slug: "payment-failed", cat: "payments", q: "My payment failed. What now?", a: [
    ul("Check your wallet balance and your internet connection.", "Try again, or use the other payment method.", "If money left your wallet but the order is not paid, keep the reference number and write to " + MAIL + ".")] },

  /* ---------- Safety ---------- */
  { slug: "avoid-scams", cat: "safety", q: "How do I avoid scams?", a: [
    ul("Pay only through TindaHan checkout. Never send money to “reserve” an item.", "Never share your OTP or PIN.", "Do not click links in chat that lead outside TindaHan.", "Be careful with prices that are too good to be true.", "Sellers: ship only when the order shows as paid in the app, not after a screenshot."),
    p("Read [Trust and safety](/trust-and-safety).")] },
  { slug: "report-a-problem", cat: "safety", q: "How do I report a member or a listing?", a: [
    p("Use **Report** on the listing, profile or message. You can also write to " + MAIL + " with the link and screenshots. If you are in danger, call **911**.")] },
  { slug: "consumer-complaints", cat: "safety", q: "Where else can I complain?", a: [
    p("Write to us first. You can also contact the Department of Trade and Industry (DTI) Consumer Care at **" + DTI_HOTLINE + "**. For personal data, contact the National Privacy Commission at privacy.gov.ph.")] },

  /* ---------- Account ---------- */
  { slug: "change-password", cat: "account", q: "How do I change my password?", a: [
    p("Go to **Settings → Security → Password**, enter a new password and save. Use at least 8 characters with letters and numbers. If you forgot your password, use **Forgot password** on the login page.")] },
  { slug: "change-address", cat: "account", q: "How do I add or change my address?", a: [
    p("Go to **Settings → Shipping → My address** and fill in your name, mobile number, street, barangay, city or municipality, province, region and postal code.")] },
  { slug: "my-data", cat: "account", q: "How do I download or delete my data?", a: [
    p("Go to **Settings → Privacy settings → Your data**. You can download a copy of your data and ask for your account to be deleted. You can also write to " + MAIL + ". See the [Protection Center](/privacy).")] },
  { slug: "contact-us", cat: "account", q: "How do I contact TindaHan?", a: [
    p("Write to " + MAIL + ". Please tell us your username, the order if any, and what happened. You can also message us on [Instagram](https://www.instagram.com/tinda_han_official/) or [Facebook](https://www.facebook.com/profile.php?id=61594957387328).")] }
];

export const GUIDE_ITEMS = [
  { label: "Who pays for shipping?", slug: "who-pays-shipping" },
  { label: "What can you sell on TindaHan?", slug: "what-can-i-sell" },
  { label: "How to sell items faster?", slug: "sell-faster" },
  { label: "How to list an item?", slug: "list-an-item" },
  { label: "What is a boost?", slug: "what-is-a-boost" },
  { label: "How to ship an item?", slug: "ship-an-item" },
  { label: "How to set the right price?", slug: "set-the-right-price" },
  { label: "How to choose the right parcel size?", slug: "parcel-size" },
  { label: "How does the wallet work?", slug: "how-wallet-works" }
];

export const getArticle = (slug) => HELP_ARTICLES.find((a) => a.slug === slug);
