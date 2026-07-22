import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import SearchPage from "../pages/SearchPage.jsx";
import ActivityDetailPage from "../pages/ActivityDetailPage.jsx";
import ProductDetailPage from "../pages/ProductDetailPage.jsx";
import GroupBuyDetailPage from "../pages/GroupBuyDetailPage.jsx";
import GroupLeaderProfilePage from "../pages/GroupLeaderProfilePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activities/:activityId" element={<ActivityDetailPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/group-buys/:groupBuyId" element={<GroupBuyDetailPage />} />
        <Route path="/group-leaders/:groupLeaderId" element={<GroupLeaderProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
