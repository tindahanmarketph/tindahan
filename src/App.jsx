import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import CategoryBar from "./components/CategoryBar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDetail from "./pages/ListingDetail";
import Profile from "./pages/Profile";
import NewListing from "./pages/NewListing";
import HowItWorks from "./pages/HowItWorks";
import StaticPage from "./pages/StaticPage";

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
  return (
    <>
      <Navbar />
      <CategoryBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <NewListing />
            </ProtectedRoute>
          }
        />

        <Route path="/item/:id" element={<ListingDetail />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/listings/:id" element={<ListingDetail />} />

        <Route path="/profile/:username" element={<Profile />} />

        {/* Footer pages */}
        <Route
          path="/about"
          element={<StaticPage title="About TindaHan" />}
        />
        <Route
          path="/sustainability"
          element={<StaticPage title="Sustainability" />}
        />
        <Route
          path="/press"
          element={<StaticPage title="Press" />}
        />
        <Route
          path="/advertising"
          element={<StaticPage title="Advertising" />}
        />
        <Route
          path="/accessibility"
          element={<StaticPage title="Accessibility" />}
        />
        <Route
          path="/item-verification"
          element={<StaticPage title="Item verification" />}
        />
        <Route
          path="/mobile-apps"
          element={<StaticPage title="Mobile apps" />}
        />
        <Route
          path="/dashboard"
          element={<StaticPage title="Dashboard" />}
        />
        <Route
          path="/help-center"
          element={<StaticPage title="Help Center" />}
        />
        <Route
          path="/buy"
          element={<StaticPage title="Buy" />}
        />
        <Route
          path="/trust-and-safety"
          element={<StaticPage title="Trust and safety" />}
        />
        <Route
          path="/privacy"
          element={<StaticPage title="Privacy Center" />}
        />
        <Route
          path="/cookies"
          element={<StaticPage title="Cookie Policy" />}
        />
        <Route
          path="/cookie-settings"
          element={<StaticPage title="Cookie Settings" />}
        />
        <Route
          path="/terms"
          element={<StaticPage title="Terms and Conditions" />}
        />
        <Route
          path="/platform"
          element={<StaticPage title="Our platform" />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  );
}