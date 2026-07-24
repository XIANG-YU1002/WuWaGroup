import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addFavorite, removeFavorite } from "../../api/favorites.js";
import Button from "../common/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function FavoriteButton({ productId, initialFavorited }) {
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [submitting, setSubmitting] = useState(false);

  // 管理員全程在後台作業，前台僅供瀏覽；不提供收藏操作，避免產生無用資料。
  if (user?.permissions?.is_admin) {
    return null;
  }

  async function handleClick() {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { redirectPath: location.pathname, message: "請先登入後使用收藏功能。" },
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isFavorited) {
        await removeFavorite(productId, token);
        setIsFavorited(false);
      } else {
        await addFavorite(productId, token);
        setIsFavorited(true);
      }
    } catch {
      // 依 Server Is Source of Truth 原則：失敗時不變更畫面上的收藏狀態。
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button variant={isFavorited ? "secondary" : "primary"} loading={submitting} onClick={handleClick}>
      {isFavorited ? "已收藏" : "收藏商品"}
    </Button>
  );
}
