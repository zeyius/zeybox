import { Routes, Route } from "react-router-dom";
import SiteLayout from "./layouts/SiteLayout";
import Home from "./pages/Home";
import BestSellers from "./pages/BestSellers";
import GiftIdeas from "./pages/GiftIdeas";
import Enterprise from "./pages/Enterprise";
import Voucher from "./pages/Voucher";
import Login from "./pages/Login";
import BoxDetails from "./pages/BoxDetails";
import Account from "./pages/Account";
import AdminPartners from "./pages/AdminPartners";
import PartnerScan from "./pages/PartnerScan";
import PartnerLogin from "./pages/PartnerLogin";
import PartnerPage from "./pages/PartnerPage";
import QRPage from "./pages/QRPage";

export default function App() {
  return (
    <Routes>
      {/* Partner portal — standalone, no nav */}
      <Route path="/partner/scan" element={<PartnerScan />} />
      <Route path="/partner/login" element={<PartnerLogin />} />
      <Route path="/qr/:token" element={<QRPage />} />

      {/* Main site */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/best-sellers" element={<BestSellers />} />
        <Route path="/admin/partners" element={<AdminPartners />} />
        <Route path="/account" element={<Account />} />
        <Route path="/box/:id" element={<BoxDetails />} />
        <Route path="/partners/:slug" element={<PartnerPage />} />
        <Route path="/gift-ideas" element={<GiftIdeas />} />
        <Route path="/enterprise" element={<Enterprise />} />
        <Route path="/voucher" element={<Voucher />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  );
}