import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import CategoryBar from "./components/CategoryBar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";

import Home from "./pages/Home";
import SearchPage from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import ListingDetail from "./pages/ListingDetail";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import NewListing from "./pages/NewListing";
import HowItWorks from "./pages/HowItWorks";
import StaticPage from "./pages/StaticPage";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Checkout from "./pages/Checkout";
import SafeMeetUp from "./pages/SafeMeetUp";
import MakeOffer from "./pages/MakeOffer";

import Personalisation from "./pages/Personalisation";
import PreferredSizes from "./pages/PreferredSizes";
import Brands from "./pages/Brands";
import Members from "./pages/Members";
import PromotionTools from "./pages/PromotionTools";
import Wallet from "./pages/Wallet";
import Orders from "./pages/Orders";

import Donations from "./pages/Donations";
import TindaHanGuide from "./pages/TindaHanGuide";
import HolidayMode from "./pages/HolidayMode";
import BundleDiscounts from "./pages/BundleDiscounts";
import Badges from "./pages/Badges";

function AppLaunchLoader({ isLeaving }) {
  return (
    <div className={isLeaving ? "app-launch-loader leaving" : "app-launch-loader"}>
      <div className="app-launch-loader-inner">
        <div className="app-launch-logo">
          TindaHan
        </div>

        <div className="app-launch-spinner" aria-label="Loading TindaHan" />

        <p>Second-hand treasures across the Philippines</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="page">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();

  const [showLaunchLoader, setShowLaunchLoader] = useState(() => {
    return sessionStorage.getItem("tindahan_launch_loader_seen") !== "true";
  });

  const [loaderLeaving, setLoaderLeaving] = useState(false);

  useEffect(() => {
    if (!showLaunchLoader) return;

    const leaveTimer = setTimeout(() => {
      setLoaderLeaving(true);
    }, 950);

    const hideTimer = setTimeout(() => {
      sessionStorage.setItem("tindahan_launch_loader_seen", "true");
      setShowLaunchLoader(false);
    }, 1250);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(hideTimer);
    };
  }, [showLaunchLoader]);

  const isProductPage =
    location.pathname.startsWith("/item/") ||
    location.pathname.startsWith("/listing/") ||
    location.pathname.startsWith("/listings/") ||
    location.pathname.startsWith("/checkout/") ||
    location.pathname.startsWith("/safe-meetup/") ||
    location.pathname.startsWith("/offer/") ||
    location.pathname.startsWith("/welcome");

  return (
    <>
      {showLaunchLoader && <AppLaunchLoader isLeaving={loaderLeaving} />}

      <Navbar />
      <CategoryBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout/:id"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/offer/:id"
          element={
            <ProtectedRoute>
              <MakeOffer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/safe-meetup/:id"
          element={
            <ProtectedRoute>
              <SafeMeetUp />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/badges"
          element={
            <ProtectedRoute>
              <Badges />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donations"
          element={
            <ProtectedRoute>
              <Donations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tindahan-guide"
          element={
            <ProtectedRoute>
              <TindaHanGuide />
            </ProtectedRoute>
          }
        />

        <Route
          path="/holiday-mode"
          element={
            <ProtectedRoute>
              <HolidayMode />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bundle-discounts"
          element={
            <ProtectedRoute>
              <BundleDiscounts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/personalisation"
          element={
            <ProtectedRoute>
              <Personalisation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/personalisation/sizes"
          element={
            <ProtectedRoute>
              <PreferredSizes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/personalisation/brands"
          element={
            <ProtectedRoute>
              <Brands />
            </ProtectedRoute>
          }
        />

        <Route
          path="/personalisation/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />

        <Route
          path="/promotion-tools"
          element={
            <ProtectedRoute>
              <PromotionTools />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <NewListing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Navigate to="/settings/profile" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/:section"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="/item/:id" element={<ListingDetail />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/listings/:id" element={<ListingDetail />} />

        <Route path="/profile/:username" element={<Profile />} />

        <Route path="/about" element={<StaticPage title="About TindaHan" />} />
        <Route path="/sustainability" element={<StaticPage title="Sustainability" />} />
        <Route path="/press" element={<StaticPage title="Press" />} />
        <Route path="/advertising" element={<StaticPage title="Advertising" />} />
        <Route path="/accessibility" element={<StaticPage title="Accessibility" />} />
        <Route path="/item-verification" element={<StaticPage title="Item verification" />} />
        <Route path="/mobile-apps" element={<StaticPage title="Mobile apps" />} />
        <Route path="/dashboard" element={<StaticPage title="Dashboard" />} />
        <Route path="/help-center" element={<StaticPage title="Help Center" />} />
        <Route path="/buy" element={<StaticPage title="Buy" />} />
        <Route path="/trust-and-safety" element={<StaticPage title="Trust and safety" />} />
        <Route path="/privacy" element={<StaticPage title="Privacy Center" />} />
        <Route path="/cookies" element={<StaticPage title="Cookie Policy" />} />
        <Route path="/cookie-settings" element={<StaticPage title="Cookie Settings" />} />
        <Route path="/terms" element={<StaticPage title="Terms and Conditions" />} />
        <Route path="/platform" element={<StaticPage title="Our platform" />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />

      {!isProductPage && <MobileBottomNav />}
    </>
  );
}