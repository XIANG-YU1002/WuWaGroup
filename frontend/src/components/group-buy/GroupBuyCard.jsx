import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addFollowListItem } from "../../api/followList.js";
import { ApiError } from "../../api/client.js";
import Alert from "../common/Alert.jsx";
import Button from "../common/Button.jsx";
import ConfirmModal from "../common/ConfirmModal.jsx";
import StatusBadge from "../common/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const PAYMENT_METHOD_LABELS = {
  bank_transfer: "銀行匯款",
  cash_on_delivery: "貨到付款／取貨付款",
  other: "其他",
};

const CONTACT_PLATFORM_LABELS = {
  facebook: "Facebook",
  discord: "Discord",
  line: "LINE",
};

const UNAVAILABLE_REASON_LABELS = {
  closed: "此開團已結單",
  expired: "此開團已截止",
  activity_ended: "此活動已結束",
  full: "此開團已額滿",
};

function formatDeadline(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

export default function GroupBuyCard({ groupBuy }) {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [conflict, setConflict] = useState(null);

  const maxQuantity = Math.max(groupBuy.available_quantity, 1);

  async function submitAddToFollowList(replaceExisting) {
    setSubmitting(true);
    setFeedback(null);
    try {
      await addFollowListItem(
        {
          group_buy_product_id: groupBuy.group_buy_product_id,
          quantity,
          replace_existing: replaceExisting,
        },
        token,
      );
      setFeedback({ type: "success", message: "已加入跟團清單。" });
      setConflict(null);
    } catch (err) {
      if (err instanceof ApiError && err.code === "FOLLOW_LIST_GROUP_BUY_CONFLICT") {
        setConflict(true);
      } else if (err instanceof ApiError && err.code === "INSUFFICIENT_AVAILABLE_QUANTITY") {
        setFeedback({ type: "error", message: "目前可接受數量不足，請調整數量後再送出。" });
      } else {
        setFeedback({ type: "error", message: "加入跟團清單時發生錯誤，請稍後再試。" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleAddClick() {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { redirectPath: location.pathname, message: "請先登入後使用跟團清單功能。" },
      });
      return;
    }
    submitAddToFollowList(false);
  }

  return (
    <div className="group-buy-card">
      <div className="group-buy-card-row">
        <Link to={`/group-leaders/${groupBuy.group_leader.id}`}>
          {groupBuy.group_leader.display_name}
        </Link>
        <StatusBadge domain="groupBuyEffective" value={groupBuy.effective_status} />
      </div>

      <dl className="detail-list">
        <dt>團購價格</dt>
        <dd>NT$ {groupBuy.unit_price}</dd>

        <dt>付款方式</dt>
        <dd>
          {PAYMENT_METHOD_LABELS[groupBuy.payment_method]}
          {groupBuy.payment_method_note ? `（${groupBuy.payment_method_note}）` : ""}
        </dd>

        <dt>是否需要二補</dt>
        <dd>{groupBuy.requires_second_payment ? "需要" : "不需要"}</dd>

        <dt>是否包含滿贈</dt>
        <dd>{groupBuy.includes_full_gift ? "包含" : "不包含"}</dd>

        <dt>收單期限</dt>
        <dd>{formatDeadline(groupBuy.deadline_at)}</dd>

        <dt>主要聯絡平台</dt>
        <dd>{CONTACT_PLATFORM_LABELS[groupBuy.contact_platform]}</dd>
      </dl>

      <Link to={`/group-buys/${groupBuy.id}`}>查看團規</Link>

      {feedback && <Alert type={feedback.type}>{feedback.message}</Alert>}

      {groupBuy.is_available ? (
        <div className="group-buy-card-row" style={{ marginTop: "0.75rem" }}>
          <div className="quantity-stepper">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="減少數量"
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={quantity >= maxQuantity}
              aria-label="增加數量"
            >
              +
            </button>
          </div>
          <Button onClick={handleAddClick} loading={submitting}>
            加入跟團清單
          </Button>
        </div>
      ) : (
        <div style={{ marginTop: "0.75rem" }}>
          <Button disabled>目前不可跟團</Button>
          <p className="helper-text">
            {UNAVAILABLE_REASON_LABELS[groupBuy.effective_status] ?? "目前不可跟團"}
          </p>
        </div>
      )}

      {conflict && (
        <ConfirmModal
          title="替換跟團清單"
          message="目前跟團清單屬於其他開團，確定要清空並改為加入此開團的商品嗎？"
          confirmLabel="確定替換"
          onCancel={() => setConflict(null)}
          onConfirm={() => submitAddToFollowList(true)}
          loading={submitting}
        />
      )}
    </div>
  );
}
