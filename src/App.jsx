import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CategoryBar from './components/CategoryBar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Sell from './pages/Sell'
import ItemDetail from './pages/ItemDetail'
import Profile from './pages/Profile'

export default function App() {
  return (
    <>
      <Navbar />
      <CategoryBar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <Sell />
              </ProtectedRoute>
            }
          />

          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/profile/:username" element={<Profile />} />
        </Routes>
      </main>
    </>
  )
}