import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

export default function LogoutButton({ className, role, children = "登出", onBeforeConfirm }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  function handleConfirm() {
    setConfirming(false);
    onBeforeConfirm?.();
    logout();
    navigate("/");
  }

  return (
    <>
      <button type="button" className={className} role={role} onClick={() => setConfirming(true)}>
        {children}
      </button>
      {confirming && (
        <ConfirmModal
          title="登出確認"
          message="是否要登出？"
          confirmLabel="是"
          cancelLabel="否"
          danger
          onCancel={() => setConfirming(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
