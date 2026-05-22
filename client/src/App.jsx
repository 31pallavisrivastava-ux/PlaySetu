import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import FacilitiesPage from './pages/FacilitiesPage.jsx';
import FacilityDetailPage from './pages/FacilityDetailPage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import AiChatPage from './pages/AiChatPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="facilities" element={<FacilitiesPage />} />
        <Route path="facilities/:id" element={<FacilityDetailPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="ai" element={<AiChatPage />} />
      </Route>
    </Routes>
  );
}
