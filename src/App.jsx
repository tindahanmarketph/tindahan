import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import CategoryBar from "./components/CategoryBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDetail from "./pages/ListingDetail";
import Profile from "./pages/Profile";
import NewListing from "./pages/NewListing";
import HowItWorks from "./pages/HowItWorks";

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}